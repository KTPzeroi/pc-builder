# TestSprite AI Testing Report — PC Builder

---

## 1️⃣ Document Metadata
- **Project Name:** pc-builder
- **Test Date:** 2026-03-31
- **Prepared by:** TestSprite AI + Antigravity
- **Server Mode:** Development (limited to 15 high-priority tests)
- **Test Runner:** TestSprite MCP (Cloud Browser Testing)
- **Local URL:** http://localhost:3000

---

## 2️⃣ Requirement Validation Summary

### 🔐 REQ-1: Authentication & User Management

| ID | Test Case | Status | Link |
|---|---|---|---|
| TC001 | Register a new account successfully | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/b7274e5e-bfc0-4669-93c7-43b2efc3abdd) |
| TC002 | Registration shows validation when required field is missing | ❌ **Failed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/fb617372-8df4-488a-8863-eab27ef3870c) |
| TC006 | Login with email and password successfully | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/f033cdb0-02eb-4ebd-ad78-17354b4baf9a) |
| TC007 | Login shows error on incorrect password | ❌ **Failed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/8b3d327d-8ad2-429e-b8f5-d3964f7d19dc) |
| TC008 | Logout returns the user to guest state | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/a237b673-fba1-49ee-bf6a-91f547495874) |
| TC010 | Password reset for unknown email shows generic success | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/1b657775-2030-42ed-9b12-3bb407907d2f) |
| TC011 | Reset password with invalid token shows error | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/ba84a422-e812-4f29-9695-06e72ff2695e) |

> **TC002 Analysis:** ฟอร์มสมัครสมาชิกไม่มี **Client-side Validation** สำหรับช่อง Email — ปล่อยให้ User ส่งฟอร์มโดยไม่กรอก Email ได้ ระบบแสดง Toast "สมัครสมาชิกสำเร็จ" ทั้งที่ไม่ควรยอมให้ผ่าน
>
> **TC007 Analysis:** เมื่อ Login ด้วย Password ผิด **ไม่มี Error Message** แสดงให้ User เห็น — Modal ยังคงเปิดค้างอยู่โดยไม่มีการแจ้งเตือนใดๆ ทำให้ User ไม่รู้ว่าเกิดปัญหาอะไร

---

### 🏠 REQ-2: Homepage & Component Guide

| ID | Test Case | Status | Link |
|---|---|---|---|
| TC012 | Homepage loads hero and component guide entry content | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/ba547301-4fe0-4e5d-866c-ec31fd8acab5) |
| TC013 | Browse components with the guide slider and open details | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/3072255f-1dc7-493e-a3ae-fb89bedaa74b) |
| TC014 | Navigate from Homepage to Build Wizard via Plan button | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/c3639e1d-deac-4285-a0aa-840e91ab0a2f) |

> ✅ Homepage ทำงานได้สมบูรณ์ทุกจุด — Hero Banner, Component Guide Slider, และ Navigation ไปหน้า Plan

---

### 🖥️ REQ-3: PC Build System

| ID | Test Case | Status | Link |
|---|---|---|---|
| TC016 | Build page updates total price and benchmark scores | ❌ **Failed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/71ed8b66-ada0-43fb-bde0-2a7eeceab817) |
| TC017 | Save build requires a build name (validation) | ❌ **Failed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/d21bf553-ac58-4332-99ed-79f1be0385f5) |
| TC018 | Save build while not authenticated prompts for login | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/31f96ab4-43f7-49fd-9f34-b661f9b93af5) |

> **TC016 Analysis:** เลือก GPU (RTX 3060 Ti) แล้ว Gaming Score = 50, Creative = 28 แต่ **Work & Office Score ไม่แสดงค่า** — เนื่องจากสูตรคำนวณ Working Score ต้องการ CPU + RAM + Storage เป็นหลัก การเลือกแค่ GPU อาจทำให้ค่าเป็น 0 หรือ NaN ซึ่ง UI ไม่แสดง
>
> **TC017 Analysis:** กด Save Build โดยไม่กรอกชื่อ → **ไม่มี Validation Error** แสดง Modal ยังค้างอยู่โดยไม่มี Feedback ให้ User

---

### 🧭 REQ-4: Build Wizard (Plan Your Build)

