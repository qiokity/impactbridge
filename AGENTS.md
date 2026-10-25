You are building ImpactBridge, a real-world charity and community platform.

First, inspect the empty project directory and create a practical implementation plan. Then implement the project in small, testable phases.

Requirements:
- Use Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and secure authentication.
- Build real backend functionality and persistent database storage, not just a static UI or mock data.
- Use my local PostgreSQL database named `impactbridge`.
- Read credentials from environment variables. Never hardcode secrets or commit `.env` files.
- Create `.env.example` with placeholder values and document the setup steps.
- Keep payment integration in test mode until I configure and verify the payment provider credentials.
- Run appropriate tests, database migrations, linting, and production builds.
- Do not claim that a feature works until you have tested it.
- Do not skip features silently. Document unfinished functionality and external services that still require credentials.
- Before executing destructive commands, explain what they will do and ask for confirmation.
- Begin by creating the project structure, defining the database schema, and documenting how to run the application locally. Then continue through the remaining features in manageable phases.

# PROJECT: ImpactBridge — A Real-World Charity and Community Impact Platform

Act as a senior full-stack software engineer, UI/UX designer, database architect, security engineer, and QA engineer. Build a complete, production-oriented charity platform named **ImpactBridge**.

Do not create only a landing page, static mockup, or frontend demonstration. Build a real, full-stack web application with persistent database storage, authentication, authorization, functional forms, file uploads, search, dashboards, administrative workflows, and payment integration architecture.

Work directly in the current repository. First inspect the existing files and environment, then create an implementation plan and execute it. Do not stop after presenting the plan. Continue implementing, testing, and fixing the application.

If the repository is empty, initialize the project using the recommended stack below. If it already contains a working application, preserve useful existing code and adapt the stack where reasonable.

If an external service requires credentials that are unavailable, implement the real integration interface, a clearly marked development/test mode, and precise setup instructions. Never pretend an external transaction, verification, email, or upload succeeded when it did not.

---

## 1. Product vision

ImpactBridge brings six charitable services together in one platform:

1. Transparent donations and charity expense tracking.
2. Food, clothes, books, furniture, and other item donations.
3. Community problem reporting and resolution.
4. Educational sponsorship and student assistance.
5. Volunteer recruitment and skill-based volunteering.
6. Verified emergency assistance and crowdfunding.

The platform should make it easy for people to help, easy for legitimate organizations to request help, and easier for everyone to understand where resources go.

The target audience is primarily in India, so use INR (₹), Indian phone-number formatting where appropriate, UPI-compatible payment architecture, and India-relevant examples. Design the application so it can be localized and expanded later.

Brand personality: trustworthy, compassionate, modern, transparent, accessible, and community-driven.

Suggested tagline: **“Every act of kindness. Every impact accounted for.”**

The application must clearly distinguish fictional seed data, verified organizations, pending requests, simulated payments, and genuine production transactions.

## 2. Recommended technology stack

Use stable, mutually compatible versions and consult the installed tooling before making version decisions.

- Framework: Next.js with App Router and TypeScript.
- Styling: Tailwind CSS.
- UI components: shadcn/ui or another accessible component library compatible with the chosen stack.
- Icons: Lucide.
- Database: PostgreSQL.
- ORM: Prisma.
- Authentication: Auth.js or another well-supported secure authentication solution compatible with the selected Next.js version.
- Validation: Zod.
- Forms: React Hook Form where useful.
- File storage: S3-compatible object storage, with a local development adapter if practical.
- Payments: Razorpay integration suitable for India, with test mode and server-side signature verification.
- Email: an adapter for a transactional email service, with a development mail option.
- Testing: Vitest or Jest, React Testing Library where appropriate, and Playwright for end-to-end tests.
- Code quality: ESLint, formatting, and TypeScript strict mode.

Prefer server-side operations for sensitive actions. Use Server Components by default and Client Components only where interactivity requires them.

Use maintained packages and official documentation. Do not use deprecated APIs merely to make implementation easier.

If a different stack is materially better for the existing repository, explain the choice briefly and proceed consistently.

## 3. Design and user experience

Create a polished, responsive, production-quality interface.

