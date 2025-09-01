import { CorsOptions } from 'cors';
import { Request } from 'express';

/**
 * Enhanced CORS configuration with security best practices
 */
export const corsOptions: CorsOptions = {
  // Dynamic origin validation
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Add production URLs here when deploying
    ];

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],

  // Headers exposed to the client
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Strict CORS configuration for sensitive endpoints
 */
export const strictCorsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Only allow specific origins for sensitive endpoints
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Strict CORS policy violation'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600, // 1 hour
};

/**
 * Development CORS configuration (more permissive)
 */
export const devCorsOptions: CorsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: true,
  maxAge: 86400,
};

/**
 * Get appropriate CORS configuration based on environment
 */
export const getCorsOptions = (): CorsOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return corsOptions;
    case 'test':
      return devCorsOptions;
    case 'development':
    default:
      return corsOptions; // Use secure options even in development for better testing
  }
};

/**
 * Custom CORS middleware with additional security checks
 */
export const customCorsMiddleware = (req: Request, res: any, next: any) => {
  const origin = req.headers.origin;
  
  // Log suspicious requests
  if (origin && !isOriginAllowed(origin)) {
    console.warn(`CORS violation attempt from origin: ${origin}`);
    console.warn(`Request details: ${req.method} ${req.path}`);
    console.warn(`User-Agent: ${req.headers['user-agent']}`);
    console.warn(`IP: ${req.ip}`);
  }
  
  // Add security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Continue with standard CORS handling
  next();
};

/**
 * Check if origin is allowed
 */
const isOriginAllowed = (origin: string): boolean => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  
  return allowedOrigins.includes(origin);
};

/**
 * CORS error handler
 */
export const corsErrorHandler = (err: Error, req: Request, res: any, next: any) => {
  if (err.message.includes('CORS')) {
    console.error(`CORS Error: ${err.message}`);
    console.error(`Origin: ${req.headers.origin}`);
    console.error(`Method: ${req.method}`);
    console.error(`Path: ${req.path}`);
    
    res.status(403).json({
      success: false,
      error: {
        message: 'CORS policy violation',
        code: 'CORS_ERROR',
      },
    });
    return;
  }
  
  next(err);
};