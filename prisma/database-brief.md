# Database Schema Reference: Classic Car Event

### 1. Core Tables & Attributes

**Dashboard_User** (Admin Access)
* `id`: UUID (PK)
* `email`: String (Unique)
* `password_hash`: String
* `role`: Enum (ADMIN, STAFF)

**Participant** (The Owner)
* `id`: UUID (PK)
* `national_id`: String (Unique)
* `full_name`: String
* `email`: String (Unique)
* `qr_token`: String (Unique) — *Used for master check-in scan*

**Vehicle** (The Car)
* `id`: UUID (PK)
* `participant_id`: FK -> Participant.id
* `brand`: String
* `model`: String
* `license_plate`: String (Unique)

**Registration** (The Order)
* `id`: UUID (PK)
* `participant_id`: FK -> Participant.id
* `status`: Enum (PENDING, PAID, CANCELLED)

**Registration_Item** (The Individual Ticket)
* `id`: UUID (PK)
* `registration_id`: FK -> Registration.id
* `vehicle_id`: FK -> Vehicle.id (Unique) — *One ticket per car*
* `entry_number`: Integer (Unique/Nullable) — *Bib number*
* `checkin_date`: Timestamp (Nullable) — *NULL = Not present / Not in raffle*

**Payment** (Transaction Log)
* `id`: UUID (PK)
* `registration_id`: FK -> Registration.id
* `provider`: Enum (STRIPE, PAYPAL)
* `amount`: Decimal
* `status`: Enum (COMPLETED, FAILED)

---

### 2. Key Relationships
1.  **Participant 1:N Vehicle**: A user can own multiple cars.
2.  **Participant 1:N Registration**: A user can make multiple registration orders.
3.  **Registration 1:N Registration_Item**: One payment can cover multiple cars.
4.  **Vehicle 1:1 Registration_Item**: A specific car is linked to exactly one ticket for the event.

---

### 3. Critical Logic for Developers

* **Check-in Flow**:
    1. Scan `Participant.qr_token`.
    2. Display all linked `Registration_Items`.
    3. Update `checkin_date` to `NOW()` only for the cars physically present.
* **Raffle Logic**:
    * **Query**: `SELECT * FROM Registration_Item WHERE checkin_date IS NOT NULL`.
    * **Rule**: Each checked-in car equals one entry in the raffle.
* **Performance**:
    * Index `qr_token` (Hash) for < 800ms scans.
    * Index `license_plate` (B-Tree) for manual searches.