Visual direction:
- Warm off-white backgrounds, deep forest green, muted emerald, and restrained neutral colors.
- Strong typography and clear visual hierarchy.
- Spacious layouts, clean cards, meaningful icons, subtle borders, and attractive data visualizations.
- Realistic imagery that represents community work, education, food distribution, and volunteering.
- Consistent buttons, forms, dialogs, navigation, notifications, loading states, and empty states.
- Avoid excessive gradients, distracting animations, generic AI-generated layouts, and unnecessary glassmorphism.
- Mobile-first responsive design, including small screens.
- Accessible semantic HTML, keyboard navigation, visible focus states, appropriate contrast, and screen-reader labels.
- Respect reduced-motion preferences.

Create a consistent design system with reusable components rather than styling every page independently.

Use the ImpactBridge identity throughout the application.

### Main public navigation

- Home
- Explore Causes
- Donate
- Give Items
- Community
- Education
- Volunteer
- Emergency Help
- Organizations
- About
- Sign In / Get Started

Use a responsive desktop navigation bar and mobile navigation drawer. Avoid making every feature a separate item if that makes the navigation overcrowded; organize related services under sensible menus.

### Homepage

Build a compelling homepage containing:

1. Hero section explaining the platform's purpose.
2. Primary actions: Donate, Find Help, Volunteer, and Report a Problem.
3. Featured verified or clearly demo-labelled projects.
4. Six service-category cards.
5. An impact section showing meaningful, database-derived statistics.
6. A transparent funding or expense example with links to supporting records.
7. Recent community updates.
8. A section for organizations seeking volunteers or donations.
9. Trust and verification information.
10. Testimonials only when genuine and consented to, or clearly labelled fictional examples in demo mode.
11. A complete footer with contact, policies, and legal information.

Never fabricate impact statistics and present them as actual results. Seed data must be labelled as demonstration content until real data exists.

## 4. User roles and permissions

Implement role-based access control with server-side authorization.

Roles:

### A. Guest
- Browse public projects, organizations, causes, and community reports.
- Search and filter listings.
- View public impact reports and approved updates.
- Register or sign in.

### B. Registered supporter
- Manage their profile and preferences.
- Make donations through the configured payment provider.
- View their own donation history and receipts.
- Save projects to a wishlist.
- Offer goods or volunteer services.
- Track their own commitments and contributions.
- Control whether their name is publicly displayed.
- Submit reports or feedback.

### C. Beneficiary or requester
- Submit requests for education, emergency assistance, supplies, or community needs.
- Upload supporting documentation privately.
- Track request review status.
- Respond to reviewer questions.
- Update approved requests.
- Receive notifications about status changes.

### D. Volunteer
- Create and update a volunteer profile.
- List skills, interests, availability, and service area.
- Browse and apply for volunteer opportunities.
- Track application status and assignments.
- Record completed activities, subject to organizer confirmation.

### E. Organization representative
- Apply to register an organization.
- Submit identity and organization verification documents.
- Create and manage campaigns, item requests, and volunteer opportunities after the necessary approval.
- Record project expenses and upload evidence.
- Publish project updates and completion reports.
- Review applicants and coordinate fulfillment.
- View organization-specific dashboards and reports.

### F. Moderator
- Review user-submitted reports and requests.
- Review flagged content.
- Approve, reject, or request changes to submissions within their authority.
- Record moderation reasons and actions.
- Escalate fraud or safety concerns.

### G. Administrator
- Manage accounts, roles, organizations, requests, campaigns, categories, and platform configuration.
- Review organization verification.
- Manage moderation and fraud reports.
- Inspect payment reconciliation records.
- View audit logs and platform analytics.
- Suspend or reinstate accounts with recorded reasons.

Never trust role values, user IDs, amounts, verification states, or permissions supplied by the browser. Derive identity from the authenticated server session and verify authorization on every protected operation.

Prevent users from assigning themselves privileged roles. Provide a secure initial-admin setup procedure using environment configuration or a protected command-line seed process.

## 5. Feature One: Transparent donations and expense tracking

Build a full donation and financial transparency module.

### Campaigns
Each campaign should support:
- Title, slug, description, category, cover image, and organizer.
- Funding target, currency, start/end dates, and campaign status.
- Beneficiary or project details appropriate for public display.
- Verification status and review information.
- Public progress indicator.
- Donations received, subject to privacy settings.
- Project updates, milestones, and supporting evidence.
- A transparent breakdown of how money is intended to be used.

