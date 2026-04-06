# Test Plan for Product Specification Doc

## 1) Objective
Define end-to-end and feature-level test coverage for core platform capabilities:
- Admin Dashboard
- Inventory CRUD
- User Management
- Forum Posts, Comments, Like, Report
- Notification System
- Responsive Design

## 2) Scope
- **In scope:** Functional behavior, role-based access, data persistence, validation/error handling, and UI responsiveness across breakpoints.
- **Out of scope:** Load/performance testing, penetration testing, and third-party outage scenarios (unless explicitly requested).

## 3) Test Environments
- **Application URL:** `http://localhost:3000` (or deployment URL used by QA/UAT)
- **Browser baseline:** Latest Chrome, Firefox, and Edge
- **Device/viewport baseline:** Desktop, tablet, mobile widths
- **Test data:** Seed data for products/users/posts/comments/reports and at least 1 admin + 2 normal users

## 4) Access and Roles
- **Admin login credential (required note):**
  - Username: `admin`
  - Password: `1234`
- **Roles to validate:** Admin, standard user (and moderator if available in system design)

## 5) Feature Test Coverage

### 5.1 Admin Dashboard
- Dashboard loads successfully for admin role.
- Key cards/metrics render correct values from backend data.
- Admin-only navigation/actions are visible and accessible only to admin.
- Unauthorized role access is blocked (redirect or permission error).

### 5.2 Inventory CRUD
- **Create:** Add new inventory item with valid data.
- **Read:** Item appears in listing/detail view with correct fields.
- **Update:** Edit item details and verify persistence after refresh/reload.
- **Delete:** Remove item and verify it no longer appears in list/search.
- Validation: required fields, invalid format, duplicate constraints (if any).
- Error handling: API failure states display proper error messages and recovery options.

### 5.3 User Management
- Admin can list/search/filter users.
- Admin can create/edit/deactivate/reactivate user accounts.
- Role assignment/update works correctly and persists.
- Permission boundaries are enforced (non-admin cannot access admin actions).
- Audit-relevant changes are visible where applicable (status/role changes).

### 5.4 Forum: Posts, Comments, Like, Report
- **Posts:** Create, view, edit (if owner/admin), and delete behavior.
- **Comments:** Add and render under correct post; edit/delete permissions enforced.
- **Like:** Toggle like/unlike and verify count/state updates correctly.
- **Report:** User can report content with reason; report appears in moderation/admin flow.
- Content moderation handling validates expected status transitions (e.g., pending/resolved).

### 5.5 Notification System
- Notifications are created for key events (e.g., replies, likes, reports, admin actions where applicable).
- In-app notification badge/count updates correctly.
- Notification list displays correct message, target, timestamp, and read/unread state.
- Mark-as-read or clear behavior works and persists.
- No duplicate or missing notifications for single-event triggers.

### 5.6 Responsive Design
- Core screens are usable at representative breakpoints:
  - Mobile: 360x800
  - Tablet: 768x1024
  - Desktop: 1366x768 (or wider)
- Navigation/menu patterns adapt correctly on small screens.
- Critical actions remain accessible without horizontal overflow.
- Tables/cards/forms remain readable and operable across breakpoints.

## 6) Entry and Exit Criteria
- **Entry criteria:**
  - Build deployed and accessible.
  - Required seed data and admin credentials are available.
  - Test environment is stable.
- **Exit criteria:**
  - All critical/high-priority tests passed.
  - No unresolved blocker defects.
  - Medium/low defects are documented with owner and target fix version.

## 7) Defect Severity Guideline
- **Critical:** System unusable, data loss risk, or security/permission breach.
- **High:** Core workflow broken with no practical workaround.
- **Medium:** Feature works partially with workaround.
- **Low:** Minor UI/UX/content issue; does not block workflow.

## 8) Deliverables
- Test execution report (pass/fail with evidence)
- Defect list with severity, repro steps, and status
- Final QA sign-off note for release readiness

