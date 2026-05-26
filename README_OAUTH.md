# OAuth Implementation Guide for Youth Impact Platform

This guide explains the OAuth implementation for Google and Microsoft authentication in the Youth Impact Platform.

## Overview

The OAuth flow implemented in this project follows the standard Authorization Code flow:

1. User clicks on a social login button (Google or Microsoft)
2. User is redirected to the provider's authentication page
3. After successful authentication, the provider redirects back to our callback URL with an auth code
4. We exchange this code for access and refresh tokens
5. User is authenticated and redirected to the dashboard

## Backend Requirements

For this OAuth implementation to work correctly, the backend API needs to support the following endpoints:

### Google OAuth
- `POST /api/v1/auth/google` - Initiates the Google OAuth flow
- `POST /api/v1/auth/google/callback` - Handles the OAuth code exchange

### Microsoft OAuth
- `POST /api/v1/auth/microsoft` - Initiates the Microsoft OAuth flow
- `POST /api/v1/auth/microsoft/callback` - Handles the OAuth code exchange

Both callback endpoints should:
1. Receive a `code` and `redirect_uri` in the request body
2. Exchange the code for access and refresh tokens
3. Create or update a user record with the profile information
4. Return a JWT token and user data in the same format as the standard login endpoint

## Frontend Implementation

The frontend implementation consists of the following key components:

1. **OAuth Service** (`lib/api/oauth.ts`)
   - Initiates the OAuth flow
   - Handles the callback processing
   - Stores the authentication data

2. **OAuth Callback Handler** (`app/api/auth/callback/page.tsx`)
   - Handles the redirect from OAuth providers
   - Processes the authentication code
   - Updates authentication state

3. **Auth Context Updates** (`contexts/AuthContext.tsx`)
   - Additional methods for OAuth authentication
   - Manages authenticated user state

4. **Token Utilities** (`lib/utils/token.ts`)
   - Secures tokens using both localStorage and cookies
   - Handles token retrieval and deletion

## Configuration Steps

### 1. Register OAuth Applications

#### Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen
6. For application type, select "Web application"
7. Add authorized JavaScript origins (e.g., `http://localhost:3000`)
8. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback?provider=google`)
9. Note your Client ID and Client Secret

#### Microsoft OAuth
1. Go to the [Microsoft Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter a name for your application
5. Set the redirect URI to Web platform (e.g., `http://localhost:3000/api/auth/callback?provider=microsoft`)
6. Register the application
7. Note your Application (client) ID
8. Create a client secret under "Certificates & secrets"

### 2. Environment Variables

Add these variables to your `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

Ensure the backend has corresponding variables for client secrets and redirect URI validation.

## Using Social Login

The implementation allows users to authenticate using either Google or Microsoft by clicking the respective buttons on the login or signup pages. The flow is handled transparently, and users will be redirected back to the application after successful authentication.

## Security Considerations

This implementation uses both localStorage and cookies for token storage:

- **localStorage**: For easy access from client-side JavaScript
- **Cookies**: For better security and access from server-side components

For production, consider:
- Using HTTP-only cookies for token storage
- Implementing CSRF protection
- Adding additional security headers
- Enabling HTTPS for all communications

## Troubleshooting

If you encounter issues with the OAuth flow:

1. Check the browser console for errors
2. Verify that redirect URIs exactly match between OAuth providers and your application
3. Confirm that the backend endpoints are correctly implemented and returning the expected response format
4. Verify that cookies are being properly set and read
5. Ensure that CORS is properly configured on the backend