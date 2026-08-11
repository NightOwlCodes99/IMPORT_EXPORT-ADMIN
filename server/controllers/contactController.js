const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const { ErrorResponse } = require('../middleware/error');
const { createAdminContactNotification } = require('../utils/notificationHelper');

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res, next) => {
  let query = Contact.find(req.queryFilter || {})
    .populate('assignedTo', 'name email')
    .populate('response.respondedBy', 'name');

  // Apply search
  if (req.searchQuery) {
    query = query.find({
      $or: [
        { name: { $regex: req.searchQuery, $options: 'i' } },
        { email: { $regex: req.searchQuery, $options: 'i' } },
        { subject: { $regex: req.searchQuery, $options: 'i' } }
      ]
    });
  }

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  }

  // Apply pagination
  query = query.skip(req.startIndex).limit(req.limit);

  const contacts = await query;

  res.status(200).json({
    success: true,
    count: contacts.length,
    pagination: req.pagination,
    data: contacts
  });
});

// @desc    Get single contact message
// @route   GET /api/contacts/:id
// @access  Private/Admin
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('response.respondedBy', 'name email');

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Mark as read if it's new
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Create contact message
// @route   POST /api/contacts
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
  // Add IP and user agent
  req.body.ipAddress = req.ip;
  req.body.userAgent = req.headers['user-agent'];

  const contact = await Contact.create(req.body);
  const emailStatus = {
    adminNotified: false,
    customerConfirmation: false
  };

  // Send email notifications and report actual delivery status
  try {
    const { sendContactMessageAdminNotification, sendContactMessageConfirmation } = require('../config/email');

    const [adminResult, customerResult] = await Promise.allSettled([
      sendContactMessageAdminNotification({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        subject: contact.subject,
        message: contact.message,
        type: contact.type,
        createdAt: contact.createdAt
      }),
      sendContactMessageConfirmation({
        name: contact.name,
        email: contact.email,
        subject: contact.subject
      })
    ]);

    if (adminResult.status === 'fulfilled') {
      emailStatus.adminNotified = adminResult.value?.success !== false;
    }

    if (customerResult.status === 'fulfilled') {
      emailStatus.customerConfirmation = customerResult.value?.success !== false;
    }

    if (adminResult.status === 'rejected') {
      
    }

    if (customerResult.status === 'rejected') {
      
    }
  } catch (emailError) {
    
  }

  // Create in-app notification for admins
  createAdminContactNotification({
    contactId: contact._id,
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    type: contact.type || 'general'
  }).catch(() => {});

  const allEmailsDelivered = emailStatus.adminNotified && emailStatus.customerConfirmation;

  res.status(201).json({
    success: true,
    message: allEmailsDelivered
      ? 'Your message has been received. We will get back to you soon!'
      : 'Your message was saved, but email delivery is delayed. Please check back shortly.',
    emailStatus,
    data: contact
  });
});

// @desc    Book a meeting
// @route   POST /api/contacts/book-meeting
// @access  Public
exports.bookMeeting = asyncHandler(async (req, res, next) => {
  const { name, email, phone, company, meetingType, preferredDate, preferredTime, timezone, notes } = req.body;

  // Validate required fields
  if (!name || !email || !preferredDate || !preferredTime) {
    return next(new ErrorResponse('Please provide name, email, preferred date and time', 400));
  }

  // Create a contact record for the meeting
  const meetingData = {
    name,
    email,
    phone: phone || '',
    company: company || '',
    subject: `Meeting Request: ${meetingType || 'Demo'}`,
    message: `Meeting Type: ${meetingType || 'Demo'}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\nTimezone: ${timezone || 'UTC'}\n\nAdditional Notes: ${notes || 'None'}`,
    type: 'meeting',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };

  const contact = await Contact.create(meetingData);

  // Send email notifications
  try {
    const { sendMeetingBookingConfirmation, sendMeetingBookingAdminNotification } = require('../config/email');
    
    // Send confirmation to customer
    sendMeetingBookingConfirmation({
      name,
      email,
      meetingType: meetingType || 'Demo',
      preferredDate,
      preferredTime,
      timezone: timezone || 'UTC',
      notes
    }).catch(() => {});

    // Send notification to admin
    sendMeetingBookingAdminNotification({
      name,
      email,
      phone,
      company,
      meetingType: meetingType || 'Demo',
      preferredDate,
      preferredTime,
      timezone: timezone || 'UTC',
      notes,
      createdAt: contact.createdAt
    }).catch(() => {});
  } catch (emailError) {
    
    // Don't fail the request if email fails
  }

  // Create in-app notification for admins
  createAdminContactNotification({
    contactId: contact._id,
    name,
    email,
    subject: `Meeting Request: ${meetingType || 'Demo'}`,
    type: 'meeting'
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Your meeting has been booked! Check your email for confirmation.',
    data: contact
  });
});

