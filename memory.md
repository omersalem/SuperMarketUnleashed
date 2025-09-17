## Module: Basic Authentication and Foundation

**Status:** Completed

**Functionality:**
- Created the basic project structure with React and Vite.
- Integrated and configured Tailwind CSS.
- Set up `react-i18next` for English and Arabic translations.
- Created a responsive login page with email, password, role selection, and language switching.
- The UI is styled according to the `design.json` file.
- Implemented Firebase authentication with email and password.
- Added error handling and loading states to the login form.

---

## Module: User Management

**Status:** Skipped

**Reason:** The user management feature requires Firebase Cloud Functions, which in turn requires the "Blaze" (pay-as-you-go) plan. The user does not have a payment method and has chosen to skip this feature for now. The admin will manage users manually in the Firebase Console.

---

## Module: Customer Management

**Status:** Completed

**Functionality:**
- Created a `customers` collection in the Firestore database.
- Implemented full CRUD (Create, Read, Update, Delete) functionality for customers in the Admin Dashboard.
- Created modals for adding and editing customers.
- The UI is connected to the Firestore database to manage customer data in real-time.

**Testing:**
- The admin can add, edit, and delete customers from the Admin Dashboard.
- The customer list is updated in real-time.

---

## Module: Vendor Management

**Status:** Completed

**Functionality:**
- Created a `vendors` collection in the Firestore database.
- Implemented full CRUD (Create, Read, Update, Delete) functionality for vendors in the Admin Dashboard.
- Created modals for adding and editing vendors.
- The UI is connected to the Firestore database to manage vendor data in real-time.

**Testing:**
- The admin can add, edit, and delete vendors from the Admin Dashboard.
- The vendor list is updated in real-time.

---

## Module: Product Management

**Status:** Completed

**Functionality:**
- Created `categories` and `products` collections in the Firestore database.
- Implemented full CRUD (Create, Read, Update, Delete) functionality for both categories and products.
- Implemented file-based image upload using Cloudinary.
- The UI is connected to Firestore and Cloudinary to manage product data.

**Testing:**
- The admin can add, edit, and delete categories and products.
- The admin can upload product images from their computer.

---

## Module: Sales Management

**Status:** Completed

**Functionality:**
- Created a `sales` collection in the Firestore database.
- Implemented sales recording, allowing selection of customers and products.
- Automatically calculates total sale amount.
- Updates product stock after a sale.

**Testing:**
- The admin can record sales and verify stock updates.

---

## Module: Purchase Management

**Status:** Completed

**Functionality:**
- Created a `purchases` collection in the Firestore database.
- Implemented purchase recording, allowing selection of vendors and products.
- Automatically calculates total purchase amount.
- Updates product stock after a purchase (increases stock).

**Testing:**
- The admin can record purchases and verify stock updates.

---

## Module: Invoice Management

**Status:** Completed

**Functionality:**
- Implemented viewing of sales records (invoices) for both Admin and regular Users.
- Admin users can view all sales records.
- Regular users can view sales records associated with their user ID.

**Testing:**
- Admin users can see all sales records in the Invoice Management section.
- Regular users can see their associated sales records in the Invoice Management section.

---

## Module: Check Management

**Status:** Completed

**Functionality:**
- Created a `checks` collection in the Firestore database.
- Implemented full CRUD (Create, Read, Update, Delete) functionality for checks, including fields for bank name, check number, payee, and currency.
- Created modals for adding and editing checks.

**Testing:**
- The admin can add, edit, and delete checks from the Admin Dashboard.

---

## Module: Worker Management

**Status:** Completed

**Functionality:**
- Created a `workers` collection in the Firestore database.
- Implemented full CRUD (Create, Read, Update, Delete) functionality for workers in the Admin Dashboard.
- Created modals for adding and editing workers.
- The UI is connected to the Firestore database to manage worker data in real-time.

**Testing:**
- The admin can add, edit, and delete workers from the Admin Dashboard.
- The worker list is updated in real-time.

---

## Module: Inventory Management

**Status:** Completed

**Functionality:**
- Created an `InventoryManagement` component to display real-time stock levels.
- The component highlights products with low stock.
- Implemented a feature to add stock to existing products.
- The UI is integrated into the Admin Dashboard.

**Testing:**
- The admin can view the stock levels of all products.
- Products with stock below the threshold are highlighted.
- The admin can add stock to existing products.