### Donation workflow
1. User opens a campaign.
2. User selects a predefined or custom donation amount.
3. User chooses whether their name is publicly visible.
4. User enters required donor information and accepts applicable terms.
5. Server validates the campaign, amount, currency, and donation eligibility.
6. User proceeds to the configured payment provider.
7. Server verifies the payment result using the provider's supported verification mechanism.
8. Record the verified transaction and donation in the database.
9. Update campaign totals from verified, eligible records only.
10. Show confirmation and a donation history entry.

Requirements:
- Use integer minor units for monetary values, such as paise, rather than floating-point arithmetic.
- Verify payment signatures on the server.
- Verify payment status with the provider when appropriate.
- Validate webhook signatures.
- Handle duplicate and out-of-order webhooks idempotently.
- Never mark a donation successful merely because the browser redirects to a success page.
- Do not expose secret keys or private payment information.
- Never store card numbers, CVVs, or other sensitive payment credentials.
- Separate payment attempts, provider payments, donations, refunds, and campaign accounting records.
- Handle pending, successful, failed, cancelled, refunded, and partially refunded states as appropriate.
- Add reconciliation tools and tests for payment edge cases.
- Clearly identify simulated payments and never count them as genuine funds raised.

### Financial transparency ledger
Implement a project-level accounting ledger or immutable financial event history that tracks relevant events:
- Confirmed incoming donations.
- Refunds.
- Recorded project expenses.
- Expense corrections or reversals.
- Other explicitly defined funding adjustments.

Use append-only financial events for auditability. Corrections should create compensating entries rather than silently rewriting historical financial events.

Show separate totals for:
- Confirmed donations.
- Refunds.
- Recorded expenses.
- Remaining recorded project funds.
- Pending or unverified transactions, displayed separately.

Do not claim that recorded expenses prove money was spent honestly. Display the available evidence, reviewer status, and verification limitations.

### Expense management
Authorized organization members can submit:
- Expense category and description.
- Amount and currency.
- Transaction date.
- Vendor or payee name when appropriate.
- Invoice, receipt, or supporting document.
- Relevant campaign or project.
- Review status.

A reviewer can approve, reject, or request clarification, with a recorded reason. Keep sensitive documents private; public expense records should expose only approved, appropriately redacted evidence.

Create a public transparency page for each eligible project with a ledger summary, expense entries, project milestones, and downloadable public reports where appropriate.

Do not present a donation receipt as an official tax-exemption certificate. Tax-related claims must depend on actual organizational eligibility and applicable law.

## 6. Feature Two: Food, clothes, books, and item donations

Build a functional goods-sharing marketplace for charitable purposes.

Users can list:
- Food surplus.
- Clothes.
- Books and educational materials.
- Furniture.
- Computers and electronics.
- Medical or accessibility equipment, subject to safety restrictions.
- Household essentials.
- Other approved categories.

Each listing should have:
- Title and description.
- Category and condition.
- Quantity and unit.
- Photos.
- Pickup area or approximate location.
- Availability and expiration information where relevant.
- Delivery or pickup preferences.
- Donor contact preferences.
- Moderation and safety status.

Implement:
- Search, filters, and sorting.
- Request-to-claim workflow.
- Donor acceptance or rejection.
- Reservation of available quantities.
- Prevention of overclaiming through database transactions or equivalent concurrency control.
- Pickup coordination.
- Fulfillment confirmation by the relevant parties.
- Cancellation and dispute workflows.
- Status tracking: draft, pending review, available, reserved, fulfilled, expired, and rejected as appropriate.

For food donations, include expiry, storage, hygiene, and local food-safety warnings. Do not allow expired or prohibited goods to be listed.

Never publish a donor's private address or phone number by default. Exchange contact details only when authorized and necessary.

For the first release, allow coordination between donors and recipients without attempting to operate a logistics company.

## 7. Feature Three: Community problem reporting

Create a civic and community action module.

Allow reports for:
- Potholes and damaged roads.
- Garbage accumulation.
- Broken streetlights.
- Unsafe public facilities.
- Damaged community infrastructure.
- Water or sanitation issues.
- Accessibility barriers.
- Other permitted local issues.

Report form:
- Title and detailed description.
- Category and severity.
- Photo uploads.
- Approximate location or map coordinates.
- Optional public display name.
- Consent and privacy information.

Implement:
- List and map views when a map provider is configured.
- Search by area and category.
- Duplicate report detection or suggestions.
- Community voting or support.
- Comments with moderation.
- Assignment to a participating NGO, volunteer group, or authorized responsible organization.
- Status history: submitted, under review, accepted, assigned, in progress, resolved, or rejected.
- Before-and-after evidence.
- Resolution confirmation and reopening.
- Abuse reporting.

