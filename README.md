# Youth Impact Platform Frontend

This is the frontend application for the Youth Impact Platform designed for organizations in the carbon sector to conduct proper due diligence and follow GDPR compliance laws.

## Features

- **Authentication System**: Complete user authentication with login, signup, forgot password, and profile management
- **Organizations Management**: Create and manage organizations
- **Projects**: Set up and track carbon monitoring projects
- **Stakeholder Mapping**: Identify and categorize stakeholders for projects
- **Surveys**: Build customized surveys for communities affected by carbon projects
- **Analytics**: Measure and visualize survey responses
- **Compliance**: Ensure all data collection follows GDPR guidelines

## Tech Stack

- **Framework**: Next.js
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios
- **Authentication**: JWT-based auth with secure token storage

## Project Structure

```
├── app/                        # Next.js app directory (pages)
│   ├── account/                # Authentication-related pages
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── forgot-password/    # Password recovery
│   │   └── reset-password/     # Password reset
│   ├── dashboard/              # Main dashboard
│   ├── profile/                # User profile page
│   ├── organizations/          # Organizations management
│   ├── projects/               # Projects management
│   ├── stakeholders/           # Stakeholder mapping
│   ├── unauthorized/           # Access denied page
│   ├── support/                # Support/help pages
│   └── layout.tsx              # Root layout with AuthProvider
├── components/                 # Reusable UI components
│   ├── auth/                   # Auth-related components
│   ├── ui/                     # Common UI components
│   ├── Navbar.tsx              # Main navigation
│   └── Footer.tsx              # Footer component
├── contexts/                   # React context providers
│   └── AuthContext.tsx         # Authentication context
├── lib/                        # Utility functions and services
│   └── api/                    # API services
│       ├── auth.ts             # Authentication API
│       └── organization.ts     # Organization API
├── types/                      # TypeScript type definitions
├── public/                     # Static assets
└── styles/                     # Global styles
```

## Authentication Flow

1. **Login**: Users can log in with email/password
2. **Signup**: New users can create an account
3. **Password Recovery**: Users can request a password reset link via email
4. **Token Storage**: JWT tokens are stored in localStorage
5. **Protected Routes**: Routes are protected based on authentication status
6. **Role-Based Access**: Different parts of the application are accessible based on user roles

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5500](http://localhost:5500) in your browser

## API Integration

The frontend connects to the Express.js backend API for all operations. API services are organized by resource type (auth, organizations, projects, etc.) and use axios for HTTP requests.

## Authentication API

- `POST /api/v1/auth/sign-up`: Create a new user account
- `POST /api/v1/auth/sign-in`: Authenticate a user and get a JWT token
- `POST /api/v1/auth/sign-out`: Logout a user

## Future Enhancements

- OAuth integration for Google and Microsoft login
- Two-factor authentication
- Enhanced role and permission management
- Real-time notifications
- Multi-language support