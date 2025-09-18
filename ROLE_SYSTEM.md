# Role-Based Access Control System

## Overview

The application now features an automatic role-based access control system that determines user permissions based on their email address.

## Access Levels

### Administrator Access

- **Email**: `omersalem2008@gmail.com`
- **Permissions**: Full access to all features
- **Dashboard**: `/admin` route
- **Capabilities**:
  - Create, Read, Update, Delete operations
  - Access to all management sections
  - Full administrative control

### Read-Only User Access

- **Email**: All emails except `omersalem2008@gmail.com`
- **Permissions**: View-only access
- **Dashboard**: `/user` route
- **Capabilities**:
  - View all data and reports
  - No create, edit, or delete operations
  - All action buttons are hidden
  - Cannot modify any business data

## How It Works

### Automatic Role Detection

1. When a user logs in, the system automatically determines their role based on their email address
2. No manual role selection is required
3. The role is set in the AuthContext and persists throughout the session

### Implementation Details

- **AuthContext**: Contains `determineUserRole()` function that checks email addresses
- **Login Process**: Automatically assigns role and redirects to appropriate dashboard
- **UI Components**: Use `RoleGuard` components to conditionally show/hide elements
- **Navigation**: Automatic redirection based on user role

### Security Features

- Role assignment is server-side based on email verification
- No client-side role manipulation possible
- Automatic logout and re-authentication required for role changes
- All sensitive operations protected by role checks

## Usage for New Users

### For Admin (omersalem2008@gmail.com)

1. Login with your credentials
2. Automatically redirected to Admin Dashboard
3. Full access to all features

### For Regular Users (any other email)

1. Login with your credentials
2. Automatically redirected to User Dashboard
3. View-only access to all sections
4. Clear "Read-Only" indicators throughout the interface

## UI Indicators

- **Header Display**: Shows email and role status
- **Access Level Info**: Login page displays access rules
- **Role Badges**: Color-coded role indicators (Red for Admin, Green for Read-Only)
- **Action Buttons**: Hidden for read-only users
- **Clear Messaging**: Read-only status clearly communicated

## Benefits

- **Simplified Login**: No manual role selection needed
- **Secure**: Email-based role assignment prevents unauthorized access
- **User-Friendly**: Clear visual indicators of access level
- **Automatic**: Zero configuration required for role assignment