Do not imply that a government authority has accepted a report unless an actual authorized integration confirms it. Distinguish community-managed reports from reports formally submitted to an authority.

Use approximate public locations when precise coordinates could expose a person's residence or create safety risks.

## 8. Feature Four: Educational sponsorship

Create a dedicated education support module.

Support requests for:
- School and college fees.
- Books and stationery.
- Laptops and computers.
- Internet access.
- Examination fees.
- Learning resources.
- Other eligible educational expenses.

Implement:
- Student or guardian request forms.
- Education level and general location.
- Requested amount or item.
- Need explanation.
- Supporting documents uploaded privately.
- Verification and moderation workflow.
- Sponsor interest or campaign funding.
- Milestones and fulfillment updates.
- Restricted access to personal documents.
- Status tracking.

Protect minors' information. Do not publicly expose school IDs, home addresses, phone numbers, financial documents, or unnecessary personal details. Use guardian consent and suitable safeguarding workflows where required.

For financial sponsorship, clearly state whether the platform collects money for an approved project, facilitates a direct payment to an eligible organization, or merely connects interested parties.

Do not claim that a student's identity, financial circumstances, or academic details are independently verified unless a documented verification process was actually completed.

## 9. Feature Five: Volunteer matching

Build a volunteer recruitment and coordination system.

Volunteer profiles can include:
- Skills such as teaching, programming, graphic design, translation, healthcare, and event organization.
- Interests.
- Availability.
- General service area.
- Remote or in-person preference.
- Experience and optional qualifications.

Organizations can create opportunities with:
- Title and description.
- Required skills.
- Number of volunteers needed.
- Date and duration.
- General location or online status.
- Minimum age and qualification requirements where relevant.
- Safety instructions.
- Organizer information.
- Application deadline.

Implement:
- Search and filtering.
- Volunteer applications.
- Application review and acceptance.
- Waitlists where useful.
- Event registration and attendance.
- Assignment tracking.
- Volunteer hours submitted by the volunteer and confirmed by the organizer.
- Completion status.
- Feedback and incident reporting.

Prevent duplicate applications where inappropriate and enforce capacity limits transactionally.

Do not automatically claim that volunteers have verified credentials or completed hours without the appropriate checks and confirmation.

## 10. Feature Six: Emergency assistance and crowdfunding

Create an emergency response module for urgent, legitimate assistance requests.

Categories may include:
- Essential supplies after disasters.
- Temporary shelter.
- Food and water.
- Emergency educational support.
- Urgent accessibility needs.
- Other carefully moderated assistance.

Each request must have:
- A clear need description.
- Requested funds, goods, or services.
- Deadline or urgency information.
- Supporting evidence submitted privately.
- Verification status.
- Assigned reviewer.
- Funding or fulfillment progress.
- Updates and closure information.

Implement a priority queue for moderators based on urgency, submission time, and verification state. Urgency must never bypass required review.

Use a review process before public fundraising. Allow emergency reports to be received immediately, but label unverified reports privately for review rather than publicly promoting them as verified.

Add fraud-reporting tools, duplicate-request checks, moderation history, and escalation procedures.

Do not expose sensitive medical records, identity documents, exact private addresses, or unredacted financial evidence publicly.

Clearly separate:
- Reported emergency.
- Under verification.
- Verified for publication.
- Funding active.
- Assistance in progress.
- Fulfilled.
- Closed or rejected.

The platform must not imply that it provides emergency medical services, law enforcement, or guaranteed rescue.

## 11. Shared search, categories, and discovery

Build a unified discovery experience across all six services.

Support:
- Search by title and description.
- Category filters.
- General location filters.
- Status filters.
- Newest and relevant sorting.
- Pagination.
- Clear empty states.
- Search query persistence in URL parameters.
- Server-side filtering for large result sets.

Include a unified Explore page with tabs or sections for campaigns, goods, community reports, education requests, volunteer opportunities, and emergency requests.

Respect visibility rules: private, pending, rejected, and restricted records must never leak through search, direct URLs, API responses, or cached pages.

## 12. User dashboards

Create role-aware dashboards.

### Supporter dashboard
- Donation history.
- Payment and refund statuses.
- Saved campaigns.
- Item donation offers and claims.
- Volunteer applications.
- Recent activity.
- Notifications.

