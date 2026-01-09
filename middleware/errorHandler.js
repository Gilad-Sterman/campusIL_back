// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  // Default error
  let error = {
    success: false,
    error: 'Internal server error'
  };

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        error = {
          success: false,
          error: 'Resource not found'
        };
        return res.status(404).json(error);
      
      case '23505':
        error = {
          success: false,
          error: 'Resource already exists'
        };
        return res.status(409).json(error);
      
      case '23503':
        error = {
          success: false,
          error: 'Referenced resource does not exist'
        };
        return res.status(400).json(error);
      
      case '42501':
        error = {
          success: false,
          error: 'Insufficient permissions'
        };
        return res.status(403).json(error);
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      error: 'Validation failed',
      details: err.details
    };
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      error: 'Invalid token'
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      error: 'Token expired'
    };
    return res.status(401).json(error);
  }

  // Custom application errors
  if (err.status) {
    error = {
      success: false,
      error: err.message || 'Application error'
    };
    return res.status(err.status).json(error);
  }

  // Development vs Production error details
  if (process.env.NODE_ENV === 'development') {
    error = {
      success: false,
      error: err.message,
      stack: err.stack
    };
  }

  res.status(500).json(error);
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  // Don't handle API routes here - let them fall through to API 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.originalUrl
    });
  }
  
  // For non-API routes, this should be handled by the SPA catch-all
  // But if we get here, it means the static files aren't set up properly
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.status = statusCode;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}
