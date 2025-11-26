# Admin Authentication

This application includes admin authentication to protect the RSS feed management interface.

## Admin Access

- **Admin Panel URL**: `/admin`
- **Default Admin Password**: `admin123`

## Features

- Login page at `/login`
- Protected admin route - redirects to login if not authenticated
- Logout functionality in admin panel
- Persistent authentication using localStorage
- Conditional navigation buttons based on auth state

## Security Notes

⚠️ **Important**: The current implementation uses a hardcoded password for demonstration purposes. In a production environment, you should:

1. Implement proper backend authentication
2. Use secure password hashing
3. Implement session management with tokens (JWT)
4. Add rate limiting for login attempts
5. Use HTTPS for all communications
6. Store sensitive credentials securely (environment variables, secrets manager)

## Usage

1. Navigate to the home page
2. Click "Admin Login" button
3. Enter the admin password: `admin123`
4. Access the admin panel to manage RSS feeds
5. Click "Logout" when done

## Files Modified/Created

- `src/contexts/AuthContext.tsx` - Authentication context and provider
- `src/components/ProtectedRoute.tsx` - Route guard component
- `src/pages/Login.tsx` - Login page
- `src/App.tsx` - Updated with AuthProvider and protected route
- `src/pages/Admin.tsx` - Added logout functionality
- `src/pages/Index.tsx` - Conditional navigation based on auth state