### Requester dashboard
- Submitted requests.
- Review feedback.
- Required corrections.
- Campaign progress.
- Assistance and fulfillment updates.
- Secure document management.

### Organization dashboard
- Organization profile and verification status.
- Campaign management.
- Donation and funding summaries.
- Expense submissions and accounting history.
- Goods listings and fulfillment.
- Volunteer opportunities and applicants.
- Project updates.
- Reports and export tools.

### Moderator dashboard
- Pending verification queue.
- Flagged content.
- Emergency request queue.
- Expense evidence requiring review.
- Abuse reports.
- Review history and escalation actions.

### Administrator dashboard
- User and role management.
- Organization verification.
- Moderation overview.
- Payment reconciliation.
- Refund records.
- Financial and activity reports.
- Audit logs.
- Platform configuration.
- Health and operational status.

Dashboard figures must be derived from real database records, not hardcoded constants.

## 13. Database design

Create a normalized relational schema with suitable indexes, foreign keys, unique constraints, and deletion policies.

Include appropriate models for:
- User.
- Account and Session if required by the authentication library.
- Profile and UserPreferences.
- Organization.
- OrganizationMembership.
- OrganizationVerification.
- Campaign.
- CampaignMilestone.
- Donation.
- PaymentAttempt.
- PaymentEvent or ProviderWebhookEvent.
- Refund.
- FinancialLedgerEntry.
- Expense.
- ExpenseEvidence.
- GoodsListing.
- GoodsClaim or Reservation.
- GoodsFulfillment.
- CommunityReport.
- ReportVote.
- ReportComment.
- ReportStatusHistory.
- EducationRequest.
- VolunteerProfile.
- VolunteerOpportunity.
- VolunteerApplication.
- VolunteerAssignment or Attendance.
- EmergencyRequest.
- RequestEvidence.
- Notification.
- AbuseReport.
- ModerationAction.
- AuditLog.

Additional models may be introduced where justified.

Requirements:
- Use UUIDs or another safe identifier strategy.
- Store monetary values as integers in minor currency units, with an explicit currency code.
- Store timestamps consistently in UTC.
- Use explicit enums or validated states.
- Define ownership and authorization relationships clearly.
- Add database indexes for frequently filtered fields.
- Use transactions for multi-record financial operations, reservation limits, and other concurrency-sensitive actions.
- Avoid unbounded database queries.
- Avoid destructive cascade deletion of financial and audit history.
- Support appropriate anonymization or deletion of personal information while preserving records that must legally be retained.
- Create and apply schema migrations.
- Provide a development seed script with clearly labelled fictional data.

Never commit real user data, real payment credentials, private documents, or production database credentials.

## 14. Authentication, authorization, and security

Treat security as a core requirement, not a later enhancement.

Implement:
- Secure registration, login, logout, and session handling.
- Email verification when the email provider is configured.
- Password reset through time-limited, single-use tokens if password authentication is used.
- Secure password hashing through a maintained authentication library.
- Server-side role and resource authorization.
- Ownership checks for every private resource.
- Request validation using Zod.
- Rate limits on authentication, uploads, comments, donations, and other abuse-prone endpoints.
- CSRF protections appropriate to the authentication and request architecture.
- Protection against XSS, SQL injection, insecure direct object references, and mass assignment.
- Secure headers and an appropriate content security policy.
- Strict upload size limits, allowed MIME types, and file signature checks.
- Randomized storage keys rather than user-controlled filesystem paths.
- Private storage for sensitive evidence, using short-lived signed URLs when necessary.
- Secrets only in environment variables or the configured secret manager.
- Safe error messages that do not reveal internal details.
- Audit logs for privileged operations.
- Explicit consent and privacy settings.
- Data retention and account deletion workflows.
- Protection against duplicate financial operations and replayed webhooks.

Use least-privilege access. Do not trust a hidden button or client-side route guard as authorization.

Do not log passwords, access tokens, private documents, payment secrets, or unnecessary personal data.

## 15. Payments and real-world financial operations

Implement a provider adapter for Razorpay, appropriate to the Indian deployment context.

The implementation must:
- Create payment orders on the server.
- Validate amount, currency, and campaign eligibility.
- Verify payment signatures on the server.
- Verify webhook authenticity.
- Handle duplicate events idempotently.
- Store provider references and payment states.
- Reconcile payment records against verified provider events.
- Support cancellation, failure, refund initiation where supported, and refund status tracking.
- Avoid counting unverified or failed payments as donations.
- Use sandbox credentials by default in development.

