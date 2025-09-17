Supermarket Management Website Specifications
General
Web application accessible via browsers on PCs, tablets, and phones (responsive design).

Multilingual support: fully support Arabic and English with seamless language switching.

Frontend built with React and styled with Tailwind CSS.

UI design strictly follows design.md.

Backend services utilize Firebase (Free Tier) for authentication and database.

Use Context7 MCP to always fetch the latest official documentation for all technologies used.

User Roles & Authentication
Two user roles:

Admin: full access including managing users, products, vendors, sales, purchases, invoices, workers, and settings.

User: restricted access, can only view invoices.

Firebase Authentication handles user sign-in/sign-up for these roles.

Workers managed only via a dedicated admin page for loans and salaries, no individual accounts for them.

Core Functional Modules
User Management:

Admin and standard users login and role based access control.

Customer Management:

Add, edit, delete customers with contact and purchase history.

Vendor (Trader) Management:

Add, edit, delete vendors with contact and supplied products.

Product Management:

Manage product catalog with dynamic categories, descriptions, prices, stock levels.

Add products manually or via mobile camera image capture.

Sales Management:

Register customer sales, generate invoices, update stock.

Purchase Management:

Record vendor purchases, track inventory updates, and link invoices.

Invoice Management:

Create, edit, and view invoices with role-based permissions.

Check Management:

Administer financial checks related to orders/payments.

Worker Management:

Maintain worker records including salary and loan management without creating login accounts.

Inventory Management:

Real-time stock level monitoring, low-stock alerts, and replenishment tracking.

Additional Features
Responsive UI suitable for PC, tablet, and smartphone.

Seamless switching between Arabic and English interfaces.

Codebase designed for easy scalability and maintainability.

Implement continuous testing and code cleanup after each module completion.

All development follows a strict modular, iterative workflow with user approval steps before progression.
