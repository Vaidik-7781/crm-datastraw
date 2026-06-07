-- ============================================
-- DATASTRAW CRM — SEED DATA
-- Run AFTER schema.sql
-- ============================================

INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, category, assigned_to) VALUES
('TKT-001','Alice Johnson','alice@acmecorp.com','Cannot login to dashboard','I have been trying to login for the past hour but keep getting an error: "Invalid credentials". I have reset my password twice but the issue persists. This is blocking my entire team from accessing the system.','Open','High','Technical','Sarah K.'),
('TKT-002','Bob Smith','bob@globaltech.io','Billing charge discrepancy','I was charged $199 instead of $99 for my monthly subscription. I can see the double charge in my bank statement dated last Monday. Please process a refund of the $100 difference immediately.','In Progress','High','Billing','Mike R.'),
('TKT-003','Carol White','carol@startupxyz.co','Feature request: Dark mode','Would love to have a dark mode option in the interface. Many of our team members work late nights and the bright white theme is straining on eyes. This would be a great quality-of-life improvement.','Open','Low','Feature Request',null),
('TKT-004','David Lee','david@devstudio.net','API returning 500 errors on /orders endpoint','The REST API returns 500 Internal Server Error when calling GET /api/orders with pagination params. This started after the v2.4.1 deployment yesterday. Here is the exact curl: curl -X GET https://api.example.com/orders?page=2&limit=20','In Progress','Critical','Bug','Sarah K.'),
('TKT-005','Emma Davis','emma@retailco.com','How to export monthly reports to PDF','I need to export my monthly sales reports to PDF format for our board meeting. I cannot find this option anywhere in the settings or reports section. Could you please guide me through the steps?','Closed','Medium','General',null),
('TKT-006','Frank Miller','frank@ecommerce.store','Email notifications completely stopped working','We stopped receiving any email notifications for new orders about 3 days ago. I have checked spam folders, whitelist settings, and verified our email address is correct. This is causing us to miss orders.','Open','High','Technical','Mike R.'),
('TKT-007','Grace Wilson','grace@fashionbrand.in','Credit card payment keeps failing on upgrade','I am trying to upgrade from Starter to Pro plan but the payment keeps failing with error code CARD_DECLINED. My card is valid and has sufficient funds. I have tried 3 different cards. Please help.','Open','High','Billing',null),
('TKT-008','Henry Brown','henry@mobileapp.dev','iOS app crashes immediately on launch','After the latest iOS app update (v3.2.0), the app crashes within 2 seconds of opening on iPhone 14 Pro running iOS 17.4. The previous version worked perfectly. Crash log attached conceptually: EXC_BAD_ACCESS KERN_INVALID_ADDRESS.','In Progress','Critical','Bug','Sarah K.'),
('TKT-009','Iris Taylor','iris@logistics.co','Bulk CSV import feature missing','Our team needs to import customer records in bulk. We have 5000+ customers to add and doing it one by one is not feasible. Please add a CSV bulk import feature or share if there is an API endpoint we can use.','Open','Medium','Feature Request',null),
('TKT-010','Jack Anderson','jack@consulting.io','Dashboard loading extremely slow since yesterday','The main dashboard takes 30-45 seconds to fully load. This started yesterday afternoon. I have cleared cache and tried different browsers including Chrome and Firefox. Our team of 20 is all experiencing the same issue.','Resolved','Medium','Technical','Mike R.'),
('TKT-011','Karen Martinez','karen@healthcare.org','Two-factor authentication not sending SMS','The 2FA SMS verification code is not being delivered to my phone number +91-XXXXXXXXXX. I have been locked out of my account for 2 days. This is urgent as I need to access patient records.','Open','Critical','Technical',null),
('TKT-012','Liam Johnson','liam@fintech.app','Wrong currency displayed after region change','After changing my account region from USD to INR, all prices are showing in USD but with INR amounts. Example: $₹4999 instead of ₹4999. This is confusing for our Indian customers.','In Progress','Medium','Bug','Sarah K.'),
('TKT-013','Mia Chen','mia@marketing.agency','Integration with Mailchimp broken after API update','Our Mailchimp integration stopped syncing contact lists after last week''s API update. The sync button shows "Connected" but no data is flowing through. We have 50,000 contacts that need to stay in sync.','Open','High','Technical',null),
('TKT-014','Nathan Roy','nathan@saas.io','Request for dedicated account manager','We are on the Enterprise plan and would like to request a dedicated account manager for onboarding and ongoing support. Our team of 200 users needs regular training sessions and priority support.','Resolved','Low','General','Mike R.'),
('TKT-015','Olivia Park','olivia@edtech.co','Video upload failing for files over 100MB','When trying to upload course videos larger than 100MB, the upload progress bar gets stuck at 99% and then fails with "Upload timeout". Our course videos average 500MB. Is there a size limit we are not aware of?','Open','High','Technical',null);

