
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nexarion-production.vercel.app/api";

// AUTH ENDPOINTS
export const authEndpoints = {
  ADMIN_LOGIN_API: BASE_URL + "/auth/admin",
  ADMIN_VERIFY_OTP_API: BASE_URL + "/auth/admin-verify-otp",
  LOGOUT_API: BASE_URL + "/auth/logout",
  GET_ME_API: BASE_URL + "/auth/me",
  UPDATE_PROFILE_API: BASE_URL + "/auth/updatedetails",
  UPDATE_PASSWORD_API: BASE_URL + "/auth/updatepassword",
};

// ADMIN ENDPOINTS
export const adminEndpoints = {
  // Dashboard
  GET_ADMIN_DASHBOARD_API: BASE_URL + "/admin/dashboard/overview",
  GET_ADMIN_STATS_API: BASE_URL + "/admin/stats",
  
  // User Management
  GET_ALL_USERS_API: BASE_URL + "/admin/users",
  CREATE_ADMIN_USER_API: BASE_URL + "/admin/users",
  GET_USER_BY_ID_API: (id) => BASE_URL + `/admin/users/${id}`,
  UPDATE_USER_API: (id) => BASE_URL + `/admin/users/${id}`,
  DELETE_USER_API: (id) => BASE_URL + `/admin/users/${id}`,
  TOGGLE_USER_ACTIVE_API: (id) => BASE_URL + `/admin/users/${id}/toggle-active`,
  
  // Supplier Management
  GET_ALL_SUPPLIERS_API: BASE_URL + "/admin/suppliers",
  GET_SUPPLIER_DETAILS_API: (id) => BASE_URL + `/admin/suppliers/${id}`,
  CREATE_SUPPLIER_API: BASE_URL + "/admin/suppliers",
  APPROVE_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}/approve`,
  REJECT_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}/reject`,
  
  // Product Management
  GET_ALL_PRODUCTS_API: BASE_URL + "/admin/products",
  GET_PRODUCT_STATS_API: BASE_URL + "/admin/products/stats",
  GET_PRODUCT_BY_ID_API: (id) => BASE_URL + `/admin/products/${id}`,
  CREATE_PRODUCT_API: BASE_URL + "/admin/products",
  UPLOAD_PRODUCT_IMAGE_API: BASE_URL + "/admin/products/upload-image",
  UPDATE_PRODUCT_API: (id) => BASE_URL + `/admin/products/${id}`,
  DELETE_PRODUCT_API: (id) => BASE_URL + `/admin/products/${id}`,
  APPROVE_PRODUCT_API: (id) => BASE_URL + `/admin/products/${id}/approve`,
  REJECT_PRODUCT_API: (id) => BASE_URL + `/admin/products/${id}/reject`,
  TOGGLE_PRODUCT_ACTIVE_API: (id) => BASE_URL + `/admin/products/${id}/toggle-active`,
  TOGGLE_PRODUCT_FEATURED_API: (id) => BASE_URL + `/admin/products/${id}/toggle-featured`,
  
  // Order Management
  GET_ALL_ORDERS_API: BASE_URL + "/admin/orders",
  GET_ORDER_STATS_API: BASE_URL + "/admin/orders/stats",
  GET_ORDER_BY_ID_API: (id) => BASE_URL + `/admin/orders/${id}`,
  CREATE_ORDER_API: BASE_URL + "/admin/orders",
  UPDATE_ORDER_STATUS_API: (id) => BASE_URL + `/admin/orders/${id}/status`,
  DELETE_ORDER_API: (id) => BASE_URL + `/admin/orders/${id}`,
  
  // Payment Management
  GET_ALL_PAYMENTS_API: BASE_URL + "/payments",
  GET_PAYMENT_BY_ID_API: (id) => BASE_URL + `/payments/${id}`,
  GET_PAYMENT_STATS_API: BASE_URL + "/payments/stats",
  UPDATE_PAYMENT_STATUS_API: (id) => BASE_URL + `/payments/${id}/status`,
  PROCESS_REFUND_API: (id) => BASE_URL + `/payments/${id}/refund`,
  PROCESS_PAYOUT_API: (id) => BASE_URL + `/payments/${id}/payout`,
  GET_COMMISSION_BREAKDOWN_API: BASE_URL + "/payments/commission-breakdown",
  GET_PAYMENT_METHODS_DISTRIBUTION_API: BASE_URL + "/payments/methods-distribution",
  
  // Quote Management
  GET_ALL_QUOTES_API: BASE_URL + "/admin/quotes",
  GET_QUOTE_STATS_API: BASE_URL + "/admin/quotes/stats",
  GET_QUOTE_BY_ID_API: (id) => BASE_URL + `/admin/quotes/${id}`,
  CREATE_ADMIN_QUOTE_API: BASE_URL + "/admin/quotes",
  UPDATE_QUOTE_STATUS_API: (id) => BASE_URL + `/admin/quotes/${id}/status`,
  SEND_QUOTE_RESPONSE_API: (id) => BASE_URL + `/admin/quotes/${id}/respond`,
  ADMIN_ACCEPT_QUOTE_API: (id) => BASE_URL + `/admin/quotes/${id}/accept`,
  ASSIGN_QUOTE_API: (id) => BASE_URL + `/admin/quotes/${id}/assign`,
  CONVERT_QUOTE_TO_ORDER_API: (id) => BASE_URL + `/admin/quotes/${id}/convert-to-order`,
  CONTACT_BUYER_API: (id) => BASE_URL + `/admin/quotes/${id}/contact-buyer`,
  DELETE_QUOTE_API: (id) => BASE_URL + `/admin/quotes/${id}`,
  
  // Shipment Management
  GET_ALL_SHIPMENTS_API: BASE_URL + "/shipments",
  GET_SHIPMENT_BY_ID_API: (id) => BASE_URL + `/shipments/${id}`,
  CREATE_SHIPMENT_API: BASE_URL + "/shipments",
  UPDATE_SHIPMENT_API: (id) => BASE_URL + `/shipments/${id}`,
  DELETE_SHIPMENT_API: (id) => BASE_URL + `/shipments/${id}`,
  UPDATE_SHIPMENT_STATUS_API: (id) => BASE_URL + `/shipments/${id}/status`,
  ADD_TRACKING_UPDATE_API: (id) => BASE_URL + `/shipments/${id}/tracking`,
  GET_SHIPMENT_STATS_API: BASE_URL + "/shipments/stats",
  NOTIFY_CUSTOMER_API: (id) => BASE_URL + `/shipments/${id}/notify`,
  
  // Contact Management
  GET_ALL_CONTACTS_API: BASE_URL + "/admin/contacts",
};

