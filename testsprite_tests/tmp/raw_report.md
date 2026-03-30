
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
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/b7274e5e-bfc0-4669-93c7-43b2efc3abdd
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Registration shows validation when a required field is missing
- **Test Code:** [TC002_Registration_shows_validation_when_a_required_field_is_missing.py](./TC002_Registration_shows_validation_when_a_required_field_is_missing.py)
- **Test Error:** Registration allowed submission with a required field left blank. The registration form did not show a validation error for the missing Email and instead indicated a successful registration.

Observations:
- The Sign Up form was submitted with Username 'testuser_missing_required_01', Password and Confirm Password filled, and the Email field left blank.
- No inline validation or error message (e.g., 'Email is required') appeared in the Create Account modal.
- A browser alert with the text 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' (Registration successful! Please log in) was shown and auto-closed.
- The application accepted the registration without an email and the UI returned to the login state (Login modal visible).
- This indicates the required Email validation is missing or not enforced on the client side.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/fb617372-8df4-488a-8863-eab27ef3870c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Login with email and password successfully
- **Test Code:** [TC006_Login_with_email_and_password_successfully.py](./TC006_Login_with_email_and_password_successfully.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/f033cdb0-02eb-4ebd-ad78-17354b4baf9a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Login shows error on incorrect password
- **Test Code:** [TC007_Login_shows_error_on_incorrect_password.py](./TC007_Login_shows_error_on_incorrect_password.py)
- **Test Error:** Login with invalid credentials did not show an error message. The login modal stayed open and there was no visible indication that authentication failed.

Observations:
- The login modal is visible with Username/Email field containing 'test' and Password field containing '1234'.
- After submitting, the modal remained open with the Log In button still present.
- No error text (English or Thai) indicating invalid credentials or login failure is visible in the modal.
- Other modal elements (Forgot password?, Sign Up, Continue with Google) are present and unchanged.
- No inline validation or alert banner appeared after the submission.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/8b3d327d-8ad2-429e-b8f5-d3964f7d19dc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Logout returns the user to guest state
- **Test Code:** [TC008_Logout_returns_the_user_to_guest_state.py](./TC008_Logout_returns_the_user_to_guest_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/a237b673-fba1-49ee-bf6a-91f547495874
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Password reset request for unknown email shows generic success
- **Test Code:** [TC010_Password_reset_request_for_unknown_email_shows_generic_success.py](./TC010_Password_reset_request_for_unknown_email_shows_generic_success.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/1b657775-2030-42ed-9b12-3bb407907d2f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Reset password with invalid token shows token error
- **Test Code:** [TC011_Reset_password_with_invalid_token_shows_token_error.py](./TC011_Reset_password_with_invalid_token_shows_token_error.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/ba84a422-e812-4f29-9695-06e72ff2695e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Homepage loads hero and component guide entry content
- **Test Code:** [TC012_Homepage_loads_hero_and_component_guide_entry_content.py](./TC012_Homepage_loads_hero_and_component_guide_entry_content.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/ba547301-4fe0-4e5d-866c-ec31fd8acab5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Browse components with the guide slider and open component details
- **Test Code:** [TC013_Browse_components_with_the_guide_slider_and_open_component_details.py](./TC013_Browse_components_with_the_guide_slider_and_open_component_details.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/3072255f-1dc7-493e-a3ae-fb89bedaa74b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Navigate from Homepage to Build Wizard via plan affordance
- **Test Code:** [TC014_Navigate_from_Homepage_to_Build_Wizard_via_plan_affordance.py](./TC014_Navigate_from_Homepage_to_Build_Wizard_via_plan_affordance.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/c3639e1d-deac-4285-a0aa-840e91ab0a2f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Build page updates total price and benchmark scores after selecting a component
- **Test Code:** [TC016_Build_page_updates_total_price_and_benchmark_scores_after_selecting_a_component.py](./TC016_Build_page_updates_total_price_and_benchmark_scores_after_selecting_a_component.py)
- **Test Error:** Selecting the NVIDIA GeForce RTX 3060 Ti updated the build price, but one of the three benchmark scores did not update as expected.

Observations:
- The selected Graphics Card is shown: "NVIDIA GeForce RTX 3060 Ti" with price "฿11,900" on the build page.
- Estimated Total Price shows "11,900".
- Creative / 3D score displays "28".
- Gaming Power score displays "50".
- Work & Office score is empty / has no visible numeric value.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/71ed8b66-ada0-43fb-bde0-2a7eeceab817
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Save build requires a build name (validation)
- **Test Code:** [TC017_Save_build_requires_a_build_name_validation.py](./TC017_Save_build_requires_a_build_name_validation.py)
- **Test Error:** Saving a build without entering a name did not show any validation message and there is no clear indication that the save was blocked. The expected required-name validation appears to be missing or not displayed.

Observations:
- The save confirmation modal (ยืนยันการบันทึกสเปก) is open and shows the Build Name field (ชื่อสเปก (Build Name)) with placeholder "เช่น สเปกเล่นเกมงบ 30k".
- Clicking the "SAVE BUILD" button without typing a name produced no validation or error text (no Thai "กรุณา..." or English "required" message was visible).
- No navigation or success/failure message occurred; the modal remained visible after clicking Save Build.
- The selected components (Processor: Intel Core i5-12400F) and Estimated Total Price (฿4,990) are shown in the modal.
- Authentication was attempted earlier in the session but is not currently blocking this save modal (no auth prompt visible now).

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/d21bf553-ac58-4332-99ed-79f1be0385f5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Save build while not authenticated prompts for login and blocks saving
- **Test Code:** [TC018_Save_build_while_not_authenticated_prompts_for_login_and_blocks_saving.py](./TC018_Save_build_while_not_authenticated_prompts_for_login_and_blocks_saving.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/31f96ab4-43f7-49fd-9f34-b661f9b93af5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Build Wizard produces a recommended preset and allows customizing in Build page
- **Test Code:** [TC020_Build_Wizard_produces_a_recommended_preset_and_allows_customizing_in_Build_page.py](./TC020_Build_Wizard_produces_a_recommended_preset_and_allows_customizing_in_Build_page.py)
- **Test Error:** The wizard did not load a recommended preset for the selected usage and budget, so it is not possible to proceed to the Build page with a preset applied.

Observations:
- The page heading 'สเปกที่แนะนำสำหรับคุณ' is visible.
- A message 'ยังไม่มีสเปกแนะนำในหมวดนี้' is displayed indicating no recommended preset in this category.
- Buttons shown: 'เลือกงบใหม่' (choose a different budget) and 'จัดสเปกเอง' (customize/build manually).
- The UI remains on the planning wizard (/plan) after selecting 'Mid Range' and did not navigate to the Build page.
- The recommended-preset flow is not available for this usage+budget combination, so the preset-based customization step cannot be completed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/5b8ec4f1-c698-4376-a739-9c8507b10b9e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Build Wizard shows empty-state message when no preset exists for the chosen budget
- **Test Code:** [TC021_Build_Wizard_shows_empty_state_message_when_no_preset_exists_for_the_chosen_budget.py](./TC021_Build_Wizard_shows_empty_state_message_when_no_preset_exists_for_the_chosen_budget.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/cacab50d-5d3a-4242-ab3d-7983b0de3a2b
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