| ID | Test Case | Status | Link |
|---|---|---|---|
| TC020 | Build Wizard produces a recommended preset | ❌ **Failed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/5b8ec4f1-c698-4376-a739-9c8507b10b9e) |
| TC021 | Build Wizard shows empty-state when no preset exists | ✅ **Passed** | [View](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641/cacab50d-5d3a-4242-ab3d-7983b0de3a2b) |

> **TC020 Analysis:** ยังไม่มีข้อมูล Preset ในฐานข้อมูล → ข้อความ "ยังไม่มีสเปกแนะนำในหมวดนี้" แสดงถูกต้อง (TC021 ผ่าน) แต่เนื่องจากไม่มี Preset → Test ที่คาดหวังจะเห็น Preset จึง Fail — **ไม่ใช่ Bug ของโค้ด** แค่ยังไม่มี Test Data เท่านั้น

---

## 3️⃣ Coverage & Matching Metrics

- **Overall Pass Rate:** 10/15 = **66.67%**

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|---|---|---|---|
| REQ-1: Authentication | 7 | 5 | 2 |
| REQ-2: Homepage | 3 | 3 | 0 |
| REQ-3: PC Build System | 3 | 1 | 2 |
| REQ-4: Build Wizard | 2 | 1 | 1 |
| **Total** | **15** | **10** | **5** |

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical — ต้องแก้ไขก่อนนำเสนอ

| # | ปัญหา | ที่มา | ผลกระทบ | แนวทางแก้ไข |
|---|---|---|---|---|
| 1 | **สมัครสมาชิกโดยไม่กรอก Email ได้** | TC002 | ข้อมูล User ในDBไม่สมบูรณ์, ไม่สามารถ Reset Password ได้ | เพิ่ม `isRequired` ใน Email Input + ตรวจสอบฝั่ง API ก่อน Create |
| 2 | **Login ผิดไม่แสดง Error Message** | TC007 | UX แย่มาก User ไม่รู้ว่ารหัสผิดหรือระบบมีปัญหา | เพิ่ม State `loginError` + แสดงข้อความ "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| 3 | **Save Build ไม่มี Name Validation** | TC017 | อาจบันทึก Build ที่ไม่มีชื่อลง DB ได้ | เพิ่มเงื่อนไขตรวจสอบ `if (!buildName.trim())` ก่อน Submit |

### 🟡 High — ควรแก้ไข

| # | ปัญหา | ที่มา | ผลกระทบ | แนวทางแก้ไข |
|---|---|---|---|---|
| 4 | **Work Score ไม่แสดงเมื่อเลือกแค่ GPU** | TC016 | User อาจสับสนเมื่อเห็น Score ว่างเปล่า | แสดง "0" หรือ "—" แทนค่าว่าง เมื่อยังเลือก Component ไม่ครบ |
| 5 | **Build Wizard ไม่มี Preset Data** | TC020 | ฟีเจอร์หลักใช้ไม่ได้จนกว่า Admin จะเพิ่มข้อมูล | (ไม่ใช่ Bug) Admin ต้องเพิ่ม Preset ผ่านหน้า `/admin/presets` |

### 🟢 ยังไม่ได้ทดสอบ (เนื่องจาก Dev Mode จำกัด 15 Tests)

- Admin Dashboard, Inventory CRUD, User Management
- Forum Posts, Comments, Like, Report
- Notification System
- Responsive Design
- Security (XSS, SQL Injection, Authorization)
- System Config (Baselines, Weights, Policies)

> **แนะนำ:** เพื่อทดสอบครบทุกจุด ให้ build production แล้วรัน TestSprite อีกครั้ง:
> ```bash
> npm run build
> npm run start
> ```
> จะได้ทดสอบ **30 test cases** แทน 15

---

## 📎 Test Artifacts

- **Raw Report:** [testsprite_tests/tmp/raw_report.md](file:///f:/CODE/FinalProj/pc-builder/testsprite_tests/tmp/raw_report.md)
- **Test Results JSON:** [testsprite_tests/tmp/test_results.json](file:///f:/CODE/FinalProj/pc-builder/testsprite_tests/tmp/test_results.json)
- **Test Scripts:** `testsprite_tests/tmp/TC*.py`
- **Dashboard:** [TestSprite Dashboard](https://www.testsprite.com/dashboard/mcp/tests/b04ffb15-7e5f-4550-88cb-390fe8404641)