// PRODUCT ENDPOINTS (Admin)
export const productEndpoints = {
  GET_ALL_PRODUCTS_API: BASE_URL + "/products",
  GET_PRODUCT_BY_ID_API: (id) => BASE_URL + `/products/${id}`,
  CREATE_PRODUCT_API: BASE_URL + "/products",
  UPDATE_PRODUCT_API: (id) => BASE_URL + `/products/${id}`,
  DELETE_PRODUCT_API: (id) => BASE_URL + `/products/${id}`,
  UPDATE_STOCK_API: (id) => BASE_URL + `/products/${id}/stock`,
  TOGGLE_FEATURED_API: (id) => BASE_URL + `/products/${id}/toggle-featured`,
  UPDATE_PRODUCT_SUMMARY_API: (id) => BASE_URL + `/products/${id}/summary`,
};

// CATEGORY ENDPOINTS
export const categoryEndpoints = {
  GET_ALL_CATEGORIES_API: BASE_URL + "/categories",
  GET_CATEGORY_BY_ID_API: (id) => BASE_URL + `/categories/${id}`,
  GET_CATEGORY_STATS_API: BASE_URL + "/categories/stats",
  GET_ADMIN_CATEGORIES_API: BASE_URL + "/categories/admin/all",
  CREATE_CATEGORY_API: BASE_URL + "/categories",
  UPDATE_CATEGORY_API: (id) => BASE_URL + `/categories/${id}`,
  DELETE_CATEGORY_API: (id) => BASE_URL + `/categories/${id}`,
  UPLOAD_CATEGORY_IMAGE_API: BASE_URL + "/categories/upload-image",
  TOGGLE_CATEGORY_ACTIVE_API: (id) => BASE_URL + `/categories/${id}/toggle-active`,
  TOGGLE_CATEGORY_FEATURED_API: (id) => BASE_URL + `/categories/${id}/toggle-featured`,
  TOGGLE_CATEGORY_HOT_API: (id) => BASE_URL + `/categories/${id}/toggle-hot`,
  TOGGLE_CATEGORY_TRENDING_API: (id) => BASE_URL + `/categories/${id}/toggle-trending`,
  TOGGLE_CATEGORY_NEW_API: (id) => BASE_URL + `/categories/${id}/toggle-new`,
  TOGGLE_CATEGORY_TOP_SELLING_API: (id) => BASE_URL + `/categories/${id}/toggle-top-selling`,
  UPDATE_CATEGORY_ORDER_API: (id) => BASE_URL + `/categories/${id}/order`,
  BULK_UPDATE_CATEGORY_ORDER_API: BASE_URL + "/categories/bulk-order",
  SYNC_PRODUCT_COUNTS_API: BASE_URL + "/categories/sync-counts",
};

