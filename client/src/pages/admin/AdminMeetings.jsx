import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { 
  getAllContacts, 
  updateContactStatus, 
  respondToContact,
  deleteContact
} from '../../services/operations/contactAPI';

const AdminMeetings = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Color schemes for meeting cards
  const cardColors = [
    { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200 hover:border-amber-400', avatar: 'from-amber-500 to-orange-600' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', border: 'border-emerald-200 hover:border-emerald-400', avatar: 'from-emerald-500 to-teal-600' },
    { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', border: 'border-blue-200 hover:border-blue-400', avatar: 'from-blue-500 to-indigo-600' },
    { bg: 'bg-gradient-to-br from-purple-50 to-violet-50', border: 'border-purple-200 hover:border-violet-400', avatar: 'from-purple-500 to-violet-600' },
    { bg: 'bg-gradient-to-br from-pink-50 to-rose-50', border: 'border-pink-200 hover:border-pink-400', avatar: 'from-pink-500 to-rose-600' },
  ];

  const fetchMeetings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await getAllContacts({ type: 'meeting' }, token);
      // Filter only meeting type contacts
      const meetingContacts = (response?.data || []).filter(c => c.type === 'meeting');
      setMeetings(meetingContacts);
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Parse meeting details from message
  const parseMeetingDetails = (message) => {
    const details = {
      meetingType: 'Demo',
      preferredDate: '',
      preferredTime: '',
      timezone: 'UTC',
      notes: ''
    };
    
    if (!message) return details;
    
    const lines = message.split('\n');
    lines.forEach(line => {
      if (line.startsWith('Meeting Type:')) details.meetingType = line.replace('Meeting Type:', '').trim();
      if (line.startsWith('Preferred Date:')) details.preferredDate = line.replace('Preferred Date:', '').trim();
      if (line.startsWith('Preferred Time:')) details.preferredTime = line.replace('Preferred Time:', '').trim();
      if (line.startsWith('Timezone:')) details.timezone = line.replace('Timezone:', '').trim();
      if (line.startsWith('Additional Notes:')) details.notes = line.replace('Additional Notes:', '').trim();
    });
    
    return details;
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format time nicely
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: meetings.length,
    new: meetings.filter(m => m.status === 'new').length,
    confirmed: meetings.filter(m => m.status === 'responded').length,
    completed: meetings.filter(m => m.status === 'closed').length
  };

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      'new': { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'fa-clock' },
      'read': { label: 'Reviewed', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'fa-eye' },
      'responded': { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700', icon: 'fa-check' },
      'closed': { label: 'Completed', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'fa-check-double' }
    };
    return statusMap[status] || statusMap['new'];
  };

  // Get meeting type icon and color
  const getMeetingTypeInfo = (type) => {
    const typeMap = {
      'demo': { icon: 'fa-desktop', color: 'text-blue-500', bg: 'bg-blue-100', label: 'Product Demo' },
      'Demo': { icon: 'fa-desktop', color: 'text-blue-500', bg: 'bg-blue-100', label: 'Product Demo' },
      'consultation': { icon: 'fa-comments', color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Consultation' },
      'support': { icon: 'fa-headset', color: 'text-amber-500', bg: 'bg-amber-100', label: 'Tech Support' },
      'partnership': { icon: 'fa-handshake', color: 'text-purple-500', bg: 'bg-purple-100', label: 'Partnership' },
      'other': { icon: 'fa-calendar', color: 'text-slate-500', bg: 'bg-slate-100', label: 'General' }
    };
    return typeMap[type?.toLowerCase()] || typeMap['other'];
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setActionLoading(true);
      await updateContactStatus(id, newStatus, token);
      toast.success(`Meeting ${getStatusInfo(newStatus).label.toLowerCase()}`);
      fetchMeetings();
      if (selectedMeeting?._id === id) {
        setSelectedMeeting(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Handle confirm meeting (send email)
  const handleConfirmMeeting = async () => {
    if (!selectedMeeting) return;
    
    try {
      setActionLoading(true);
      const meetingDetails = parseMeetingDetails(selectedMeeting.message);
      const confirmMessage = replyMessage || `Your meeting has been confirmed for ${formatDate(meetingDetails.preferredDate)} at ${formatTime(meetingDetails.preferredTime)} (${meetingDetails.timezone}). We look forward to speaking with you!`;
      
      await respondToContact(selectedMeeting._id, confirmMessage, [], token);
      toast.success('Meeting confirmed! Confirmation email sent.');
      setReplyMessage('');
      fetchMeetings();
      setSelectedMeeting(prev => ({ ...prev, status: 'responded' }));
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting request?')) return;
    
    try {
      setActionLoading(true);
      await deleteContact(id, token);
      toast.success('Meeting request deleted');
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Get card color based on index
  const getCardColor = (index) => cardColors[index % cardColors.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-3xl sm:text-4xl text-amber-500"></i>
          <p className="text-xs sm:text-sm text-slate-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-calendar-check text-white text-sm sm:text-base lg:text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Meeting Requests</h1>
            <p className="text-xs sm:text-sm text-slate-500">Manage scheduled meetings and demos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 sm:p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar text-white"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-3 sm:p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-white"></i>
            </div>
            <div>
              <p className="text-xs text-amber-600">Pending</p>
              <p className="text-xl font-bold text-amber-900">{stats.new}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 sm:p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-check text-white"></i>
            </div>
            <div>
              <p className="text-xs text-green-600">Confirmed</p>
              <p className="text-xl font-bold text-green-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-double text-white"></i>
            </div>
            <div>
              <p className="text-xs text-purple-600">Completed</p>
              <p className="text-xl font-bold text-purple-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="new">Pending</option>
          <option value="read">Reviewed</option>
          <option value="responded">Confirmed</option>
          <option value="closed">Completed</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Meetings List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="fas fa-list text-amber-500"></i>
            Meeting Requests ({filteredMeetings.length})
          </h2>
          
          {filteredMeetings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-times text-amber-500 text-2xl"></i>
              </div>
              <p className="text-slate-600 font-medium">No meeting requests found</p>
              <p className="text-sm text-slate-400 mt-1">New requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredMeetings.map((meeting, index) => {
                const colors = getCardColor(index);
                const statusInfo = getStatusInfo(meeting.status);
                const meetingDetails = parseMeetingDetails(meeting.message);
                const typeInfo = getMeetingTypeInfo(meetingDetails.meetingType);
                
                return (
                  <div
                    key={meeting._id}
                    onClick={() => setSelectedMeeting(meeting)}
                    className={`${colors.bg} rounded-xl p-4 border-2 ${colors.border} cursor-pointer transition-all ${
                      selectedMeeting?._id === meeting._id ? 'ring-2 ring-amber-500 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${colors.avatar} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                        {meeting.name?.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{meeting.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                            <i className={`fas ${statusInfo.icon} mr-1`}></i>
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-500 truncate mb-2">{meeting.email}</p>
                        
                        {/* Meeting Type Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                            <i className={`fas ${typeInfo.icon} mr-1`}></i>
                            {typeInfo.label}
                          </span>
                        </div>
                        
                        {/* Date & Time */}
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-calendar text-amber-500"></i>
                            {formatDate(meetingDetails.preferredDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-clock text-amber-500"></i>
                            {formatTime(meetingDetails.preferredTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meeting Detail Panel */}
        <div className="lg:sticky lg:top-4">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusInfo(selectedMeeting.status).bg} ${getStatusInfo(selectedMeeting.status).text}`}>
                    <i className={`fas ${getStatusInfo(selectedMeeting.status).icon} mr-1`}></i>
                    {getStatusInfo(selectedMeeting.status).label}
                  </span>
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className="fas fa-times text-white"></i>
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMeeting.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMeeting.name}</h2>
                    <p className="text-white/80 text-sm">{selectedMeeting.email}</p>
                    {selectedMeeting.company && (
                      <p className="text-white/70 text-xs mt-1">
                        <i className="fas fa-building mr-1"></i>
                        {selectedMeeting.company}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {(() => {
                  const details = parseMeetingDetails(selectedMeeting.message);
                  const typeInfo = getMeetingTypeInfo(details.meetingType);
                  
                  return (
                    <>
                      {/* Meeting Type */}
                      <div className={`${typeInfo.bg} rounded-xl p-4`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                            <i className={`fas ${typeInfo.icon} text-xl`}></i>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Meeting Type</p>
                            <p className={`font-bold ${typeInfo.color}`}>{typeInfo.label}</p>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <i className="fas fa-calendar-alt"></i>
                          Scheduled Time
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-amber-600">Date</p>
                            <p className="font-semibold text-amber-900">{formatDate(details.preferredDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-amber-600">Time</p>
                            <p className="font-semibold text-amber-900">{formatTime(details.preferredTime)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-amber-600">Timezone</p>
                            <p className="font-semibold text-amber-900">{details.timezone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <i className="fas fa-user"></i>
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <a href={`mailto:${selectedMeeting.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                            <i className="fas fa-envelope text-slate-400"></i>
                            {selectedMeeting.email}
                          </a>
                          {selectedMeeting.phone && (
                            <a href={`tel:${selectedMeeting.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                              <i className="fas fa-phone text-slate-400"></i>
                              {selectedMeeting.phone}
                            </a>
                          )}
                          {selectedMeeting.company && (
                            <p className="flex items-center gap-2 text-slate-600">
                              <i className="fas fa-building text-slate-400"></i>
                              {selectedMeeting.company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {details.notes && details.notes !== 'None' && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            <i className="fas fa-sticky-note"></i>
                            Additional Notes
                          </h4>
                          <p className="text-sm text-purple-700">{details.notes}</p>
                        </div>
                      )}

                      {/* Submitted Date */}
                      <p className="text-xs text-slate-400 text-center">
                        Requested on {new Date(selectedMeeting.createdAt).toLocaleString()}
                      </p>
                    </>
                  );
                })()}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  {selectedMeeting.status !== 'responded' && selectedMeeting.status !== 'closed' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Confirmation Message (optional)
                        </label>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Add a custom message to include in the confirmation email..."
                          rows="2"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none resize-none"
                        />
                      </div>
                      <button
                        onClick={handleConfirmMeeting}
                        disabled={actionLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <i className="fas fa-circle-notch fa-spin"></i>
                        ) : (
                          <>
                            <i className="fas fa-check"></i>
                            Confirm Meeting
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {selectedMeeting.status === 'responded' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedMeeting._id, 'closed')}
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                      ) : (
                        <>
                          <i className="fas fa-check-double"></i>
                          Mark as Completed
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selectedMeeting.email}`}
                      className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-envelope"></i>
                      Email
                    </a>
                    {selectedMeeting.phone && (
                      <a
                        href={`tel:${selectedMeeting.phone}`}
                        className="flex-1 bg-emerald-100 text-emerald-600 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-phone"></i>
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(selectedMeeting._id)}
                      disabled={actionLoading}
                      className="px-4 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-calendar-alt text-amber-500 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Meeting</h3>
              <p className="text-sm text-slate-500">Click on a meeting request to view details and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMeetings;
