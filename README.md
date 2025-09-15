# CAD Craft Hub Backend

RESTful API server for the CAD Craft Hub portfolio application built with Node.js, Express, and PostgreSQL.

## Features

- **Authentication**: JWT-based admin authentication
- **Projects Management**: CRUD operations for portfolio projects
- **Technologies Management**: Manage technical skills and categories
- **About Information**: Update personal/professional information
- **PostgreSQL Database**: Robust data persistence
- **Security**: Helmet, CORS, rate limiting
- **Environment Configuration**: Flexible deployment options

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE cad_craft_hub;
   ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```

## Environment Variables

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cad_craft_hub
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Admin Credentials
ADMIN_EMAIL=admin@cadcraft.com
ADMIN_PASSWORD=admin123
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get single project (public)
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Technologies
- `GET /api/technologies` - Get all technologies (public)
- `GET /api/technologies/:id` - Get single technology (public)
- `POST /api/technologies` - Create technology (admin only)
- `PUT /api/technologies/:id` - Update technology (admin only)
- `DELETE /api/technologies/:id` - Delete technology (admin only)

### About
- `GET /api/about` - Get about information (public)
- `PUT /api/about` - Update about information (admin only)
- `POST /api/about` - Create about information (admin only)

### Utility
- `GET /api/health` - Health check
- `GET /` - API information

## Database Schema

### profiles
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `full_name` (VARCHAR)
- `password_hash` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### projects
- `id` (UUID, Primary Key)
- `title` (VARCHAR, Required)
- `description` (TEXT)
- `image_url` (VARCHAR)
- `technologies` (TEXT[])
- `project_url`, `github_url` (VARCHAR)
- `featured` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### technologies
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `category` (VARCHAR, Required)
- `icon`, `color` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### about
- `id` (UUID, Primary Key)
- `content` (TEXT, Required)
- `skills` (TEXT[])
- `experience_years` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMP)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Admin users can:

1. Login with email/password to receive a JWT token
2. Include the token in the `Authorization` header: `Bearer <token>`
3. Access protected endpoints for content management

Default admin credentials (change in production):
- Email: `admin@cadcraft.com`
- Password: `admin123`

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: Secure admin access
- **Input Validation**: Server-side validation
- **Password Hashing**: bcrypt for secure password storage

## Development

```bash
# Install dependencies
npm install

# Run database initialization
npm run init-db

# Start development server
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Set up proper CORS origins
5. Enable HTTPS
6. Configure reverse proxy (nginx)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and is accessible

### Authentication Issues
- Verify JWT secret is set
- Check token format in Authorization header
- Ensure admin user exists in database

### CORS Issues
- Update CORS origins in `server.js`
- Verify frontend URL matches allowed origins