// BRAND ENDPOINTS
export const brandEndpoints = {
  GET_ALL_BRANDS_API: BASE_URL + "/admin/brands",
  GET_BRAND_STATS_API: BASE_URL + "/admin/brands/stats",
  GET_BRAND_BY_ID_API: (id) => BASE_URL + `/admin/brands/${id}`,
  CREATE_BRAND_API: BASE_URL + "/admin/brands",
  UPDATE_BRAND_API: (id) => BASE_URL + `/admin/brands/${id}`,
  DELETE_BRAND_API: (id) => BASE_URL + `/admin/brands/${id}`,
  TOGGLE_BRAND_ACTIVE_API: (id) => BASE_URL + `/admin/brands/${id}/toggle-active`,
  TOGGLE_BRAND_FEATURED_API: (id) => BASE_URL + `/admin/brands/${id}/toggle-featured`,
  UPLOAD_BRAND_LOGO_API: BASE_URL + "/admin/brands/upload-logo",
};

// SUPPLIER ENDPOINTS (Admin)
export const supplierEndpoints = {
  GET_ALL_SUPPLIERS_API: BASE_URL + "/admin/suppliers",
  GET_SUPPLIER_BY_ID_API: (id) => BASE_URL + `/admin/suppliers/${id}`,
  CREATE_SUPPLIER_API: BASE_URL + "/admin/suppliers",
  UPDATE_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}`,
  DELETE_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}`,
  APPROVE_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}/approve`,
  REJECT_SUPPLIER_API: (id) => BASE_URL + `/admin/suppliers/${id}/reject`,
};

// ORDER ENDPOINTS (Admin)
export const orderEndpoints = {
  GET_ALL_ORDERS_API: BASE_URL + "/admin/orders",
  GET_ORDER_BY_ID_API: (id) => BASE_URL + `/admin/orders/${id}`,
  CREATE_ORDER_API: BASE_URL + "/admin/orders",
  UPDATE_ORDER_STATUS_API: (id) => BASE_URL + `/admin/orders/${id}/status`,
  DELETE_ORDER_API: (id) => BASE_URL + `/admin/orders/${id}`,
  GET_ORDER_STATS_API: BASE_URL + "/admin/orders/stats",
};

// QUOTE ENDPOINTS (Admin)
export const quoteEndpoints = {
  GET_ALL_QUOTES_API: BASE_URL + "/admin/quotes",
  GET_QUOTE_BY_ID_API: (id) => BASE_URL + `/admin/quotes/${id}`,
  CREATE_QUOTE_API: BASE_URL + "/admin/quotes",
  UPDATE_QUOTE_STATUS_API: (id) => BASE_URL + `/admin/quotes/${id}/status`,
  SEND_QUOTE_RESPONSE_API: (id) => BASE_URL + `/admin/quotes/${id}/respond`,
  CONVERT_QUOTE_TO_ORDER_API: (id) => BASE_URL + `/admin/quotes/${id}/convert-to-order`,
  DELETE_QUOTE_API: (id) => BASE_URL + `/admin/quotes/${id}`,
};

// PAYMENT ENDPOINTS (Admin)
export const paymentEndpoints = {
  GET_ALL_PAYMENTS_API: BASE_URL + "/payments",
  GET_PAYMENT_BY_ID_API: (id) => BASE_URL + `/payments/${id}`,
  GET_PAYMENT_STATS_API: BASE_URL + "/payments/stats",
  UPDATE_PAYMENT_STATUS_API: (id) => BASE_URL + `/payments/${id}/status`,
  PROCESS_REFUND_API: (id) => BASE_URL + `/payments/${id}/refund`,
  PROCESS_PAYOUT_API: (id) => BASE_URL + `/payments/${id}/payout`,
  CREATE_MANUAL_PAYMENT_API: BASE_URL + "/payments/admin/manual",
  GET_COMMISSION_BREAKDOWN_API: BASE_URL + "/payments/commission-breakdown",
  GET_PAYMENT_METHODS_DISTRIBUTION_API: BASE_URL + "/payments/methods-distribution",
  EXPORT_PAYMENTS_REPORT_API: BASE_URL + "/payments/export",
};

// SHIPMENT ENDPOINTS (Admin)
export const shipmentEndpoints = {
  GET_ALL_SHIPMENTS_API: BASE_URL + "/shipments",
  GET_SHIPMENT_BY_ID_API: (id) => BASE_URL + `/shipments/${id}`,
  CREATE_SHIPMENT_API: BASE_URL + "/shipments",
  UPDATE_SHIPMENT_API: (id) => BASE_URL + `/shipments/${id}`,
  DELETE_SHIPMENT_API: (id) => BASE_URL + `/shipments/${id}`,
  UPDATE_SHIPMENT_STATUS_API: (id) => BASE_URL + `/shipments/${id}/status`,
  ADD_TRACKING_UPDATE_API: (id) => BASE_URL + `/shipments/${id}/tracking`,
  GET_SHIPMENT_STATS_API: BASE_URL + "/shipments/stats",
  NOTIFY_CUSTOMER_API: (id) => BASE_URL + `/shipments/${id}/notify`,
  EXPORT_SHIPMENTS_REPORT_API: BASE_URL + "/shipments/export",
};

// CONTACT ENDPOINTS (Admin)
export const contactEndpoints = {
  GET_ALL_CONTACTS_API: BASE_URL + "/admin/contacts",
  GET_CONTACT_BY_ID_API: (id) => BASE_URL + `/admin/contacts/${id}`,
  UPDATE_CONTACT_STATUS_API: (id) => BASE_URL + `/admin/contacts/${id}/status`,
  RESPOND_TO_CONTACT_API: (id) => BASE_URL + `/admin/contacts/${id}/respond`,
  ASSIGN_CONTACT_API: (id) => BASE_URL + `/admin/contacts/${id}/assign`,
  ADD_NOTE_API: (id) => BASE_URL + `/admin/contacts/${id}/notes`,
  DELETE_CONTACT_API: (id) => BASE_URL + `/admin/contacts/${id}`,
};

// NOTIFICATION ENDPOINTS
export const notificationEndpoints = {
  GET_ALL_NOTIFICATIONS_API: BASE_URL + "/notifications",
  GET_UNREAD_NOTIFICATIONS_API: BASE_URL + "/notifications/unread",
  GET_UNREAD_COUNT_API: BASE_URL + "/notifications/unread/count",
  MARK_AS_READ_API: (id) => BASE_URL + `/notifications/${id}/read`,
  MARK_ALL_AS_READ_API: BASE_URL + "/notifications/read/all",
  DELETE_NOTIFICATION_API: (id) => BASE_URL + `/notifications/${id}`,
  DELETE_ALL_NOTIFICATIONS_API: BASE_URL + "/notifications/all",
  CREATE_NOTIFICATION_API: BASE_URL + "/notifications",
};

// USER ENDPOINTS (Admin)
export const userEndpoints = {
  GET_ALL_USERS_API: BASE_URL + "/users",
  GET_USER_BY_ID_API: (id) => BASE_URL + `/users/${id}`,
  UPDATE_USER_API: (id) => BASE_URL + `/users/${id}`,
  DELETE_USER_API: (id) => BASE_URL + `/users/${id}`,
  UPDATE_USER_ROLE_API: (id) => BASE_URL + `/users/${id}/role`,
  BLOCK_USER_API: (id) => BASE_URL + `/users/${id}/block`,
  UNBLOCK_USER_API: (id) => BASE_URL + `/users/${id}/unblock`,
  GET_USER_STATS_API: BASE_URL + "/users/stats",
};

// REPORTS ENDPOINTS (Admin)
export const reportEndpoints = {
  GET_REPORT_OVERVIEW_API: BASE_URL + "/reports/overview",
  GET_WEEKLY_REPORT_API: BASE_URL + "/reports/weekly",
  GET_MONTHLY_REPORT_API: BASE_URL + "/reports/monthly",
  GET_QUARTERLY_REPORT_API: BASE_URL + "/reports/quarterly",
  GET_YEARLY_REPORT_API: BASE_URL + "/reports/yearly",
  GET_CUSTOM_REPORT_API: BASE_URL + "/reports/custom",
  GET_REVENUE_REPORT_API: BASE_URL + "/reports/revenue",
  GET_REVENUE_TREND_API: BASE_URL + "/reports/revenue/trend",
  GET_SALES_BY_CATEGORY_API: BASE_URL + "/reports/sales/by-category",
  GET_SALES_BY_REGION_API: BASE_URL + "/reports/sales/by-region",
  GET_TOP_SELLING_PRODUCTS_API: BASE_URL + "/reports/products/top-selling",
  GET_USER_ACTIVITY_REPORT_API: BASE_URL + "/reports/users/activity",
  GET_NEW_REGISTRATIONS_API: BASE_URL + "/reports/users/registrations",
  GET_USER_DEMOGRAPHICS_API: BASE_URL + "/reports/users/demographics",
  GET_KPI_METRICS_API: BASE_URL + "/reports/kpi",
  GET_ORDER_SUCCESS_RATE_API: BASE_URL + "/reports/orders/success-rate",
  GET_AVG_ORDER_VALUE_API: BASE_URL + "/reports/orders/avg-value",
  GET_CUSTOMER_RETENTION_API: BASE_URL + "/reports/customers/retention",
  GET_CUSTOMER_SATISFACTION_API: BASE_URL + "/reports/customers/satisfaction",
  EXPORT_REPORT_PDF_API: BASE_URL + "/reports/export/pdf",
  EXPORT_REPORT_CSV_API: BASE_URL + "/reports/export/csv",
  EXPORT_REPORT_EXCEL_API: BASE_URL + "/reports/export/excel",
  EMAIL_REPORT_API: BASE_URL + "/reports/email",
  GET_SCHEDULED_REPORTS_API: BASE_URL + "/reports/scheduled",
  CREATE_SCHEDULED_REPORT_API: BASE_URL + "/reports/scheduled",
  UPDATE_SCHEDULED_REPORT_API: (id) => BASE_URL + `/reports/scheduled/${id}`,
  DELETE_SCHEDULED_REPORT_API: (id) => BASE_URL + `/reports/scheduled/${id}`,
  TOGGLE_SCHEDULED_REPORT_API: (id) => BASE_URL + `/reports/scheduled/${id}/toggle`,
  SEND_SCHEDULED_REPORT_NOW_API: (id) => BASE_URL + `/reports/scheduled/${id}/send-now`,
};

// INVENTORY ENDPOINTS (Admin)
export const inventoryEndpoints = {
  GET_INVENTORY_OVERVIEW_API: BASE_URL + "/inventory/overview",
  GET_INVENTORY_ITEMS_API: BASE_URL + "/inventory",
  UPDATE_STOCK_API: (id) => BASE_URL + `/inventory/${id}/stock`,
  ADD_STOCK_API: (id) => BASE_URL + `/inventory/${id}/add-stock`,
  REDUCE_STOCK_API: (id) => BASE_URL + `/inventory/${id}/reduce-stock`,
  BULK_UPDATE_STOCK_API: BASE_URL + "/inventory/bulk-update",
  GET_STOCK_HISTORY_API: (id) => BASE_URL + `/inventory/${id}/history`,
  EXPORT_INVENTORY_API: BASE_URL + "/inventory/export",
  GET_LOW_STOCK_ALERTS_API: BASE_URL + "/inventory/alerts",
};

// SUPPORT TICKET ENDPOINTS (Admin)
export const supportTicketEndpoints = {
  GET_ALL_TICKETS_API: BASE_URL + "/support-tickets/admin/all",
  GET_TICKET_STATS_API: BASE_URL + "/support-tickets/admin/stats",
  GET_STAFF_FOR_ASSIGNMENT_API: BASE_URL + "/support-tickets/admin/staff",
  UPDATE_TICKET_STATUS_API: (id) => BASE_URL + `/support-tickets/${id}/status`,
  ASSIGN_TICKET_API: (id) => BASE_URL + `/support-tickets/${id}/assign`,
  ADD_INTERNAL_NOTE_API: (id) => BASE_URL + `/support-tickets/${id}/notes`,
  DELETE_TICKET_API: (id) => BASE_URL + `/support-tickets/${id}`,
  REPLY_TO_TICKET_API: (id) => BASE_URL + `/support-tickets/${id}/reply`,
};

// CATALOG ENDPOINTS (Admin)
export const catalogEndpoints = {
  GET_ALL_CATALOGS_ADMIN_API: BASE_URL + "/catalogs/admin/all",
  GET_CATALOG_STATS_API: BASE_URL + "/catalogs/stats",
  CREATE_CATALOG_API: BASE_URL + "/catalogs",
  UPDATE_CATALOG_API: (id) => BASE_URL + `/catalogs/${id}`,
  DELETE_CATALOG_API: (id) => BASE_URL + `/catalogs/${id}`,
  UPLOAD_CATALOG_PDF_API: BASE_URL + "/catalogs/upload-pdf",
  UPLOAD_CATALOG_COVER_API: BASE_URL + "/catalogs/upload-cover",
  TOGGLE_CATALOG_ACTIVE_API: (id) => BASE_URL + `/catalogs/${id}/toggle-active`,
  TOGGLE_CATALOG_FEATURED_API: (id) => BASE_URL + `/catalogs/${id}/toggle-featured`,
};

// SITE STATS ENDPOINTS
export const siteStatsEndpoints = {
  GET_SITE_STATS_API: BASE_URL + "/site-stats",
  UPDATE_SITE_STATS_API: BASE_URL + "/site-stats",
  RESET_SITE_STATS_API: BASE_URL + "/site-stats/reset",
};

export default BASE_URL;
