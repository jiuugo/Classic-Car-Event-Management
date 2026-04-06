### 1. Architecture Summary

To comprehensively manage the database for the classic car event, the application requires **6 main modules (screens)** and **4 secondary screens (detail views & wizards)**.

The architecture is conceptually divided into three areas:
1.  **Monitoring & Finance:** Global Dashboard and control over registrations/payments.
2.  **Entity Management:** Participant and Vehicle directories, including manual walk-in registrations.
3.  **Event Day Operations:** Screens heavily optimized for on-site use, such as Check-in (ultra-fast, scanner-oriented) and Raffle management.

This hierarchical structure ensures that the event staff (STAFF) can operate swiftly on the day of the event without being distracted by financial settings, handle unexpected walk-ins seamlessly, and allow administrators (ADMIN) to retain a 360-degree view of the business.

---

### 2. Site Map

* **1. Dashboard (Home)**
* **2. Event Operations**
    * 2.1. Check-in Hub (Scanner & Manual Search)
    * 2.2. Raffle Room
* **3. Participants**
    * 3.1. Participant Detail (360 Profile)
    * 3.2. Add New Participant (Manual Registration Wizard)
* **4. Vehicle Fleet**
* **5. Registrations & Payments**
    * 5.1. Registration Detail (Order & Billing)
* **6. Settings / Staff (Admin Only)**

---

### 3. Screen Breakdown

#### 1. Dashboard (Home)
* **Primary Objective:** Provide a real-time bird's-eye view of the event's status and financial performance.
* **Information to Display:**
    * Key Metrics (KPIs): Total Participants, Total Registered Vehicles, Total Revenue (Sum of `Payment.amount` where `status = COMPLETED`), Live Attendance Rate (% of cars with non-null `checkin_date`).
    * Charts: Registration evolution by day, Payment status breakdown (Paid vs. Pending).
* **User Actions:** Read, Filter by date range.
* **Links & Navigation:** Highly visible shortcuts to the "Check-in Hub" and "Raffle Room".

#### 2.1. Check-in Hub
* **Primary Objective:** Record the physical entry of cars on event day as quickly as possible (< 800ms).
* **Information to Display:**
    * Initial State: Split screen featuring a camera viewer for QR scanning (`Participant.qr_token`) and a fallback search field (Search by `Vehicle.license_plate` or `Participant.national_id`).
    * Post-Scan State: Participant Card and a list of their associated `Registration_Item` records, displaying Brand, Model, License Plate, and Bib Number (`entry_number`) for each.
* **User Actions:** * Scan/Search.
    * Select via *checkboxes* which specific vehicles belonging to the participant are crossing the gate at that moment.
    * Confirm Check-in (Updates `checkin_date` to `NOW()` exclusively for the selected items).
* **Links & Navigation:** "Next Scan" button (fast reload of the same view).

#### 2.2. Raffle Room
* **Primary Objective:** Execute the raffle among actual attendees in a transparent manner.
* **Information to Display:** * Large Counter: "Eligible Vehicles" (Based on `SELECT * FROM Registration_Item WHERE checkin_date IS NOT NULL`).
    * Winner Panel: Once executed, displays the Participant's Name, winning Car License Plate, and Bib Number (`entry_number`).
* **User Actions:** * Read (view total participants in the draw).
    * "Generate Random Winner" button.
    * Export winner log.
* **Links & Navigation:** Direct link to the winning Participant's Profile to view contact details.

#### 3. Participants (Directory)
* **Primary Objective:** Manage vehicle owners and resolve account issues.
* **Information to Display:** Data table featuring Full Name, National ID/Passport, Email, and the count of associated vehicles.
* **User Actions:** Read, Filter, Search (by name or ID), Export to CSV/Excel, **Create New Participant (Walk-in)**.
* **Links & Navigation:** Clicking a row leads to "3.1. Participant Detail". A primary button leads to "3.2. Add New Participant".

#### 3.1. Participant Detail (360 Profile)
* **Primary Objective:** Group all relational information for a specific user.
* **Information to Display:** * Master data of the participant.
    * Preview of their personal QR code and Token.
    * Tab A: List of their Vehicles (`Vehicle`).
    * Tab B: History of their Registrations (`Registration`) and their statuses.
* **User Actions:** Update personal data, Resend QR code via email, Delete (if event policies allow and no payments are linked).
* **Links & Navigation:** Clicking a registration leads to "5.1. Registration Detail". Back to Participants.

#### 3.2. Add New Participant (Manual Registration Wizard)
* **Primary Objective:** Allow Staff to manually register a participant and their vehicle(s) on-site, bypass the frontend, and optionally process a manual payment.
* **Information to Display:** * **Step 1 (Participant):** Form for `full_name`, `email`, and `national_id`.
    * **Step 2 (Vehicle):** Form for `brand`, `model`, and `license_plate`.
    * **Step 3 (Order):** Toggle for `status` (PENDING/PAID) and `amount`.
* **User Actions:** * **Search/Link:** Check if the `national_id` already exists to avoid duplicates.
    * **Create:** Generate the `Participant` (auto-generating the UUID `qr_token`), `Vehicle`, `Registration`, and `Registration_Item` records in a single transaction.
    * **Assign Bib:** Manually enter or auto-generate the `entry_number`.
* **Links & Navigation:** After completion, redirects to the **Check-in Hub** for that specific user to finalize their immediate entry, or back to the Participant Directory.

#### 4. Vehicle Fleet
* **Primary Objective:** An independent directory focused on the event's core asset (the car). Useful for venue control and technical security.
* **Information to Display:** Table with Brand, Model, License Plate, Owner Name (`Participant_id`), Bib Number (`entry_number`), and Check-in Status (Present/Absent).
* **User Actions:** Search exclusively by License Plate (leveraging the B-Tree index), Filter by brand or attendance status.
* **Links & Navigation:** Clicking the owner's name leads to "Participant Detail".

#### 5. Registrations & Payments (Order Control)
* **Primary Objective:** Billing control, payment dispute resolution, and capacity monitoring.
* **Information to Display:** Consolidated table showing Order ID (`Registration.id`), Buyer Name, Order Status (PENDING, PAID, CANCELLED), Total Amount, Provider (Stripe/PayPal), and Payment Status.
* **User Actions:** Filter by registration status or payment status, Search by participant email.
* **Links & Navigation:** Clicking the order leads to "5.1. Registration Detail".

#### 5.1. Registration Detail
* **Primary Objective:** View the exact breakdown of what a user paid for in a specific order.
* **Information to Display:**
    * Header with Payment data (`Payment`).
    * List of "Tickets" (`Registration_Item`): Shows which specific vehicle each ticket covers and its assigned bib number.
* **User Actions:** Force status update (e.g., change from PENDING to PAID if a manual bank transfer was made), Cancel/Refund registration.
* **Links & Navigation:** Back to Registrations & Payments.

#### 6. Settings / Staff (Admin Only)
* **Primary Objective:** Manage Dashboard access.
* **Information to Display:** List of `Dashboard_User` records (Email, Role).
* **User Actions:** Create new user, Update password/role, Revoke access.
* **Links & Navigation:** None external to this view.