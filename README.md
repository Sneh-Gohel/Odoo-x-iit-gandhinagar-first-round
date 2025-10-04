# 💰 Expense Management

### 🚀 Team:Next()Gen | 

| Name |
|------|
| 1️⃣ Sneh Gohel
| 2️⃣ Shivam Patel 
| 3️⃣ Pramukh Prajapati 
| 4️⃣ Raj Gohel 

---

## 🧪 Demo Video

🎥 **Demo Video Link:** *[(Demo Video)](https://drive.google.com/drive/folders/1idLu4flT2qubM1NP0wraxqs7orQxjQkp?usp=sharing)*

## 📋 Overview

**Expense Management** is a modern expense management platform that helps companies streamline their **expense reimbursement** and **approval workflows**.  
It eliminates manual, error-prone processes by introducing flexible, multi-level, and conditional approval mechanisms — improving transparency, speed, and compliance.

---

## 🧠 Problem Statement

Companies often struggle with manual reimbursement processes that are:
- ⏳ Time-consuming  
- ⚠️ Error-prone  
- 🕵️‍♂️ Lacking transparency  

There is no simple way to:
- Define **approval flows based on thresholds**
- Manage **multi-level approvals**
- Support **flexible approval rules**

**ExpenMan** solves this by providing configurable approval workflows, user role management, and automated processing powered by OCR and APIs.

---

## 🔑 Core Features

### 🧾 Authentication & User Management

- On first login/signup:
  - A new **Company** is auto-created with the selected **country’s currency**.
  - An **Admin User** is automatically created.
- Admin can:
  - Create **Employees** and **Managers**
  - Assign/change **roles** → Employee / Manager
  - Define **manager relationships** for employees

---

### 💵 Expense Submission (Employee Role)

Employees can:
- Submit expense claims:
  - **Amount** (supports foreign currencies)
  - **Category**, **Description**, **Date**
- View their **expense history** (Approved / Rejected)

---

### 🧩 Approval Workflow (Manager/Admin Role)

- Expense first goes to the **Employee’s Manager**, if the `IS_MANAGER_APPROVER` field is enabled.
- When multiple approvers are assigned, the **Admin defines the sequence**.

#### Example Flow:
1. Manager  
2. Finance  
3. Director  

- Each step waits for the current approver’s action before moving to the next.
- Managers can:
  - View **pending approvals**
  - **Approve/Reject** with comments

---

### ⚙️ Conditional Approval Flow

Approval Rules support:
- **Percentage Rule** — e.g., If 60% of approvers approve → Expense approved  
- **Specific Approver Rule** — e.g., If CFO approves → Expense auto-approved  
- **Hybrid Rule** — Combine both (e.g., 60% OR CFO approves)

> These rules can coexist with **multi-level approval flows** for flexible configurations.

---

## 👥 Roles & Permissions

| Role | Permissions |
|------|--------------|
| **Admin** | Create company (auto on signup), manage users, set roles, configure approval rules, view all expenses, override approvals |
| **Manager** | Approve/reject expenses, view team expenses, escalate as per rules |
| **Employee** | Submit expenses, view own expenses, check approval status |

---

## 🔍 Additional Features

### 🧾 OCR for Receipts
Employees can **scan receipts**, and the OCR engine automatically extracts:
- Amount  
- Date  
- Description  
- Expense Type  
- Vendor Name (e.g., Restaurant name)

> This auto-generates an expense entry with all required details.

---

## 🌍 Integrations & APIs

- **Country & Currency API:**  
  [`https://restcountries.com/v3.1/all?fields=name,currencies`](https://restcountries.com/v3.1/all?fields=name,currencies)

- **Currency Conversion API:**  
  [`https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`](https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY})

---

## 🧩 Tech Stack (Suggested)

- **Frontend:** React.js / Next.js  
- **Backend:** Node.js / Express.js  
- **Database:** MongoDB / PostgreSQL  
- **Authentication:** JWT / OAuth  
- **OCR Engine:** Tesseract.js / Google Vision API  
- **API Integration:** Axios / Fetch  

---


---

## 👨‍💻 Team Members


---

## 🧭 Future Enhancements

- ✅ AI-based fraud detection for receipts  
- ✅ Integration with payroll systems  
- ✅ Analytics dashboard for finance teams  
- ✅ Role-based dashboards and KPI insights  



