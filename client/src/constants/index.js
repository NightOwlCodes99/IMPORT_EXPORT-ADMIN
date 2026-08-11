export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SUPPLIER: 'supplier',
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
};

export const QUOTE_STATUS = {
  PENDING: 'Pending',
  RESPONDED: 'Responded',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export const SHIPMENT_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Stripe',
  'Bank Transfer',
  'Wire Transfer',
  'Letter of Credit',
  'Cash on Delivery',
  'Escrow',
  'Other',
];

export const PAGINATION_LIMIT = 12;
