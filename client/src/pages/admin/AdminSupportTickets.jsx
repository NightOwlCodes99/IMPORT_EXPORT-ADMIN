import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageCircle,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Send,
  ArrowLeft,
  User,
  RefreshCw,
  Star,
  MessageSquare,
  HelpCircle,
  Package,
  CreditCard,
  Truck,
  Settings,
  FileText,
  Users,
  BarChart3,
  UserCheck,
  StickyNote,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  getAllTickets, 
  getTicketById, 
  getTicketStats,
  getStaffForAssignment,
  replyToTicket, 
  updateTicketStatus,
  assignTicket,
  addInternalNote,
  deleteTicket
} from '../../services/operations/supportTicketAPI';
import toast from 'react-hot-toast';

const AdminSupportTickets = () => {
  const { token } = useSelector((state) => state.auth);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const messagesEndRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    fetchStats();
    fetchStaff();
  }, [token]);

  // Fetch tickets on filter change
  useEffect(() => {
    fetchTickets();
  }, [token, statusFilter, categoryFilter, priorityFilter, assignedFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await getTicketStats(token);
      setStats(response.data);
    } catch (error) {}
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaffForAssignment(token);
      setStaffList(response.data || []);
    } catch (error) {}
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(assignedFilter !== 'all' && { assignedTo: assignedFilter })
      };
      
      const response = await getAllTickets(token, params);
      setTickets(response.data || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  // Fetch single ticket
  const fetchTicketDetails = async (ticketId) => {
    try {
      setTicketLoading(true);
      const response = await getTicketById(ticketId, token);
      setSelectedTicket(response.data);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {} finally {
      setTicketLoading(false);
    }
  };

  // Reply to ticket
  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    try {
      setSendingReply(true);
      const response = await replyToTicket(selectedTicket._id, replyMessage, token);
      setSelectedTicket(response.data);
      setReplyMessage('');
      fetchTickets();
      fetchStats();
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {} finally {
      setSendingReply(false);
    }
  };

  // Update ticket status
  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    setPendingStatus(status);
    setShowStatusModal(true);
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!selectedTicket || !pendingStatus) return;
    
    try {
      await updateTicketStatus(selectedTicket._id, pendingStatus, token);
      setSelectedTicket({ ...selectedTicket, status: pendingStatus });
      toast.success(`Status updated to ${pendingStatus.replace('-', ' ')}`);
      fetchTickets();
      fetchStats();
    } catch (error) {toast.error('Failed to update status');
    } finally {
      setShowStatusModal(false);
      setPendingStatus(null);
    }
  };

  // Assign ticket
  const handleAssign = async () => {
    if (!selectedTicket || !selectedAssignee) return;
    
    try {
      const response = await assignTicket(selectedTicket._id, { assignedTo: selectedAssignee }, token);
      setSelectedTicket(response.data);
      setShowAssignModal(false);
      setSelectedAssignee('');
      fetchTickets();
    } catch (error) {}
  };

  // Add internal note
  const handleAddNote = async () => {
    if (!internalNote.trim() || !selectedTicket) return;
    
    try {
      const response = await addInternalNote(selectedTicket._id, internalNote, token);
      setSelectedTicket(response.data);
      setInternalNote('');
    } catch (error) {}
  };

  // Delete ticket
  const handleDelete = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await deleteTicket(ticketId, token);
      setSelectedTicket(null);
      fetchTickets();
      fetchStats();
    } catch (error) {}
  };

  // Status badge component
  const StatusBadge = ({ status, size = 'sm' }) => {
    const config = {
      'open': { bg: 'bg-blue-100', text: 'text-blue-800', icon: MessageSquare },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'waiting-reply': { bg: 'bg-purple-100', text: 'text-purple-800', icon: AlertCircle },
      'resolved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'closed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };
    
    const labels = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'waiting-reply': 'Awaiting Reply',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    
    const { bg, text, icon: Icon } = config[status] || config['open'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${bg} ${text}`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        {labels[status] || status}
      </span>
    );
  };

  // Priority badge
  const PriorityBadge = ({ priority }) => {
    const config = {
      'low': { bg: 'bg-gray-100', text: 'text-gray-600' },
      'medium': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-600' },
      'urgent': { bg: 'bg-red-100', text: 'text-red-600', pulse: true }
    };
    
    const { bg, text, pulse } = config[priority] || config['medium'];
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text} capitalize ${pulse ? 'animate-pulse' : ''}`}>
        {priority}
      </span>
    );
  };

  // Category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'general': HelpCircle,
      'order': Package,
      'payment': CreditCard,
      'shipping': Truck,
      'product': Package,
      'technical': Settings,
      'account': User,
      'other': FileText
    };
    return icons[category] || HelpCircle;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  // Filter tickets by search
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticketId?.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.user?.name?.toLowerCase().includes(query) ||
      ticket.user?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage customer support requests</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchTickets(); fetchStats(); }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Open</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.open || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.inProgress || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Waiting</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.waitingReply || 0}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Urgent</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.urgent || 0}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Unassigned</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats.unassigned || 0}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.resolved || 0}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 320px)' }}>
        <div className="flex h-full">
          {/* Ticket List */}
          <div className={`${selectedTicket ? 'hidden lg:flex' : 'flex'} w-full lg:w-[400px] flex-col border-r border-gray-100`}>
            {/* Filters */}
            <div className="p-4 space-y-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="waiting-reply">Awaiting Reply</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="shipping">Shipping</option>
                  <option value="product">Product</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                </select>
                <select
                  value={assignedFilter}
                  onChange={(e) => { setAssignedFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Staff</option>
                  <option value="unassigned">Unassigned</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-medium">No tickets found</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredTickets.map((ticket) => {
                    const CategoryIcon = getCategoryIcon(ticket.category);
                    return (
                      <button
                        key={ticket._id}
                        onClick={() => fetchTicketDetails(ticket._id)}
                        className={`w-full p-4 text-left transition-all rounded-xl ${
                          selectedTicket?._id === ticket._id 
                            ? 'bg-blue-50 ring-2 ring-blue-500 shadow-md' 
                            : 'bg-white border border-gray-100 hover:shadow-sm hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            ticket.hasUnreadByAdmin ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <CategoryIcon className={`w-4 h-4 ${
                              ticket.hasUnreadByAdmin ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-600">{ticket.ticketId}</span>
                              <span className="text-xs text-gray-500">{formatRelativeTime(ticket.updatedAt)}</span>
                            </div>
                            <h3 className={`text-sm font-medium truncate ${
                              ticket.hasUnreadByAdmin ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {ticket.subject}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {ticket.user?.name || 'Unknown'} • {ticket.user?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <StatusBadge status={ticket.status} />
                              <PriorityBadge priority={ticket.priority} />
                              {ticket.assignedTo ? (
                                <span className="text-xs text-gray-500">
                                  → {ticket.assignedTo.name?.split(' ')[0]}
                                </span>
                              ) : (
                                <span className="text-xs text-orange-500 font-medium">Unassigned</span>
                              )}
                            </div>
                          </div>
                          {ticket.hasUnreadByAdmin && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">{totalCount} tickets</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600">{currentPage}/{totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Conversation View */}
          <div className={`${selectedTicket ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
            {!selectedTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700">Select a ticket</h3>
                <p className="text-sm">Choose a ticket from the list to view details</p>
              </div>
            ) : ticketLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Ticket Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-blue-600">{selectedTicket.ticketId}</span>
                          <StatusBadge status={selectedTicket.status} size="md" />
                          <PriorityBadge priority={selectedTicket.priority} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h2>
                        <p className="text-sm text-gray-500 capitalize">{selectedTicket.category} • {selectedTicket.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => fetchTicketDetails(selectedTicket._id)}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                        title="Refresh"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowInternalNotes(!showInternalNotes)}
                        className={`p-2 rounded-lg ${showInternalNotes ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-200 text-gray-600'}`}
                        title="Internal Notes"
                      >
                        <StickyNote className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedTicket._id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Customer & Assignment Info */}
                  <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          <strong>{selectedTicket.user?.name}</strong> ({selectedTicket.user?.email})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTicket.assignedTo ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          <UserCheck className="w-4 h-4" />
                          {selectedTicket.assignedTo.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          Unassigned
                        </span>
                      )}
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200"
                      >
                        {selectedTicket.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-gray-500">Change Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting-reply">Waiting Reply</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Messages & Notes Area */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Messages */}
                  <div className={`flex-1 flex flex-col ${showInternalNotes ? 'border-r border-gray-100' : ''}`}>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                      {selectedTicket.messages?.map((message, index) => {
                        const isUser = message.senderRole === 'user';
                        return (
                          <div
                            key={message._id || index}
                            className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-[80%]`}>
                              <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-start' : 'justify-end'}`}>
                                {isUser && (
                                  <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {message.sender?.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                )}
                                <span className="text-xs font-medium text-gray-700">
                                  {isUser ? (message.sender?.name || 'Customer') : 'You'}
                                </span>
                                {!isUser && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded capitalize">
                                    {message.senderRole}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                              <div className={`p-4 rounded-2xl ${
                                isUser 
                                  ? 'bg-white text-gray-800 rounded-bl-md border border-gray-200' 
                                  : 'bg-blue-600 text-white rounded-br-md'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    {!['closed'].includes(selectedTicket.status) && (
                      <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-end gap-3">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            rows={2}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReply();
                              }
                            }}
                          />
                          <button
                            onClick={handleReply}
                            disabled={!replyMessage.trim() || sendingReply}
                            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl"
                          >
                            {sendingReply ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Internal Notes Sidebar */}
                  {showInternalNotes && (
                    <div className="w-80 flex flex-col bg-yellow-50">
                      <div className="p-4 border-b border-yellow-100">
                        <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                          <StickyNote className="w-4 h-4" />
                          Internal Notes
                        </h3>
                        <p className="text-xs text-yellow-600 mt-1">Only visible to staff</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedTicket.internalNotes?.length === 0 ? (
                          <p className="text-sm text-yellow-600 text-center py-4">No internal notes yet</p>
                        ) : (
                          selectedTicket.internalNotes?.map((note, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                              <p className="text-sm text-gray-700">{note.note}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {note.addedBy?.name || 'Staff'} • {formatDate(note.addedAt)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 border-t border-yellow-100">
                        <textarea
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                          placeholder="Add internal note..."
                          rows={2}
                          className="w-full px-3 py-2 border border-yellow-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={!internalNote.trim()}
                          className="mt-2 w-full py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-lg text-sm font-medium"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Display */}
                {selectedTicket.rating && (
                  <div className="px-6 py-3 bg-green-50 border-t border-green-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-green-800">Customer Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= selectedTicket.rating.score
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {selectedTicket.rating.feedback && (
                        <span className="text-sm text-green-700 italic">"{selectedTicket.rating.feedback}"</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Assign Ticket</h2>
              <p className="text-sm text-gray-500 mt-1">Select a staff member to handle this ticket</p>
            </div>
            <div className="p-6">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select staff member...</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} {staff.adminRole ? `(${staff.adminRole})` : ''} - {staff.email}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowAssignModal(false); setSelectedAssignee(''); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedAssignee}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Confirm Status Change</h2>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to change the ticket status?</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedTicket?.status?.replace('-', ' ')}</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">New Status</p>
                  <p className="font-medium text-blue-600 capitalize">{pendingStatus?.replace('-', ' ')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowStatusModal(false); setPendingStatus(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
