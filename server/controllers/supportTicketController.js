const asyncHandler = require('express-async-handler');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const {
  sendTicketCreatedEmail,
  sendTicketReplyEmail,
  sendTicketAssignedEmail,
  sendTicketResolvedEmail
} = require('../config/email');
const { createMessageNotification, notifyAllAdmins } = require('../utils/notificationHelper');

// @desc    Get all tickets for logged in user
// @route   GET /api/support-tickets/my-tickets
// @access  Private
exports.getMyTickets = asyncHandler(async (req, res, next) => {
  const { status, category, page = 1, limit = 10 } = req.query;

  let query = { user: req.user.id };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  const total = await SupportTicket.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const tickets = await SupportTicket.find(query)
    .populate('assignedTo', 'name email adminRole')
    .populate('messages.sender', 'name email role adminRole')
    .sort('-updatedAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: tickets.length,
    total,
    pages,
    currentPage: parseInt(page),
    data: tickets
  });
});

// @desc    Get single ticket
// @route   GET /api/support-tickets/:id
// @access  Private
exports.getTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('user', 'name email phone company')
    .populate('assignedTo', 'name email adminRole')
    .populate('messages.sender', 'name email role adminRole avatar')
    .populate('relatedOrder', 'orderId pricing orderStatus')
    .populate('relatedQuote', 'quoteId status')
    .populate('relatedShipment', 'trackingNumber status');

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  // Check authorization - user can only view their own tickets unless admin
  if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    // Check if user is the assigned person
    if (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view this ticket', 401));
    }
  }

  // Mark messages as read
  if (req.user.role === 'admin' || (ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.id)) {
    // Admin/Assigned viewing - mark unread by admin as false
    ticket.hasUnreadByAdmin = false;
    ticket.messages.forEach(msg => {
      if (msg.senderRole === 'user' && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
    });
  } else {
    // User viewing - mark unread by user as false
    ticket.hasUnreadByUser = false;
    ticket.messages.forEach(msg => {
      if (msg.senderRole !== 'user' && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
    });
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Create new ticket
// @route   POST /api/support-tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res, next) => {
  const { subject, category, priority, department, message, relatedOrder, relatedQuote, relatedShipment } = req.body;

  // Create ticket with initial message
  const ticket = await SupportTicket.create({
    user: req.user.id,
    subject,
    category: category || 'general',
    priority: priority || 'medium',
    department: department || 'support',
    relatedOrder,
    relatedQuote,
    relatedShipment,
    messages: [{
      sender: req.user.id,
      senderRole: 'user',
      content: message
    }],
    lastReplyAt: new Date(),
    lastReplyBy: req.user.id,
    hasUnreadByAdmin: true,
    hasUnreadByUser: false
  });

  // Populate for response
  await ticket.populate('user', 'name email');

  // Send email notification to admin
  try {
    await sendTicketCreatedEmail({
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      department: ticket.department,
      customerName: req.user.name,
      customerEmail: req.user.email,
      message: message,
      createdAt: ticket.createdAt
    });
  } catch (emailError) {
    
  }

  // Notify admins about new ticket
  try {
    await notifyAllAdmins({
      type: 'message',
      title: 'New Support Ticket',
      message: `New support ticket "${ticket.subject}" from ${req.user.name}.`,
      icon: 'message-circle',
      color: 'blue',
      link: '/admin/support-tickets',
      priority: 'medium',
      metadata: { ticketId: ticket._id, subject: ticket.subject, customerName: req.user.name }
    });
  } catch (notifError) {
    
  }

  res.status(201).json({
    success: true,
    message: 'Support ticket created successfully',
    data: ticket
  });
});

// @desc    Reply to ticket
// @route   POST /api/support-tickets/:id/reply
// @access  Private
exports.replyToTicket = asyncHandler(async (req, res, next) => {
  const { message, attachments } = req.body;

  const ticket = await SupportTicket.findById(req.params.id)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email');

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.id;
  const isOwner = ticket.user._id.toString() === req.user.id;

  if (!isAdmin && !isAssigned && !isOwner) {
    return next(new ErrorResponse('Not authorized to reply to this ticket', 401));
  }

  // Determine sender role
  let senderRole = 'user';
  if (isAdmin) {
    senderRole = 'admin';
  } else if (isAssigned) {
    senderRole = 'assigned';
  }

  // Add message
  ticket.messages.push({
    sender: req.user.id,
    senderRole,
    content: message,
    attachments: attachments || []
  });

  ticket.lastReplyAt = new Date();
  ticket.lastReplyBy = req.user.id;

  // Update unread flags
  if (senderRole === 'user') {
    ticket.hasUnreadByAdmin = true;
    ticket.hasUnreadByUser = false;
  } else {
    ticket.hasUnreadByAdmin = false;
    ticket.hasUnreadByUser = true;
  }

  // If admin/assigned replies, update status to in-progress if it was open
  if ((isAdmin || isAssigned) && ticket.status === 'open') {
    ticket.status = 'in-progress';
  }

  // If user replies and status was waiting-reply, set to in-progress
  if (isOwner && ticket.status === 'waiting-reply') {
    ticket.status = 'in-progress';
  }

  await ticket.save();

  // Populate the new message sender
  await ticket.populate('messages.sender', 'name email role adminRole avatar');

  // Send email notification
  try {
    if (senderRole === 'user') {
      // Notify admin/assigned person
      const recipientEmail = ticket.assignedTo?.email || process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      const recipientName = ticket.assignedTo?.name || 'Support Team';
      
      await sendTicketReplyEmail({
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        recipientName,
        recipientEmail,
        senderName: req.user.name,
        message,
        isAdminNotification: true
      });
    } else {
      // Notify user
      await sendTicketReplyEmail({
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        recipientName: ticket.user.name,
        recipientEmail: ticket.user.email,
        senderName: req.user.name,
        senderRole: req.user.adminRole || 'Support Team',
        message,
        isAdminNotification: false
      });
    }
  } catch (emailError) {
    
  }

  // Create in-app notification
  try {
    if (senderRole === 'user') {
      // Notify admins
      await notifyAllAdmins({
        type: 'message',
        title: 'New Ticket Reply',
        message: `${req.user.name} replied to ticket "${ticket.subject}".`,
        icon: 'message-circle',
        color: 'blue',
        link: '/admin/support-tickets',
        priority: 'medium',
        metadata: { ticketId: ticket._id }
      });
    } else {
      // Notify ticket owner
      await createMessageNotification(ticket.user._id.toString(), {
        ticketId: ticket._id,
        subject: ticket.subject,
        from: req.user.name || 'Support Team'
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Reply added successfully',
    data: ticket
  });
});

// @desc    Update ticket status
// @route   PUT /api/support-tickets/:id/status
// @access  Private/Admin
exports.updateTicketStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const ticket = await SupportTicket.findById(req.params.id)
    .populate('user', 'name email');

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  const oldStatus = ticket.status;
  ticket.status = status;

  if (status === 'resolved') {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user.id;
    
    // Send resolution email
    try {
      await sendTicketResolvedEmail({
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        customerName: ticket.user.name,
        customerEmail: ticket.user.email,
        resolvedBy: req.user.name
      });
    } catch (emailError) {
      
    }
  }

  if (status === 'closed') {
    ticket.closedAt = new Date();
    ticket.closedBy = req.user.id;
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    message: `Ticket status updated to ${status}`,
    data: ticket
  });
});

