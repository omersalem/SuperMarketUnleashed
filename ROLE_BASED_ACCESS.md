# Role-Based Access Control Implementation Guide

## Overview

The application now supports role-based access control with two user roles:

- **Admin**: Full access (can create, read, update, delete)
- **User**: Read-only access (can only view data, no modifications)

## Implementation Status

### ✅ Completed Components

1. **AuthContext** - Enhanced with role management and login function
2. **LoginPage** - Updated to work with new AuthContext login method
3. **ProductManagement** - Full role-based access control implemented
4. **UserDashboard** - Complete dashboard with all components in read-only mode
5. **RoleGuard Component** - Utility component for conditional rendering

### 🚧 Partially Implemented

1. **CustomerManagement** - Role props added, action buttons need wrapping
2. **MobileNav** - Role prop support added

### ⏳ Remaining Components to Update

The following components need role-based access control applied:

1. **VendorManagement**
2. **CategoryManagement**
3. **SalesManagement**
4. **PurchaseManagement**
5. **PaymentManagement**
6. **VendorPaymentManagement**
7. **InvoiceManagement**
8. **CheckManagement**
9. **WorkerManagement**
10. **InventoryManagement**
11. **ReportsDashboard**

## How to Implement Role-Based Access Control

### Step 1: Update Component Props

Add `userRole = "admin"` to the component props:

```jsx
const YourComponent = ({
  // existing props
  userRole = "admin"
}) => {
```

### Step 2: Import RoleGuard Components

```jsx
import RoleGuard, { ReadOnlyWrapper, RoleMessage } from "./RoleGuard";
```

### Step 3: Add Role Message

Add this at the beginning of your component's return statement:

```jsx
return (
  <div>
    <RoleMessage userRole={userRole} />
    {/* rest of component */}
  </div>
);
```

### Step 4: Wrap Action Buttons

Wrap all add/edit/delete buttons with RoleGuard:

```jsx
{
  /* Add Button */
}
<RoleGuard userRole={userRole} allowedRoles={["admin"]}>
  <button onClick={handleAdd}>Add Item</button>
</RoleGuard>;

{
  /* Edit/Delete Buttons */
}
<RoleGuard userRole={userRole} allowedRoles={["admin"]}>
  <div className="flex space-x-2">
    <button onClick={handleEdit}>Edit</button>
    <button onClick={handleDelete}>Delete</button>
  </div>
</RoleGuard>;

{
  /* Table Actions with Fallback */
}
<RoleGuard
  userRole={userRole}
  allowedRoles={["admin"]}
  fallback={<span className="text-gray-500 text-xs">View Only</span>}
>
  <div className="flex space-x-2">
    <button>Edit</button>
    <button>Delete</button>
  </div>
</RoleGuard>;
```

### Step 5: Update Parent Components

Pass the userRole prop to child components:

```jsx
{
  /* In AdminDashboard */
}
<YourComponent
  // existing props
  userRole="admin"
/>;

{
  /* In UserDashboard */
}
<YourComponent
  // existing props
  userRole="user"
/>;
```

## RoleGuard Component API

### Props

- `userRole`: Current user's role ("admin" | "user")
- `allowedRoles`: Array of roles that can see the content (default: ["admin"])
- `children`: Content to show if user has permission
- `fallback`: Content to show if user doesn't have permission (default: null)
- `hideOnDenial`: Whether to hide content completely when denied (default: true)

### Components Available

1. **RoleGuard**: Conditional rendering based on role
2. **ReadOnlyWrapper**: Makes content visible but disabled for users
3. **RoleMessage**: Shows informational message for read-only users

## How Users Experience the Application

### Admin Users (userRole="admin")

- See all buttons and controls
- Can create, edit, and delete all data
- Full access to all features

### Regular Users (userRole="user")

- See blue informational banner: "You have read-only access..."
- All action buttons are hidden
- Can view all data but cannot modify anything
- Table actions show "View Only" text instead of buttons

## Testing the Implementation

1. **Login as Admin**:

   - Select "Admin" role on login page
   - Should see all buttons and controls
   - Can perform all actions

2. **Login as User**:
   - Select "User" role on login page
   - Should see read-only banner
   - No add/edit/delete buttons visible
   - Can browse all data

## Current Authentication Flow

1. User selects role on login page (Admin/User)
2. AuthContext stores both user and role information
3. Components receive userRole prop
4. RoleGuard components conditionally render based on role
5. User dashboard shows all data in read-only mode
6. Admin dashboard shows all data with full access

## Security Note

This is frontend-only role-based access control. For production use, ensure backend Firebase Security Rules also enforce these permissions to prevent unauthorized access through direct API calls.
