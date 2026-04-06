
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** pc-builder
- **Date:** 2026-03-31
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Register a new account successfully
- **Test Code:** [TC001_Register_a_new_account_successfully.py](./TC001_Register_a_new_account_successfully.py)
- **Test Error:** Registration did not succeed — the provided username or email appears to be already in use.

Observations:
- The Create Account modal remained open after submitting the form.
- A red alert is visible: "Email หรือ Username นี้ถูกใช้ไปแล้ว" (Email or Username is already used).
- The Username field contains "testuser_unique".
- The Email field contains "testuser_unique@example.com".
- The Password and Confirm Password fields are populated.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/477cf0eb-72ff-40fe-bd70-72184429488d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Registration shows validation error for invalid email
- **Test Code:** [TC002_Registration_shows_validation_error_for_invalid_email.py](./TC002_Registration_shows_validation_error_for_invalid_email.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/3d1673d6-481a-47ea-b3a5-3a9987572dd0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Login successfully with email and password
- **Test Code:** [TC005_Login_successfully_with_email_and_password.py](./TC005_Login_successfully_with_email_and_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/1767d524-b173-4f04-9c3c-b8ca8c751a33
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Login shows authentication error with incorrect password
- **Test Code:** [TC006_Login_shows_authentication_error_with_incorrect_password.py](./TC006_Login_shows_authentication_error_with_incorrect_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/fe52ab8b-e2e2-4611-910d-808784e98729
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 PC Build page loads primary component selection and scores
- **Test Code:** [TC008_PC_Build_page_loads_primary_component_selection_and_scores.py](./TC008_PC_Build_page_loads_primary_component_selection_and_scores.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/ba129c71-bac3-4ca9-a6dd-0d9422de1955
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Select a component and see totals and scores update
- **Test Code:** [TC009_Select_a_component_and_see_totals_and_scores_update.py](./TC009_Select_a_component_and_see_totals_and_scores_update.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/422fe14b-0dda-4817-9d3e-75e59ab6d30b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Attempt to save build without name shows validation error
- **Test Code:** [TC010_Attempt_to_save_build_without_name_shows_validation_error.py](./TC010_Attempt_to_save_build_without_name_shows_validation_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/4b1a5fc3-5cb4-4a64-b44c-56035d3441f8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Complete Build Wizard flow to recommended preset and start customization
- **Test Code:** [TC011_Complete_Build_Wizard_flow_to_recommended_preset_and_start_customization.py](./TC011_Complete_Build_Wizard_flow_to_recommended_preset_and_start_customization.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/f53851fb-b475-459b-8a88-16fbf7b72bef
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Change Build Wizard selections using back navigation
- **Test Code:** [TC012_Change_Build_Wizard_selections_using_back_navigation.py](./TC012_Change_Build_Wizard_selections_using_back_navigation.py)
- **Test Error:** Recommended preset results did not appear after changing the budget selection. The wizard allows returning to budget selection and choosing a different tier, but no recommended builds were displayed for the tested budgets.

Observations:
- The back button ('เลือกงบใหม่') correctly returned to the budget selection screen.
- After selecting 'Mid Range', a loading message appeared, then the page displayed 'ยังไม่มีสเปกแนะนำในหมวดนี้' (no recommended presets).
- After selecting 'Hi-End', the page again shows 'ยังไม่มีสเปกแนะนำในหมวดนี้' with buttons to choose a new budget or build manually.
- No recommended preset cards or build detail sections were visible after either budget selection.
- Waiting did not produce any recommended results for the selected categories.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/fdc30a60-0475-4a2f-b84a-4b9dafb2b0d9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Recommended preset displays component details and reasons
- **Test Code:** [TC013_Recommended_preset_displays_component_details_and_reasons.py](./TC013_Recommended_preset_displays_component_details_and_reasons.py)
- **Test Error:** No recommended preset appeared for the selected usage and budget. The wizard shows a message saying there are currently no recommended specs in this category.

Observations:
- The page header reads 'สเปกที่แนะนำสำหรับคุณ' with tags for the chosen usage 'ทำงาน' and budget 'Mid Range'.
- The central panel displays the message 'ยังไม่มีสเปกแนะนำในหมวดนี้' (No recommended specs in this category).
- Action buttons shown include 'เลือกงบใหม่' (Choose new budget) and 'จัดสเปกเอง' (Build manually).
- No component list, component details, or recommendation rationale/reasons are visible on the page.
- The page suggests trying another budget or building specs manually, indicating the recommendation feature is not available for this selection.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/6bbf7328-4d41-4e12-96cb-26388ed19b93
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Report a forum post with a selected reason
- **Test Code:** [TC016_Report_a_forum_post_with_a_selected_reason.py](./TC016_Report_a_forum_post_with_a_selected_reason.py)
- **Test Error:** Reporting a forum post could not be completed because the post actions menu does not provide a 'Report' option.

Observations:
- The forum post page (/forum/3) loaded and the user is authenticated as 'admin'.
- The post actions menu (•••) opened successfully.
- The menu only shows 'คัดลอกลิงก์โพสต์' (Copy post link) and 'ซ่อนกระทู้ (Private)'.
- No 'Report' (or equivalent) menu item or report dialog is available to start the report flow.
- Because the report option is missing, selecting a reason, entering a description, and submitting a report cannot be performed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/d7209e50-b029-4b84-87e5-11e1e3cdcbfa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Report a forum comment with a selected reason
- **Test Code:** [TC017_Report_a_forum_comment_with_a_selected_reason.py](./TC017_Report_a_forum_comment_with_a_selected_reason.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/64b28b66-b9d1-429a-8d73-a50e86f7ce48
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Report validation: submit without selecting a reason
- **Test Code:** [TC018_Report_validation_submit_without_selecting_a_reason.py](./TC018_Report_validation_submit_without_selecting_a_reason.py)
- **Test Error:** The report flow could not be started because the post options menu does not include any Report action or a report form.

Observations:
- The post options menu dialog opened successfully.
- Visible menu items are: 'คัดลอกลิงก์โพสต์' (copy post link) and 'ซ่อนกระทู้ (Private)'.
- No 'Report' or equivalent menu item was found in the post actions menu.
- The post content and comments are visible and the user is logged in (admin avatar shown), so the absence of a report option appears to be a missing feature rather than a permissions issue.
- Without a report action or report form, submission and validation checks (reason-required) cannot be performed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/48b35eef-c673-4f97-82b7-8acea26cca1a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Notification dropdown opens from homepage navbar
- **Test Code:** [TC021_Notification_dropdown_opens_from_homepage_navbar.py](./TC021_Notification_dropdown_opens_from_homepage_navbar.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/8ea3f150-c2c3-47df-b1d9-3df88f29f869
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Navigate to a notification target by clicking a notification
- **Test Code:** [TC022_Navigate_to_a_notification_target_by_clicking_a_notification.py](./TC022_Navigate_to_a_notification_target_by_clicking_a_notification.py)
- **Test Error:** A notification click could not be tested because the notifications dropdown contains no notifications.

Observations:
- The notification bell was clicked and the notifications dropdown opened.
- The dropdown shows the message 'ไม่มีการแจ้งเตือนใหม่' (no new notifications).
- The menu contains only a header item and no actionable notification entries to click.
- The Admin dashboard is visible behind the dropdown.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/f8560ccf-a4dc-48fa-ab36-f6a8d572623f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Profile page loads saved builds and account settings for authenticated user
- **Test Code:** [TC026_Profile_page_loads_saved_builds_and_account_settings_for_authenticated_user.py](./TC026_Profile_page_loads_saved_builds_and_account_settings_for_authenticated_user.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/da5bafc9-683b-4f98-b0a8-db2e274f0d9e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Edit a saved build and persist changes
- **Test Code:** [TC027_Edit_a_saved_build_and_persist_changes.py](./TC027_Edit_a_saved_build_and_persist_changes.py)
- **Test Error:** A saved build could not be opened because no saved builds are present in the user's profile.

Observations:
- The Profile page (/profile) is displayed and the 'MY BUILDS' tab is active.
- The builds panel shows the message: "ยังไม่มีข้อมูลสเปกที่บันทึกไว้" (no saved builds).
- There are no build entries or controls (open/edit) visible in the saved builds area.
- The admin user is logged in (profile header and avatar visible) and account actions like 'Edit Profile' and 'Change Password' are present.
- Because there are no saved builds, the steps to open a saved build, edit its name to 'Build Alpha 01', save, and verify persistence cannot be performed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/95e97b28-f3d0-4aae-84e1-f4e4f5c73ba0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Unauthenticated access to profile is blocked
- **Test Code:** [TC028_Unauthenticated_access_to_profile_is_blocked.py](./TC028_Unauthenticated_access_to_profile_is_blocked.py)
- **Test Error:** Accessing the protected /profile page did not present an authentication prompt or an access-denied message. The profile page remained stuck showing a persistent loading indicator and could not be verified.

Observations:
- Navigated to /profile multiple times (6 attempts); each showed 'Loading Profile...' and did not reach a stable state.
- No authentication prompt, login form, or access-denied message was visible on the page.
- A LOGIN button remains visible in the header, but it did not change the profile page's loading state.
- Waiting on the page did not resolve the loading indicator; the protected-profile behavior could not be confirmed.

Result: The expected authentication prompt or access-denied UI for /profile is not present or the page is stuck loading; the issue is being reported (success=false).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/45bd39d3-9b4c-4330-8242-43f626ded0a4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Reset password with valid token updates password
- **Test Code:** [TC029_Reset_password_with_valid_token_updates_password.py](./TC029_Reset_password_with_valid_token_updates_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/f7d0b7ba-982b-4626-96f4-212559fcbd6b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Reset password rejects invalid or expired token
- **Test Code:** [TC030_Reset_password_rejects_invalid_or_expired_token.py](./TC030_Reset_password_rejects_invalid_or_expired_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/e48ce92b-0052-4f29-b62f-f94ab79970c2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC031 Reset password prevents submit when passwords do not match
- **Test Code:** [TC031_Reset_password_prevents_submit_when_passwords_do_not_match.py](./TC031_Reset_password_prevents_submit_when_passwords_do_not_match.py)
- **Test Error:** The password reset form could not be tested because the reset-password page shows an invalid request and no form fields were available to enter a token or passwords.

Observations:
- The page displays a prominent 'INVALID REQUEST' message.
- The Thai message indicates the reset token was not found (token missing/invalid).
- There are no input fields visible for reset token, new password, or confirm password.
- Navigation elements (HOME, BUILD, FORUM, LOGIN) are present and the URL is /reset-password.
- Because the form is not present, submission and validation behavior (password mismatch) cannot be verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/4aac531d-33fa-4a3b-9517-f1fd7708e358
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC035 Admin dashboard loads core stats, chart, and reports
- **Test Code:** [TC035_Admin_dashboard_loads_core_stats_chart_and_reports.py](./TC035_Admin_dashboard_loads_core_stats_chart_and_reports.py)
- **Test Error:** Admin dashboard access succeeded, but some expected overview counts are missing.

Observations:
- Successfully logged in and reached the Admin Overview page at /admin (Admin UI visible).
- Total Users count is displayed: 11.
- Total Builds count is displayed: 1; Active/Active Reports shown: 2.
- Community Engagement activity chart is visible and a User Budget Tiers chart is present.
- No explicit overview counts for "Components" or "Posts" were found on the page.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/86c88736-4d68-4294-819c-d0bcfe9fb59b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC036 Admin dashboard sidebar navigates to another admin page
- **Test Code:** [TC036_Admin_dashboard_sidebar_navigates_to_another_admin_page.py](./TC036_Admin_dashboard_sidebar_navigates_to_another_admin_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/d91f8d18-deba-4e9e-aab1-e0bc7f8ba047
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC037 Admin dashboard denies access when not authenticated
- **Test Code:** [TC037_Admin_dashboard_denies_access_when_not_authenticated.py](./TC037_Admin_dashboard_denies_access_when_not_authenticated.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/15052c90-6bf2-4a05-9c93-3732b5ab7886
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC038 Admin inventory loads and allows filtering by component type
- **Test Code:** [TC038_Admin_inventory_loads_and_allows_filtering_by_component_type.py](./TC038_Admin_inventory_loads_and_allows_filtering_by_component_type.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/6c3a5e22-5dfc-4dfc-b2ea-2a57949b4144
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC039 Admin inventory can create a new component and see it in the list
- **Test Code:** [TC039_Admin_inventory_can_create_a_new_component_and_see_it_in_the_list.py](./TC039_Admin_inventory_can_create_a_new_component_and_see_it_in_the_list.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/8e4235fd-e7b6-4385-bc29-ff47aa65feb7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC041 Admin inventory prevents creating a component with missing required fields
- **Test Code:** [TC041_Admin_inventory_prevents_creating_a_component_with_missing_required_fields.py](./TC041_Admin_inventory_prevents_creating_a_component_with_missing_required_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/612dfb5e-efe2-4ea8-b8ec-494d1e17ad0a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC044 Create and activate a new preset build
- **Test Code:** [TC044_Create_and_activate_a_new_preset_build.py](./TC044_Create_and_activate_a_new_preset_build.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/dac9e9cd-5d09-4603-ad48-caea19033e46
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC045 Prevent saving a preset without components
- **Test Code:** [TC045_Prevent_saving_a_preset_without_components.py](./TC045_Prevent_saving_a_preset_without_components.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/54721d7d-aa89-46d6-9ae3-f6560dc156e4
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC046 View presets list and basic details
- **Test Code:** [TC046_View_presets_list_and_basic_details.py](./TC046_View_presets_list_and_basic_details.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f9508bf4-1706-4ef2-a7b2-94f5b3205f79/b3a02182-a865-4d59-bf62-4ab2646c38de
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **66.67** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---