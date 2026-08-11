import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { 
  getAllContacts, 
  getContactStats, 
  updateContactStatus, 
  respondToContact,
  deleteContact,
  uploadContactAttachment
} from '../../services/operations/contactAPI';

const AdminContacts = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, responded: 0, closed: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [attachments, setAttachments] = useState([]); // Now stores uploaded file metadata
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  // Color schemes for message cards
  const cardColors = [
    { bg: 'bg-gradient-to-br from-indigo-50 to-purple-50', border: 'border-indigo-200 hover:border-indigo-400', avatar: 'from-indigo-500 to-purple-600' },
    { bg: 'bg-gradient-to-br from-cyan-50 to-blue-50', border: 'border-cyan-200 hover:border-cyan-400', avatar: 'from-cyan-500 to-blue-600' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', border: 'border-emerald-200 hover:border-emerald-400', avatar: 'from-emerald-500 to-teal-600' },
    { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200 hover:border-amber-400', avatar: 'from-amber-500 to-orange-600' },
    { bg: 'bg-gradient-to-br from-pink-50 to-rose-50', border: 'border-pink-200 hover:border-pink-400', avatar: 'from-pink-500 to-rose-600' },
    { bg: 'bg-gradient-to-br from-violet-50 to-fuchsia-50', border: 'border-violet-200 hover:border-violet-400', avatar: 'from-violet-500 to-fuchsia-600' },
  ];

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [contactsRes, statsRes] = await Promise.all([
        getAllContacts({}, token),
        getContactStats(token)
      ]);
      
      setContacts(contactsRes?.data || []);   
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      'new': { label: 'New', bg: 'bg-blue-100', text: 'text-blue-600' },
      'read': { label: 'Read', bg: 'bg-purple-100', text: 'text-purple-600' },
      'responded': { label: 'Responded', bg: 'bg-amber-100', text: 'text-amber-600' },
      'closed': { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-600' }
    };
    return statusMap[status] || statusMap['new'];
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setActionLoading(true);
      await updateContactStatus(id, newStatus, token);
      toast.success(`Status updated to ${getStatusInfo(newStatus).label}`);
      fetchData();
      if (selectedContact?._id === id) {
        setSelectedContact(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Handle reply
  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Send message with pre-uploaded attachment metadata
      await respondToContact(selectedContact._id, replyMessage, attachments, token);
      toast.success('Reply sent successfully');
      setReplyMessage('');
      setAttachments([]);
      fetchData();
      setSelectedContact(prev => ({ ...prev, status: 'responded' }));
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      setActionLoading(true);
      await deleteContact(id, token);
      toast.success('Message deleted successfully');
      setSelectedContact(null);
      fetchData();
    } catch (error) {} finally {
      setActionLoading(false);
    }
  };

  // Handle file attachment - uploads immediately to Cloudinary
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Upload files to Cloudinary immediately
    setUploadingFiles(true);
    try {
      const uploadPromises = validFiles.map(file => uploadContactAttachment(file, token));
      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error) {} finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Get card color based on index
  const getCardColor = (index) => cardColors[index % cardColors.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-3xl sm:text-4xl text-indigo-500"></i>
          <p className="text-xs sm:text-sm text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-envelope text-white text-sm sm:text-base lg:text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Contact Messages</h1>
            <p className="text-xs sm:text-sm text-slate-500">View and respond to customer inquiries</p>
          </div>
        </div>
        <button className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2">
          <i className="fas fa-download"></i>
          <span>Export</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 animate-fadeIn">
        {[
          { label: 'Total Messages', value: stats.total, icon: 'fa-envelope', color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-100' },
          { label: 'New', value: stats.new, icon: 'fa-inbox', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-100' },
          { label: 'Responded', value: stats.responded, icon: 'fa-reply', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-100' },
          { label: 'Resolved', value: stats.closed, icon: 'fa-check-circle', color: 'from-green-500 to-emerald-600', bg: 'bg-green-100' }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-2.5 sm:p-3 lg:p-4 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <i className={`fas ${stat.icon} text-xs sm:text-sm lg:text-lg bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}></i>
              </div>
            </div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-500 truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters/Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mb-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm"></i>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-11 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-xs sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-xs sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="closed">Resolved</option>
          </select>
        </div>

        <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 mb-3 sm:mb-4">All Messages</h3>
        
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredContacts.map((contact, index) => {
              const colors = getCardColor(index);
              return (
                <div 
                  key={contact._id} 
                  className={`${colors.bg} border-2 ${colors.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer animate-fadeIn`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colors.avatar} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-sm sm:text-base">{contact.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{contact.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{contact.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg shadow-sm ${getStatusInfo(contact.status).bg} ${getStatusInfo(contact.status).text}`}>
                      {getStatusInfo(contact.status).label}
                    </span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs text-indigo-600 font-bold mb-1">{contact.subject}</p>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{contact.message}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                      View Details <i className="fas fa-arrow-right text-[8px]"></i>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <i className="fas fa-envelope text-4xl sm:text-5xl lg:text-6xl text-slate-300 mb-3"></i>
            <p className="text-xs sm:text-sm text-slate-600">No messages found</p>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Message Details</h3>
                <button 
                  onClick={() => { setSelectedContact(null); setReplyMessage(''); }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-xs sm:text-sm"></i>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-base sm:text-lg">{selectedContact.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base text-slate-900">{selectedContact.name}</p>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedContact.email}</p>
                    {selectedContact.phone && <p className="text-xs text-slate-400">{selectedContact.phone}</p>}
                    {selectedContact.company && <p className="text-xs text-indigo-500 font-medium">{selectedContact.company}</p>}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs font-bold text-indigo-600 mb-1">SUBJECT</p>
                  <p className="text-sm sm:text-base text-slate-900 font-semibold">{selectedContact.subject}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs font-bold text-slate-500 mb-2">MESSAGE</p>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                {selectedContact.response?.message && (
                  <div className="bg-green-50 rounded-xl p-3 sm:p-4 border-l-4 border-green-500">
                    <p className="text-xs font-bold text-green-600 mb-2">YOUR RESPONSE</p>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{selectedContact.response.message}</p>
                    
                    {/* Display response attachments */}
                    {selectedContact.response.attachments?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs font-semibold text-green-600 mb-2">Attached Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact.response.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <i className={`fas ${(att.fileType || att.type)?.includes('pdf') ? 'fa-file-pdf text-red-500' : (att.fileType || att.type)?.includes('image') ? 'fa-file-image text-blue-500' : att.name?.endsWith('.doc') || att.name?.endsWith('.docx') ? 'fa-file-word text-blue-600' : 'fa-file text-slate-500'}`}></i>
                              <span className="truncate max-w-[120px]">{att.name}</span>
                              <i className="fas fa-external-link-alt text-[10px] text-slate-400"></i>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-slate-400 mt-2">
                      Sent on {new Date(selectedContact.response.respondedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                  <span><i className="fas fa-clock mr-2"></i>{new Date(selectedContact.createdAt).toLocaleString()}</span>
                  <span className={`font-bold px-2 py-1 rounded-lg ${getStatusInfo(selectedContact.status).bg} ${getStatusInfo(selectedContact.status).text}`}>
                    {getStatusInfo(selectedContact.status).label}
                  </span>
                </div>

                {/* Reply Section */}
                {selectedContact.status !== 'closed' && (
                  <div className="pt-3 sm:pt-4 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">REPLY TO CUSTOMER</label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm resize-none"
                      rows={4}
                    />
                    
                    {/* Attachment Section */}
                    <div className="mt-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="hidden"
                        disabled={uploadingFiles}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {uploadingFiles ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paperclip"></i>
                            Attach Documents
                          </>
                        )}
                      </button>
                      
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                              <i className="fas fa-check-circle text-green-500 text-xs"></i>
                              <i className={`fas ${(file.type || file.fileType)?.includes('pdf') ? 'fa-file-pdf text-red-500' : (file.type || file.fileType)?.includes('image') ? 'fa-file-image text-blue-500' : file.name?.endsWith('.doc') || file.name?.endsWith('.docx') ? 'fa-file-word text-blue-600' : file.name?.endsWith('.xls') || file.name?.endsWith('.xlsx') ? 'fa-file-excel text-green-600' : 'fa-file text-slate-500'}`}></i>
                              <span className="flex-1 text-xs text-slate-700 truncate">{file.name}</span>
                              <span className="text-[10px] text-green-600 font-medium">Uploaded</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="w-5 h-5 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-500 rounded-full text-[10px] transition-colors"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
                  {selectedContact.status !== 'closed' && (
                    <>
                      <button 
                        onClick={handleReply}
                        disabled={actionLoading || uploadingFiles || !replyMessage.trim()}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-reply"></i>
                        {actionLoading ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedContact._id, 'closed')}
                        disabled={actionLoading}
                        className="flex-1 bg-green-500 text-white px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i className="fas fa-check"></i>
                        Mark Resolved
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedContact._id)}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none bg-red-100 text-red-600 px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