// @desc    Assign ticket to user
// @route   PUT /api/support-tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = asyncHandler(async (req, res, next) => {
  const { assignedTo, assignedRole } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  // Get assigned user details
  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return next(new ErrorResponse('Assigned user not found', 404));
    }
  }

  ticket.assignedTo = assignedTo || null;
  ticket.assignedRole = assignedRole || null;

  // Update status if currently open
  if (ticket.status === 'open' && assignedTo) {
    ticket.status = 'in-progress';
  }

  await ticket.save();

  // Send email to assigned person
  if (assignedUser) {
    try {
      await sendTicketAssignedEmail({
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        assignedToName: assignedUser.name,
        assignedToEmail: assignedUser.email,
        assignedBy: req.user.name
      });
    } catch (emailError) {
      
    }
  }

  // Populate for response
  await ticket.populate('assignedTo', 'name email adminRole');

  res.status(200).json({
    success: true,
    message: assignedTo ? `Ticket assigned to ${assignedUser.name}` : 'Ticket unassigned',
    data: ticket
  });
});

// @desc    Close ticket
// @route   PUT /api/support-tickets/:id/close
// @access  Private
exports.closeTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  // User can close their own ticket, admin can close any
  if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to close this ticket', 401));
  }

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  ticket.closedBy = req.user.id;

  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket closed successfully',
    data: ticket
  });
});

// @desc    Rate resolved ticket
// @route   PUT /api/support-tickets/:id/rate
// @access  Private
exports.rateTicket = asyncHandler(async (req, res, next) => {
  const { score, feedback } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  // Only ticket owner can rate
  if (ticket.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to rate this ticket', 401));
  }

  // Can only rate resolved or closed tickets
  if (!['resolved', 'closed'].includes(ticket.status)) {
    return next(new ErrorResponse('Can only rate resolved or closed tickets', 400));
  }

  ticket.rating = {
    score,
    feedback,
    ratedAt: new Date()
  };

  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: ticket
  });
});

