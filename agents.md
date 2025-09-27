# SuperMarket App Project Documentation

## Project Overview

This is a comprehensive supermarket management application built with React. The application provides role-based access to handle various aspects of supermarket operations including customer management, sales, inventory, worker management, and advanced financial reporting.

## Technology Stack

- **Frontend**: React.js with functional components and hooks
- **Styling**: CSS with responsive design principles
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Date Handling**: date-fns library
- **PDF Generation**: jsPDF with custom table rendering
- **Currency Formatting**: Custom utility functions

## Core Features

1.  **Role-Based Access Control (RBAC)**

    - **Admin Dashboard**: Full create, read, update, and delete (CRUD) access.
    - **User Dashboard**: View-only access to all data and reports.

2.  **Sales & Purchase Management**

    - Create new sales and purchases with multiple products.
    - Track payment status (paid, partial, unpaid) and balances.
    - Support for various payment methods (cash, credit, check).

3.  **Inventory & Product Management**

    - Full product catalog management with categories.
    - Real-time stock tracking and value calculation.

4.  **Worker Management**

    - Manage worker profiles, positions, and salaries.
    - Track monthly expenses and attendance (absences).
    - Automatically calculate salary deductions and remaining pay.

5.  **Financial Management**

    - Manage customer and vendor payments.
    - Track bank checks, including their status (pending, cleared).

6.  **Advanced Reporting Suite**
    - **Detailed Reports**: In-depth, filterable reports for Customers and Vendors.
    - **Financial Reports**: Profit & Loss, Financial Summary, Sales, and Purchases.
    - **Operational Reports**: Inventory, Stock Alerts, Worker, and Checks reports.
    - **Professional PDF Exports**: All detail reports feature a consistent, professionally designed PDF export with custom-drawn logos, tables, and charts.

## File Structure

- `/src` - Main application source code
  - `/components` - React components
    - `/reports` - Report generation components
    - Other management and UI components
  - `/utils` - Utility functions
    - `currency.js` - Currency formatting functions
    - `errorHandling.js` - Centralized error handling
  - `/firebase` - Firebase interaction layer
  - `/context` - React context for state management (e.g., AuthContext)

## Key Components

1. **CustomerDetailReport.jsx**

   - Generates highly detailed, multi-section reports.
   - Features include summary metrics, transaction tables, and data visualizations (bar charts).
   - Implements a robust, custom PDF export function with a consistent design, including a vector logo, colored headers, and two-pass table header rendering to prevent visual glitches.

2. **SalesReport.jsx**

   - An enhanced, multi-tab component for viewing sales data and managing workers.
   - Includes features for recording worker expenses and tracking attendance, with automatic salary calculation based on working days and deductions.

3. **ProfitLossReport.jsx**

   - Provides a complete Profit & Loss statement, calculating revenue, Cost of Goods Sold (COGS), operating expenses, and net profit.

4. **Currency Utility**
   - Handles currency formatting with Shekel symbol (₪) and NIS format
   - Provides functions for consistent currency display across the app

## Data Models

1. **Customer**

   - id, name, email, phone, address
   - Statistics: totalOrders, totalSpent, totalPaid, totalBalance, averageOrderValue, first/last order dates.
   - Payment methods and products purchased

2. **Sale**

   - id, customerId, customerName, date
   - Products/items with quantities and prices
   - Payment information: totalAmount, amountPaid, balance, paymentMethod, paymentStatus

3. **Product**

   - id, name, price, quantity, category

4. **Worker**
   - id, name, position, salary
   - Related collections: `workerExpenses`, `workerAttendance`, `salaryPayments`

## Known Issues

1. **PDF Generation**
   - Shekel symbol (₪) rendering issues with jsPDF
   - Solution: Using "NIS" text instead of symbol
   - Custom table rendering instead of autoTable due to compatibility issues

## Development Guidelines

1. Follow React best practices with functional components and hooks
2. Use consistent date formatting with date-fns
3. Implement proper error handling for all asynchronous operations.
4. Maintain responsive design principles
5. Use the currency utility for all monetary displays

## Future Enhancements

1. Implement real-time inventory updates
2. Add barcode scanning functionality
3. Enhance reporting with charts and graphs
4. Add user authentication and role-based access
5. Implement mobile app version