// @desc    Raise a query
// @route   POST /api/contacts/raise-query
// @access  Public
exports.raiseQuery = asyncHandler(async (req, res, next) => {
  const { name, email, phone, company, subject, message, queryType } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return next(new ErrorResponse('Please provide name, email, subject and message', 400));
  }

  // Create a contact record for the query
  const queryData = {
    name,
    email,
    phone: phone || '',
    company: company || '',
    subject: subject,
    message: message,
    type: 'query',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };

  const contact = await Contact.create(queryData);
  const emailStatus = {
    adminNotified: false,
    customerConfirmation: false
  };

  // Send email notifications and report actual delivery status
  try {
    const { sendQueryConfirmation, sendQueryAdminNotification } = require('../config/email');

    const [customerResult, adminResult] = await Promise.allSettled([
      sendQueryConfirmation({
        name,
        email,
        subject,
        message,
        queryType: queryType || 'general'
      }),
      sendQueryAdminNotification({
        name,
        email,
        phone,
        company,
        subject,
        message,
        queryType: queryType || 'general',
        createdAt: contact.createdAt
      })
    ]);

    if (customerResult.status === 'fulfilled') {
      emailStatus.customerConfirmation = customerResult.value?.success !== false;
    }

    if (adminResult.status === 'fulfilled') {
      emailStatus.adminNotified = adminResult.value?.success !== false;
    }

    if (customerResult.status === 'rejected') {
      
    }

    if (adminResult.status === 'rejected') {
      
    }
  } catch (emailError) {
    
  }

  // Create in-app notification for admins
  createAdminContactNotification({
    contactId: contact._id,
    name,
    email,
    subject,
    type: 'query'
  }).catch(() => {});

  const allEmailsDelivered = emailStatus.adminNotified && emailStatus.customerConfirmation;

  res.status(201).json({
    success: true,
    message: allEmailsDelivered
      ? 'Your query has been submitted! We\'ll get back to you within 24 hours.'
      : 'Your query was saved, but email delivery is delayed. Please check back shortly.',
    emailStatus,
    data: contact
  });
});

// @desc    Update contact status
// @route   PUT /api/contacts/:id/status
// @access  Private/Admin
exports.updateContactStatus = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  contact.status = req.body.status;
  await contact.save();

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Respond to contact
// @route   PUT /api/contacts/:id/respond
// @access  Private/Admin
exports.respondToContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  // Debug logging

  // Attachments are now pre-uploaded, receive them as JSON array
  let attachmentsList = [];
  if (req.body.attachments && Array.isArray(req.body.attachments) && req.body.attachments.length > 0) {
    // Map to ensure proper structure with explicit types
    attachmentsList = req.body.attachments.map(att => {
      const attachment = {
        name: att.name ? String(att.name) : '',
        url: att.url ? String(att.url) : '',
        publicId: att.publicId ? String(att.publicId) : '',
        fileType: att.type ? String(att.type) : (att.fileType ? String(att.fileType) : ''),
        size: att.size ? Number(att.size) : 0
      };
      
      return attachment;
    });
  }

  contact.response = {
    message: req.body.message,
    respondedBy: req.user.id,
    respondedAt: Date.now(),
    attachments: attachmentsList
  };
  contact.status = 'responded';

  await contact.save();

  // Send email response to customer
  try {
    const { sendContactResponseEmail } = require('../config/email');
    
    sendContactResponseEmail({
      customerName: contact.name,
      customerEmail: contact.email,
      originalSubject: contact.subject,
      originalMessage: contact.message,
      responseMessage: req.body.message,
      responderName: req.user?.name || 'Customer Support Team',
      attachments: attachmentsList
    }).catch(() => {});
  } catch (emailError) {
    
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Upload contact attachment to Cloudinary
// @route   POST /api/contacts/upload-attachment
// @access  Private/Admin
exports.uploadContactAttachment = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return next(new ErrorResponse('File size must be less than 10MB', 400));
  }

  // Upload to cloudinary
  const cloudinary = require('cloudinary').v2;
  const result = await cloudinary.uploader.upload(
    file.tempFilePath || `data:${file.mimetype};base64,${file.data.toString('base64')}`, 
    {
      folder: 'contact_attachments',
      resource_type: 'auto'
    }
  );

  res.status(200).json({
    success: true,
    data: {
      name: file.name,
      url: result.secure_url,
      publicId: result.public_id,
      type: file.mimetype,
      size: file.size
    }
  });
});

// @desc    Assign contact to user
// @route   PUT /api/contacts/:id/assign
// @access  Private/Admin
exports.assignContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  contact.assignedTo = req.body.assignedTo;
  await contact.save();

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Add note to contact
// @route   PUT /api/contacts/:id/notes
// @access  Private/Admin
exports.addNote = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  contact.notes.push({
    note: req.body.note,
    addedBy: req.user.id,
    addedAt: Date.now()
  });

  await contact.save();

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private/Admin
exports.getContactStats = asyncHandler(async (req, res, next) => {
  const totalContacts = await Contact.countDocuments();
  const newContacts = await Contact.countDocuments({ status: 'new' });
  const readContacts = await Contact.countDocuments({ status: 'read' });
  const respondedContacts = await Contact.countDocuments({ status: 'responded' });
  const closedContacts = await Contact.countDocuments({ status: 'closed' });

  // Get contacts by type
  const typeBreakdown = await Contact.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalContacts,
      new: newContacts,
      read: readContacts,
      responded: respondedContacts,
      closed: closedContacts,
      typeBreakdown
    }
  });
});