If credentials are missing, provide a functional mock payment adapter for local development, visibly labelled as simulated. Mock payments must not be represented as real money or mixed into genuine fundraising totals.

For production, document all provider dashboard configuration, callback URLs, webhook secrets, currency restrictions, and test procedures.

IMPORTANT: Receiving donations and distributing charitable funds can require legal, tax, banking, payment-provider, and regulatory compliance. Do not assume that a newly created website is legally authorized to collect charitable funds. Provide configuration points for an eligible organization or authorized payment arrangement, and require appropriate review before enabling live payments.

Never promise tax deductibility, NGO registration, 80G benefits, or other legal status without actual eligibility and supporting evidence.

## 16. File uploads, images, and documents

Implement a safe storage abstraction for:
- Campaign images.
- Goods photos.
- Community report photos.
- Organization verification evidence.
- Education and emergency supporting documents.
- Expense receipts.

Use public image storage only for approved public assets. Store identity documents, student records, and other sensitive evidence privately.

Provide:
- Upload progress and validation feedback.
- Maximum file sizes.
- Allowed file formats.
- Server-side validation.
- Access controls.
- Safe deletion and retention behavior.
- Signed upload or download URLs where appropriate.
- Image resizing or optimization if compatible with the infrastructure.

Never expose a private storage bucket or assume that an unpredictable URL alone provides adequate authorization.

## 17. Notifications and email

Build an in-app notification system and a transactional email adapter.

Notify users about relevant events, such as:
- Registration and account verification.
- Donation confirmation.
- Payment failure or refund status.
- Request review and approval.
- Organization verification decisions.
- Item claim acceptance.
- Volunteer application decisions.
- Project milestones.
- Expense review.
- Emergency request updates.

Implement unread/read status, notification history, and sensible notification preferences.

Use an outbox or another reliable delivery pattern for important transactional notifications when appropriate. Failed email delivery must not silently reverse a completed payment or database transaction.

If no email provider is configured, log messages only in development and document the setup required for real delivery. Never log sensitive email content or secrets in production.

## 18. Admin and moderation operations

Build actual administrative screens and server actions for:
- Reviewing organizations.
- Reviewing charity campaigns.
- Reviewing student and emergency requests.
- Approving, rejecting, or requesting changes.
- Reviewing public expenses and evidence.
- Managing user reports and comments.
- Handling fraud flags.
- Suspending accounts.
- Inspecting audit trails.
- Reviewing payment discrepancies.

Every consequential moderation decision must record the actor, timestamp, action, target, and reason.

Require confirmation for destructive or irreversible operations. Use reversible status changes or explicit archival where possible.

Use separate permissions for financial actions, moderation, and account administration where appropriate.

## 19. Privacy, trust, and legal pages

Create:
- About Us.
- Contact.
- Privacy Policy.
- Terms of Service.
- Donation and Refund Policy.
- Community Guidelines.
- Organization Verification Policy.
- Safeguarding and reporting information.
- Accessibility statement.

Provide sensible initial templates, clearly identified as templates requiring legal review before production use.

Do not invent an office address, charity registration number, organization credentials, legal approval, or customer support contact.

Explain what verification means and what it does not guarantee.

Collect only the information needed for the service. Give users meaningful privacy controls.

## 20. SEO, accessibility, and performance

Implement:
- Page titles and metadata.
- Open Graph metadata.
- Sitemap and robots configuration.
- Canonical URLs where appropriate.
- Accessible form labels and validation errors.
- Keyboard-accessible navigation.
- Responsive images.
- Pagination and database query optimization.
- Appropriate caching and invalidation.
- Loading skeletons.
- Useful error and empty states.
- Not-found and error pages.
- Rate-limited public endpoints.

Never cache private dashboards, sensitive documents, or user-specific financial data publicly.

Avoid unnecessary dependencies and excessive client-side JavaScript.

## 21. Routes and application structure

Create a coherent route structure, adapting names to the selected framework:

Public:
- /
- /explore
- /causes
- /campaigns/[slug]
- /donate/[campaignId]
- /goods
- /goods/[id]
- /community
- /community/reports/[id]
- /education
- /education/[id]
- /volunteer
- /volunteer/opportunities/[id]
- /emergency
- /emergency/[id]
- /organizations
- /organizations/[slug]
- /transparency/[campaignId]
- /about
- /contact
- /privacy
- /terms
- /donation-policy
- /community-guidelines

