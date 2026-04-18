# Campus Israel Backend API

A comprehensive Node.js/Express backend API for the Campus Israel platform, providing authentication, university program management, quiz functionality, document handling, and admin capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Google Cloud Console project (for calendar integration)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables (see [Environment Variables](#environment-variables) section)

   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3001`

## 📁 Project Structure

```
back/
├── config/           # Database and service configurations
├── controllers/      # Route controllers and business logic
├── middleware/       # Express middleware (auth, validation, etc.)
├── routes/          # API route definitions
├── services/        # External service integrations
├── scripts/         # Utility scripts
├── public/          # Static files (built frontend)
├── server.js        # Main server entry point
└── package.json     # Dependencies and scripts
```

## 🔧 Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
DB_PASSWORD=your_supabase_db_password
DB_URL=your_supabase_db_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Application URLs
SITE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Google Calendar OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Required Environment Variables

- **SUPABASE_ANON_KEY**: Your Supabase project's anonymous key
- **SUPABASE_SERVICE_KEY**: Your Supabase project's service role key
- **DB_URL**: Your Supabase database connection URL
- **ENCRYPTION_KEY**: A 32-character random string for token encryption

### Optional Environment Variables

- **GOOGLE_CLIENT_ID/SECRET**: For Google Calendar integration
- **FRONTEND_URL**: Frontend application URL (defaults to localhost:3000)

## 🛠 Available Scripts

```bash
# Start server in production mode
npm start

# Start server in development mode with auto-restart
npm run dev

```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Universities & Programs
- `GET /api/universities` - Get all universities
- `GET /api/universities/:id` - Get specific university
- `GET /api/programs` - Get all programs
- `GET /api/programs/:id` - Get specific program
- `POST /api/program-matching` - Get program recommendations

### Quiz System
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:userId` - Get user quiz results

### Applications & Documents
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/:id` - Get document

### Admin Panel
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users
- `POST /api/admin/staff/invite` - Invite staff members
- `GET /api/admin/universities` - Manage universities
- `GET /api/admin/programs` - Manage programs

### Other Services
- `GET /api/search` - Search functionality
- `GET /api/study-buddy` - Study buddy matching
- `GET /api/concierge` - Concierge services
- `POST /api/upload` - File upload service

### Health Check
- `GET /health` - API health status

## 🔐 Authentication & Authorization

The API uses Supabase Auth for user authentication with JWT tokens. Three user roles are supported:

- **admin_edit**: Full administrative access with edit permissions
- **admin_view**: Read-only administrative access
- **concierge**: Limited access for concierge services
- **user**: Standard user access

### Middleware

- **requireAuth**: Validates JWT token and user session
- **requireAdmin**: Requires admin role (any admin type)
- **requireAdminEdit**: Requires edit permissions (admin_edit or legacy admin)

## 🗄️ Database

The application uses Supabase PostgreSQL with Row Level Security (RLS) policies. Key tables include:

- **users**: User profiles and authentication data
- **universities**: University information and programs
- **programs**: Academic program details
- **quiz_questions**: Quiz system questions
- **quiz_results**: User quiz responses and results
- **applications**: Legacy multi-step applications to programs
- **user_applications**: MVP “Add to My Applications” (saved / applied; see `src/DB/DBSetup.sql` and `migration_phase1_user_applications_mvp.sql`)
- **documents**: File uploads and document management

## 🔒 Security Features

- **Helmet.js**: Security headers and CSP
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting (500 requests per 15 minutes)
- **Input Validation**: Express-validator for request validation
- **File Upload Security**: Multer with file type and size restrictions
- **JWT Authentication**: Secure token-based authentication

## 📦 Dependencies

### Core Dependencies
- **express**: Web application framework
- **@supabase/supabase-js**: Supabase client
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **express-rate-limit**: Rate limiting
- **express-validator**: Request validation
- **multer**: File upload handling
- **axios**: HTTP client
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Development server with auto-restart

## 🚀 Deployment

### Production Build

The backend serves the built frontend from the `public/` directory. To deploy:

1. **Build the frontend** (from the front directory):
   ```bash
   cd ../front
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd ../back
   npm start
   ```

### Environment Setup for Production

- Set `NODE_ENV=production`
- Update `SITE_URL` and `FRONTEND_URL` to production URLs
- Ensure all required environment variables are set
- Configure proper CORS origins for production

### Deployment Platforms

The application is configured to work with:
- **Render.com**: Direct deployment support
- **AWS**: With proper environment configuration

## 🔧 Development

### Adding New Routes

1. Create controller in `controllers/`
2. Add route definitions in `routes/`
3. Import and use in `server.js`
4. Add middleware as needed

### Database Changes

1. Update Supabase schema via dashboard or migrations
2. Update RLS policies as needed
3. Test with different user roles

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase credentials in `.env`
   - Verify database URL format
   - Ensure service key has proper permissions

2. **Authentication Issues**
   - Verify SUPABASE_ANON_KEY is correct
   - Check JWT token expiration
   - Ensure user exists in auth.users table

3. **File Upload Problems**
   - Check Supabase storage bucket permissions
   - Verify file size limits
   - Ensure proper CORS configuration

4. **CORS Errors**
   - Update FRONTEND_URL in environment
   - Check CORS configuration in server.js
   - Verify origin settings

### Logs

The application includes comprehensive logging:
- Request logging middleware
- Error handling with stack traces
- Database connection status
- Health check endpoint


## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Authentication system
  - University and program management
  - Quiz system
  - Admin panel
  - Document upload
  - Role-based permissions
