import { toast } from "react-hot-toast";
import { apiconnector } from "../apiconnector";
import { contactEndpoints } from "../apis";
import axios from "axios";

const {
  SUBMIT_CONTACT_API,
  BOOK_MEETING_API,
  RAISE_QUERY_API,
  GET_ALL_CONTACTS_API,
  GET_CONTACT_BY_ID_API,
  GET_CONTACT_STATS_API,
  UPDATE_CONTACT_STATUS_API,
  RESPOND_TO_CONTACT_API,
  ASSIGN_CONTACT_API,
  ADD_NOTE_API,
  DELETE_CONTACT_API,
  UPLOAD_ATTACHMENT_API,
} = contactEndpoints;

// Submit contact form (public)
export const submitContact = async (contactData) => {
  const toastId = toast.loading("Sending your message...");
  try {
    const response = await apiconnector("POST", SUBMIT_CONTACT_API, contactData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    const emailStatus = response.data?.emailStatus;
    const emailDelayed = emailStatus && (!emailStatus.adminNotified || !emailStatus.customerConfirmation);

    if (emailDelayed) {
      toast.error(response.data?.message || "Message saved, but email delivery is delayed.");
    } else {
      toast.success(response.data?.message || "Message sent successfully! We'll get back to you soon.");
    }

    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to send message");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Book a meeting (public)
export const bookMeeting = async (meetingData) => {
  const toastId = toast.loading("Booking your meeting...");
  try {
    const response = await apiconnector("POST", BOOK_MEETING_API, meetingData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Meeting booked successfully! Check your email for confirmation.");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to book meeting");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Raise a query (public)
export const raiseQuery = async (queryData) => {
  const toastId = toast.loading("Submitting your query...");
  try {
    const response = await apiconnector("POST", RAISE_QUERY_API, queryData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    const emailStatus = response.data?.emailStatus;
    const emailDelayed = emailStatus && (!emailStatus.adminNotified || !emailStatus.customerConfirmation);

    if (emailDelayed) {
      toast.error(response.data?.message || "Query saved, but email delivery is delayed.");
    } else {
      toast.success(response.data?.message || "Query submitted successfully! We'll respond within 24 hours.");
    }

    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to submit query");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get all contacts (admin only)
export const getAllContacts = async (params, token) => {
  try {
    const response = await apiconnector("GET", GET_ALL_CONTACTS_API, null, {
      Authorization: `Bearer ${token}`,
    }, params);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to fetch contacts");
    throw error;
  }
};

// Get single contact (admin only)
export const getContactById = async (id, token) => {
  try {
    const response = await apiconnector("GET", GET_CONTACT_BY_ID_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to fetch contact");
    throw error;
  }
};

// Get contact stats (admin only)
export const getContactStats = async (token) => {
  try {
    const response = await apiconnector("GET", GET_CONTACT_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to fetch contact stats");
    throw error;
  }
};

// Update contact status (admin only)
export const updateContactStatus = async (id, status, token) => {
  const toastId = toast.loading("Updating status...");
  try {
    const response = await apiconnector("PUT", UPDATE_CONTACT_STATUS_API(id), { status }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Status updated successfully!");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to update status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Upload contact attachment (admin only)
export const uploadContactAttachment = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(UPLOAD_ATTACHMENT_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data; // Returns { name, url, publicId, type, size }
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to upload attachment");
    throw error;
  }
};

// Respond to contact (admin only)
export const respondToContact = async (id, message, attachments, token) => {
  const toastId = toast.loading("Sending response...");
  try {
    // Ensure attachments is properly formatted
    const formattedAttachments = Array.isArray(attachments) 
      ? attachments.map(att => ({
          name: att.name,
          url: att.url,
          publicId: att.publicId,
          fileType: att.type || att.fileType,
          size: att.size
        }))
      : [];
    
    const response = await apiconnector("PUT", RESPOND_TO_CONTACT_API(id), { 
      message, 
      attachments: formattedAttachments 
    }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Response sent successfully!");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to send response");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Assign contact (admin only)
export const assignContact = async (id, userId, token) => {
  const toastId = toast.loading("Assigning contact...");
  try {
    const response = await apiconnector("PUT", ASSIGN_CONTACT_API(id), { assignedTo: userId }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Contact assigned successfully!");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to assign contact");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Add note to contact (admin only)
export const addNote = async (id, note, token) => {
  const toastId = toast.loading("Adding note...");
  try {
    const response = await apiconnector("PUT", ADD_NOTE_API(id), { note }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Note added successfully!");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to add note");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete contact (admin only)
export const deleteContact = async (id, token) => {
  const toastId = toast.loading("Deleting contact...");
  try {
    const response = await apiconnector("DELETE", DELETE_CONTACT_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Contact deleted successfully!");
    return response.data;
  } catch (error) {
toast.error(error.response?.data?.message || "Failed to delete contact");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};