// @desc    Add internal note to ticket (Admin only)
// @route   POST /api/support-tickets/:id/notes
// @access  Private/Admin
exports.addInternalNote = asyncHandler(async (req, res, next) => {
  const { note } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  ticket.internalNotes.push({
    note,
    addedBy: req.user.id,
    addedAt: new Date()
  });

  await ticket.save();
  await ticket.populate('internalNotes.addedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Internal note added',
    data: ticket
  });
});

// @desc    Get all tickets (Admin)
// @route   GET /api/support-tickets
// @access  Private/Admin
exports.getAllTickets = asyncHandler(async (req, res, next) => {
  const { 
    status, 
    category, 
    priority, 
    department,
    assignedTo,
    search,
    page = 1, 
    limit = 20,
    sort = '-updatedAt'
  } = req.query;

  let query = {};

  // If not admin, only show tickets assigned to this user
  if (req.user.role !== 'admin') {
    query.$or = [
      { assignedTo: req.user.id },
      { assignedRole: req.user.adminRole }
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  if (department && department !== 'all') {
    query.department = department;
  }

  if (assignedTo && assignedTo !== 'all') {
    if (assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else {
      query.assignedTo = assignedTo;
    }
  }

  if (search) {
    query.$or = [
      { ticketId: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await SupportTicket.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const tickets = await SupportTicket.find(query)
    .populate('user', 'name email company')
    .populate('assignedTo', 'name email adminRole')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: tickets.length,
    total,
    pages,
    currentPage: parseInt(page),
    data: tickets
  });
});

// @desc    Get ticket statistics
// @route   GET /api/support-tickets/stats
// @access  Private/Admin
exports.getTicketStats = asyncHandler(async (req, res, next) => {
  const total = await SupportTicket.countDocuments();
  const open = await SupportTicket.countDocuments({ status: 'open' });
  const inProgress = await SupportTicket.countDocuments({ status: 'in-progress' });
  const waitingReply = await SupportTicket.countDocuments({ status: 'waiting-reply' });
  const resolved = await SupportTicket.countDocuments({ status: 'resolved' });
  const closed = await SupportTicket.countDocuments({ status: 'closed' });

  // Priority breakdown
  const urgent = await SupportTicket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } });
  const high = await SupportTicket.countDocuments({ priority: 'high', status: { $nin: ['resolved', 'closed'] } });

  // Unassigned tickets
  const unassigned = await SupportTicket.countDocuments({ 
    assignedTo: null, 
    status: { $nin: ['resolved', 'closed'] } 
  });

  // Department breakdown
  const departmentStats = await SupportTicket.aggregate([
    { $match: { status: { $nin: ['resolved', 'closed'] } } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  // Average resolution time (for resolved tickets in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const resolvedTickets = await SupportTicket.find({
    status: { $in: ['resolved', 'closed'] },
    resolvedAt: { $gte: thirtyDaysAgo }
  });

  let avgResolutionTime = 0;
  if (resolvedTickets.length > 0) {
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const resolutionTime = ticket.resolvedAt - ticket.createdAt;
      return sum + resolutionTime;
    }, 0);
    avgResolutionTime = Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // In hours
  }

  res.status(200).json({
    success: true,
    data: {
      total,
      open,
      inProgress,
      waitingReply,
      resolved,
      closed,
      urgent,
      high,
      unassigned,
      departmentStats,
      avgResolutionTime
    }
  });
});

// @desc    Get unread ticket count for user
// @route   GET /api/support-tickets/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  let count = 0;

  if (req.user.role === 'admin') {
    count = await SupportTicket.countDocuments({ hasUnreadByAdmin: true });
  } else {
    count = await SupportTicket.countDocuments({ 
      user: req.user.id, 
      hasUnreadByUser: true 
    });
  }

  res.status(200).json({
    success: true,
    data: { unreadCount: count }
  });
});

// @desc    Get staff members for assignment
// @route   GET /api/support-tickets/staff
// @access  Private/Admin
exports.getStaffForAssignment = asyncHandler(async (req, res, next) => {
  const staff = await User.find({
    role: 'admin',
    isActive: true
  }).select('name email adminRole');

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Delete ticket
// @route   DELETE /api/support-tickets/:id
// @access  Private/Admin
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id of ${req.params.id}`, 404));
  }

  await ticket.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Ticket deleted successfully',
    data: {}
  });
});