-- Seed some notes
INSERT INTO notes (ticket_id, note_text, author) VALUES
('TKT-001','Checked the auth logs - seeing multiple failed attempts. Looks like a session token issue after password reset. Escalating to backend team.','Sarah K.'),
('TKT-002','Confirmed the double charge in payment system. Refund of $100 initiated. Should reflect in 3-5 business days.','Mike R.'),
('TKT-004','Reproduced the issue locally. The pagination query is missing a JOIN condition introduced in v2.4.1. Hotfix branch created.','Sarah K.'),
('TKT-010','Issue identified: a slow DB query caused by missing index on orders table. Index added, monitoring dashboards - load time back to normal 2.3s.','Mike R.');

-- Seed activity logs
INSERT INTO activity_log (ticket_id, action, old_value, new_value, performed_by) VALUES
('TKT-001','ticket_created',null,'Open','System'),
('TKT-001','assigned',null,'Sarah K.','Mike R.'),
('TKT-002','ticket_created',null,'Open','System'),
('TKT-002','status_changed','Open','In Progress','Mike R.'),
('TKT-004','ticket_created',null,'Open','System'),
('TKT-004','priority_changed','High','Critical','Sarah K.'),
('TKT-004','status_changed','Open','In Progress','Sarah K.'),
('TKT-005','ticket_created',null,'Open','System'),
('TKT-005','status_changed','Open','Closed','Mike R.'),
('TKT-010','ticket_created',null,'Open','System'),
('TKT-010','status_changed','Open','Resolved','Mike R.'),
('TKT-014','ticket_created',null,'Open','System'),
('TKT-014','status_changed','Open','Resolved','Mike R.');

-- ---- AGENTS SEED ----
INSERT INTO agents (name, email, role, avatar_color) VALUES
('Sarah Kumar',   'sarah.k@datastraw.in',   'Admin',  '#6366F1'),
('Mike Roberts',  'mike.r@datastraw.in',    'Agent',  '#10B981'),
('Priya Sharma',  'priya.s@datastraw.in',   'Agent',  '#F59E0B'),
('Daniel Chen',   'daniel.c@datastraw.in',  'Agent',  '#EF4444'),
('Aisha Mohammed','aisha.m@datastraw.in',   'Viewer', '#8B5CF6');

-- ---- QUICK REPLIES SEED ----
INSERT INTO quick_replies (title, body) VALUES
('Acknowledge Receipt',
 'Thank you for reaching out to us. We have received your request and a support agent will be in touch shortly. Your ticket ID is attached for reference.'),
('Request More Info',
 'Thank you for contacting support. To better assist you, could you please provide more details about the issue? Specifically, any error messages, steps to reproduce, and the browser or device you are using would be very helpful.'),
('Issue Under Investigation',
 'We have received your report and our technical team is currently investigating the issue. We will keep you updated on the progress and aim to resolve this as soon as possible. We apologize for any inconvenience caused.'),
('Billing Refund Initiated',
 'We have reviewed your billing concern and a refund has been initiated for the amount in question. Please allow 3–5 business days for the amount to reflect in your account. We apologize for the inconvenience.'),
('Issue Resolved',
 'We are pleased to inform you that the issue you reported has been resolved. Could you please verify from your end that everything is working as expected? If you continue to experience any problems, please do not hesitate to reach out.'),
('Escalated to Engineering',
 'Thank you for your patience. This issue has been escalated to our engineering team for a deeper investigation. We will provide you with an update within 24 hours. We appreciate your understanding.'),
('Scheduled Maintenance Notice',
 'We wanted to inform you that the issue you reported may be related to our scheduled maintenance window. Our systems will be fully operational shortly. Thank you for your patience and we apologize for any disruption.'),
('Feature Request Logged',
 'Thank you for your valuable feedback! We have logged your feature request with our product team. While we cannot guarantee a specific timeline, we review all requests regularly and your input helps shape our roadmap.');
