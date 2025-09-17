# Project Overview

This is a responsive, multilingual supermarket management web application built with React, Vite, and Tailwind CSS. It uses Firebase for backend services, including authentication and database storage. The application features role-based access control, with separate dashboards for administrators and regular users.

## User Roles & Authentication

*   **Admin:** Full access to all features, including managing users, products, vendors, sales, purchases, invoices, workers, and settings.
*   **User:** Restricted access, can only view invoices.

Firebase Authentication is used to handle user sign-in and sign-up for these roles.

## Core Functional Modules

*   **User Management:** Admin and standard user login and role-based access control.
*   **Customer Management:** Add, edit, and delete customers with contact and purchase history.
*   **Vendor (Trader) Management:** Add, edit, and delete vendors with contact and supplied products.
*   **Product Management:** Manage the product catalog with dynamic categories, descriptions, prices, and stock levels. Products can be added manually or via mobile camera image capture.
*   **Sales Management:** Register customer sales, generate invoices, and update stock.
*   **Purchase Management:** Record vendor purchases, track inventory updates, and link invoices.
*   **Invoice Management:** Create, edit, and view invoices with role-based permissions.
*   **Check Management:** Administer financial checks related to orders/payments.
*   **Worker Management:** Maintain worker records including salary and loan management without creating login accounts for them.
*   **Inventory Management:** Real-time stock level monitoring, low-stock alerts, and replenishment tracking.

## Design System

The project follows a modern design system with a dark theme, vibrant gradients, and clean typography. The full design system is defined in the `design.json` file. Key aspects of the design system include:

*   **Theme:** Dark theme with a professional, tech-focused style.
*   **Colors:** A primary color palette of deep purple and bright blue, with secondary colors of teal and yellow.
*   **Typography:** The Inter font is used for both headings and body text.
*   **Components:** The design system includes specifications for buttons, cards, tags, avatars, and more.

## Development History

The project has been developed in a modular fashion. The `memory.md` file contains a detailed history of the development process, including the status of each module and the reasons for certain decisions. Here is a summary of the development history:

*   **Completed Modules:** Basic Authentication and Foundation, Customer Management, Vendor Management, Product Management, Sales Management, Purchase Management, Invoice Management, Check Management, Worker Management, and Inventory Management.
*   **Skipped Modules:** User Management (due to Firebase plan limitations).

## Building and Running

### Prerequisites

*   Node.js and npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Building for Production

1.  Build the application for production:
    ```bash
    npm run build
    ```
    The production-ready files will be located in the `dist` directory.

## Development Conventions

### Linting

The project uses ESLint for code linting. To run the linter, use the following command:

```bash
npm run lint
```

### Styling

The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS. The Tailwind CSS configuration can be found in the `tailwind.config.js` file.

### Internationalization

The application supports multiple languages using the `i18next` library. Language files are located in the `src/i18n` directory.

### Firebase

The project uses Firebase for authentication, database, and hosting. The default Firebase project is `supermarket-abd34`, as specified in the `.firebaserc` file. The `firebase.json` file is configured for Firebase Cloud Functions, although this feature is not currently in use.

### Security

**Warning:** The Firebase configuration in `src/firebase/config.js` contains sensitive API keys. These should be stored in environment variables and not committed to version control.