Authentication:
- /sign-in
- /sign-up
- /verify-email
- /forgot-password
- /reset-password

Authenticated:
- /dashboard
- /dashboard/donations
- /dashboard/goods
- /dashboard/volunteering
- /dashboard/requests
- /dashboard/notifications
- /dashboard/settings

Organization:
- /organization/dashboard
- /organization/profile
- /organization/verification
- /organization/campaigns
- /organization/campaigns/new
- /organization/expenses
- /organization/goods
- /organization/volunteers
- /organization/reports

Requests:
- /requests/new
- /requests/[id]
- /requests/[id]/edit

Administration:
- /admin
- /admin/users
- /admin/organizations
- /admin/campaigns
- /admin/requests
- /admin/expenses
- /admin/moderation
- /admin/payments
- /admin/audit-logs
- /admin/settings

Implement routes that are appropriate to the final information architecture. Do not create empty pages merely to satisfy a route list.

## 22. API and business logic

Use server actions, route handlers, or equivalent server-side endpoints consistently.

Create well-structured service modules for:
- Authentication and authorization.
- Campaigns and donations.
- Payment processing and reconciliation.
- Financial ledger.
- Goods and fulfillment.
- Community reports.
- Education requests.
- Volunteer matching.
- Emergency assistance.
- Organization verification.
- Notifications.
- Moderation and audit logging.

Keep business logic out of UI components.

Use database transactions where atomicity is necessary. Validate inputs at the server boundary. Return structured success or error responses and avoid leaking internal exceptions.

Do not create fake API calls, hardcoded responses masquerading as backend functionality, or buttons that have no real action.

## 23. Testing requirements

Write and execute automated tests.

### Unit tests
- Input validation.
- Authorization decisions.
- Campaign funding calculations.
- Refund and expense calculations.
- Financial ledger invariants.
- Goods quantity availability.
- Volunteer capacity.
- Request status transitions.
- Payment event idempotency.

### Integration tests
- Authentication and role permissions.
- Database-backed campaign creation.
- Donation order creation.
- Payment signature validation.
- Webhook processing and duplicate event handling.
- Expense approval and audit records.
- Goods reservation concurrency.
- Request moderation.
- Private document access restrictions.

### End-to-end tests
- Visitor browses public campaigns.
- User registers and signs in.
- User submits a charity request.
- Moderator reviews the request.
- Organization creates a campaign.
- Supporter completes a simulated donation.
- Supporter views donation history.
- Organization submits an expense and moderator reviews it.
- User offers an item and another user claims it.
- Volunteer applies to an opportunity.
- Admin accesses protected administration features.
- Unauthorized users are denied access to restricted routes.

Use a dedicated test database and deterministic seed fixtures. Do not run destructive test cleanup against a production database.

If external services cannot be reached, test their adapters with controlled mocks and clearly document which live integration tests remain outstanding.

Run available lint, type-check, unit-test, integration-test, and production-build commands. Fix errors rather than simply reporting them.

## 24. Seed data and development experience

Provide fictional, clearly labelled demonstration data:
- Multiple campaign categories.
- Several example campaigns.
- Goods listings.
- Community reports.
- Educational assistance requests.
- Volunteer opportunities.
- Emergency assistance requests.
- Organizations in different verification states.
- Expense records and project updates where appropriate.

Never seed fake real-world donation success, official verification, or legal credentials that could be mistaken for real evidence.

Provide:
- Database migrations.
- A seed command.
- An environment variable example file.
- A clear README.
- Local development instructions.
- A test command.
- A production build command.
- Deployment instructions.
- Troubleshooting guidance.

Make it possible for a developer to run the application locally using documented steps, for example:

1. Install dependencies.
2. Start PostgreSQL or the configured development database.
3. Copy the environment example into a local environment file.
4. Configure the database URL.
5. Run migrations.
6. Seed demonstration data.
7. Start the development server.
8. Run automated tests.

Use commands appropriate to the actual repository and package manager.

## 25. Deployment architecture

Prepare the application for deployment on a compatible hosting provider, such as Vercel for the Next.js application, with managed PostgreSQL and compatible object storage.

