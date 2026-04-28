import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import universityRoutes from './routes/university.js';
import universitiesRoutes from './routes/universities.js';
import programsRoutes from './routes/programs.js';
import quizRoutes from './routes/quiz.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import applicationRoutes from './routes/application.js';
import userApplicationsRoutes from './routes/userApplications.js';
import documentRoutes from './routes/document.js';
import uploadRoutes from './routes/upload.js';
import studyBuddyRoutes from './routes/studyBuddy.js';
import searchRoutes from './routes/search.js';
import conciergeRoutes from './routes/concierge.js';
import programMatchingRoutes from './routes/programMatching.js';
import { requestLogger } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust the reverse proxy to get real IPs
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  originAgentCluster: true
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Israel API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/program-matching', programMatchingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user-applications', userApplicationsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/study-buddy', studyBuddyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/concierge', conciergeRoutes);

// Serve static files from public directory (built frontend)
app.use(express.static('public'));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return notFoundHandler(req, res);
  }

  // Serve React app for all other routes (SPA routing)
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Campus Israel API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log(`🗄️  Database connection successful`);
  } else {
    console.log(`❌ Database connection failed - check environment variables`);
  }
});

export default app;
