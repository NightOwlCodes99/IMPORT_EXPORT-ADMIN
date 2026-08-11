const { verificationEmailTemplate } = require('./verificationEmail');
const { passwordResetEmailTemplate } = require('./passwordResetEmail');
const { welcomeEmailTemplate } = require('./welcomeEmail');
const { accountSuspendedEmailTemplate } = require('./accountSuspendedEmail');
const { accountReactivatedEmailTemplate } = require('./accountReactivatedEmail');
const { accountDeletedEmailTemplate } = require('./accountDeletedEmail');
const { orderStatusUpdateTemplate } = require('./orderStatusUpdateEmail');
const { orderCreatedTemplate } = require('./orderCreatedEmail');
const { orderConfirmationTemplate } = require('./orderConfirmationEmail');
const { quoteReceivedTemplate } = require('./quoteReceivedEmail');
const { quoteResponseTemplate } = require('./quoteResponseEmail');
const quoteAcceptedEmail = require('./quoteAcceptedEmail');
const quoteRejectedEmail = require('./quoteRejectedEmail');
const { quoteAcceptedByUserTemplate } = require('./quoteAcceptedByUserEmail');
const { inventoryAlertTemplate } = require('./inventoryAlertEmail');
const { stockUpdateTemplate } = require('./stockUpdateEmail');
const { reportEmailTemplate } = require('./reportEmail');
const { catalogDownloadEmailTemplate } = require('./catalogDownloadEmail');
const { notificationAlertTemplate } = require('./notificationAlertEmail');

module.exports = {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
  accountSuspendedEmailTemplate,
  accountReactivatedEmailTemplate,
  accountDeletedEmailTemplate,
  orderStatusUpdateTemplate,
  orderCreatedTemplate,
  orderConfirmationTemplate,
  quoteReceivedTemplate,
  quoteResponseTemplate,
  quoteAcceptedEmail,
  quoteRejectedEmail,
  quoteAcceptedByUserTemplate,
  inventoryAlertTemplate,
  stockUpdateTemplate,
  reportEmailTemplate,
  catalogDownloadEmailTemplate,
  notificationAlertTemplate
};