Document:
- Production environment variables.
- Database provisioning and migrations.
- Storage bucket setup and access policies.
- Payment provider configuration.
- Webhook endpoint configuration.
- Email provider configuration.
- Domain and HTTPS configuration.
- Logging and monitoring.
- Database backups and recovery.
- Error tracking.
- Rate limiting and abuse prevention.
- Secret rotation.
- Rollback procedures.

Do not commit secrets. Do not run production migrations or perform destructive external actions without explicit authorization.

## 26. Environment variables

Create a documented `.env.example` containing only placeholders, with appropriate names for the actual integrations, such as:

- DATABASE_URL
- AUTH_SECRET
- AUTH_URL or the framework's equivalent
- APP_URL
- STORAGE_PROVIDER
- STORAGE_BUCKET
- STORAGE_REGION
- STORAGE_ENDPOINT where applicable
- STORAGE_ACCESS_KEY_ID
- STORAGE_SECRET_ACCESS_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- EMAIL_PROVIDER_API_KEY
- EMAIL_FROM
- INITIAL_ADMIN_EMAIL or an equivalent secure bootstrap configuration

Only include variables actually used by the implementation. Explain which are mandatory in development and which are required only for production.

Never place private payment or storage secrets in variables exposed to the browser. Public payment identifiers may be exposed only where required by the provider's documented client integration.

## 27. Development phases

Implement the project in the following order.

### Phase 1: Foundation
- Inspect the repository.
- Establish the architecture.
- Initialize the project if necessary.
- Build the design system.
- Configure PostgreSQL, Prisma, authentication, environment validation, and seed data.
- Create shared layouts and navigation.
- Verify the application starts.

### Phase 2: Core platform
- Implement roles and permissions.
- Build campaign discovery and details.
- Implement organization profiles and verification.
- Build the administration shell and moderation workflow.

### Phase 3: Six charitable services
- Implement donation and transparency workflows.
- Implement goods donation and fulfillment.
- Implement community reporting.
- Implement education sponsorship.
- Implement volunteering.
- Implement emergency assistance.

### Phase 4: Financial integrations
- Implement the payment provider adapter.
- Add payment verification, webhook handling, refunds, ledger records, and reconciliation.
- Add the simulated development payment adapter.
- Test financial invariants.

### Phase 5: Completion
- Build dashboards and notifications.
- Add uploads and private evidence handling.
- Add privacy, policy, and legal template pages.
- Improve accessibility, responsiveness, performance, and SEO.
- Add tests.
- Run linting, type checking, tests, and production build.
- Fix defects.
- Complete documentation.

Do not stop after a phase merely because its checklist has been written. Implement as much as possible in the current session and continue with the next incomplete phase.

If context or execution limits prevent finishing everything, leave a coherent, runnable project and document the precise remaining tasks. Do not claim that incomplete features are complete.

## 28. Definition of done

The project is not complete merely because the homepage looks attractive.

Consider the implementation complete only when:

- The application starts successfully using documented commands.
- Database migrations apply successfully.
- Authentication and server-side authorization work.
- Users can create and update permitted records.
- All six charity modules have meaningful end-to-end workflows.
- Forms validate inputs and persist data.
- Search and filtering use real database records.
- Dashboards reflect persisted data.
- Organization verification and moderation actually change access and visibility.
- Financial calculations are correct and auditable.
- Payment events are securely verified and processed idempotently.
- Development-mode payments are visibly simulated.
- Private documents are protected.
- Unauthorized access tests pass.
- The critical user journeys have automated tests.
- Linting, type checking, and production build pass, or any remaining external blockers are explicitly documented.
- Production setup and limitations are documented honestly.

## 29. Instructions for working as Codex

Start by examining the current project structure, available tools, package manager, and runtime environment.

Then:
1. Give me a short summary of the architecture you will implement.
2. Write a prioritized task checklist.
3. Implement the application directly in the repository.
4. Install only necessary dependencies.
5. Run migrations and tests when the environment permits.
6. Inspect the actual results and fix failures.
7. Avoid asking me questions unless a decision blocks meaningful progress. Use sensible defaults and document assumptions.
8. Never replace working code with a superficial mockup just to finish faster.
9. Never claim to have run a test, created a database, deployed the site, or completed a transaction unless that action actually succeeded.
10. Finish with a concise implementation report listing completed features, commands run, test results, required environment variables, remaining limitations, and exact instructions for running the application.

**Begin now. Inspect the repository and start building ImpactBridge.**
