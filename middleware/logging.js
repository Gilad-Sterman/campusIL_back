// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`🔵 ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const logBody = { ...req.body };
    // Remove sensitive fields
    delete logBody.password;
    delete logBody.token;
    console.log('📦 Request Body:', JSON.stringify(logBody, null, 2));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log error responses
    if (res.statusCode >= 400) {
      console.log('❌ Error Response:', JSON.stringify(body, null, 2));
    }
    
    return originalJson.call(this, body);
  };

  next();
};

// Audit log middleware for sensitive operations
export const auditLogger = (action, resourceType) => {
  return (req, res, next) => {
    // Store audit info in res.locals to be used after successful operation
    res.locals.auditLog = {
      action,
      resourceType,
      userId: req.user?.id || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    next();
  };
};

// Function to save audit log to database
export const saveAuditLog = async (auditData) => {
  try {
    const { supabaseAdmin } = await import('../config/db.js');
    
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        user_id: auditData.userId,
        action: auditData.action,
        resource_type: auditData.resourceType,
        resource_id: auditData.resourceId,
        old_values: auditData.oldValues || null,
        new_values: auditData.newValues || null,
        ip_address: auditData.ipAddress,
        user_agent: auditData.userAgent
      }]);
      
    console.log('📝 Audit log saved:', auditData.action, auditData.resourceType);
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
};
