# Authentication System Documentation

## Overview

The BI Analytics System now includes a comprehensive authentication system that replaces the previous mock authentication. The system provides secure user registration, login, password management, and role-based access control.

## Features

- **User Registration & Login**: Secure user registration and authentication
- **Password Security**: Bcrypt password hashing with configurable salt rounds
- **JWT Tokens**: Access and refresh token system
- **Role-Based Access Control**: Admin, Manager, Analyst, and User roles
- **Password Management**: Change password and password reset functionality
- **User Profile Management**: Update user profile information
- **Account Management**: Activate/deactivate user accounts

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address

#### Protected Endpoints

- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

#### Admin Endpoints

- `GET /api/auth/stats` - Get user statistics (Admin only)

## User Roles

1. **Admin**: Full system access, user management
2. **Manager**: Department-level access, team management
3. **Analyst**: Data analysis and reporting access
4. **User**: Basic dashboard and report access

## Database Schema

The users table includes the following fields:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bi_analytics_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Database Migration and Seeding**:
   ```bash
   npm run setup-auth
   ```

4. **Start the Server**:
   ```bash
   npm run dev
   ```

## Default Users

After running the setup script, the following default users will be created:

| Username | Email | Password | Role | Department |
|----------|-------|----------|------|------------|
| admin | admin@bi-analytics.com | admin123 | admin | IT |
| analyst1 | analyst1@bi-analytics.com | analyst123 | analyst | Analytics |
| manager1 | manager1@bi-analytics.com | manager123 | manager | Operations |
| user1 | user1@bi-analytics.com | user123 | user | Sales |

## Authentication Flow

1. **Registration**: User provides username, email, password, and optional profile information
2. **Login**: User provides email and password, receives access and refresh tokens
3. **API Requests**: Include `Authorization: Bearer <access_token>` header
4. **Token Refresh**: Use refresh token to get new access token when expired
5. **Logout**: Invalidate tokens (implemented for future token blacklisting)

## Security Features

- **Password Hashing**: Bcrypt with configurable salt rounds
- **JWT Security**: Signed tokens with expiration
- **Token Types**: Separate access and refresh tokens
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configurable allowed origins
- **Rate Limiting**: Configurable request limits (optional)

## Integration with Existing Routes

All existing API routes now use real authentication instead of mock authentication:

- `/api/dashboards` - Dashboard management
- `/api/kpis` - KPI management
- `/api/widgets` - Widget management
- `/api/reports` - Report management
- `/api/export` - Data export
- `/api/data-source` - Data source management

## Error Handling

The authentication system provides comprehensive error handling:

- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions or deactivated account
- **409 Conflict**: Email/username already exists
- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Server-side errors

## Testing the Authentication

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "user",
    "department": "Testing"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:3000/api/dashboards \
  -H "Authorization: Bearer <access_token>"
```

## Future Enhancements

- Email verification system
- Password reset via email
- Two-factor authentication
- Token blacklisting for logout
- Session management
- Audit logging for security events
- Account lockout after failed attempts
