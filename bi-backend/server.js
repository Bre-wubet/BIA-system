import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
//import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

import logger from './config/logger.js';
import database from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
// import analyticsRoutes from './routes/analyticsRoutes.js';
import dataSourceRoutes from './routes/dataSourceRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import widgetRoutes from './routes/widgetRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
// import predictiveRoutes from './routes/predictiveRoutes.js';

let server;

async function createServer() {
  const app = express();

  // Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000'
  ];
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('combined', { stream: logger.stream }));
  app.disable('etag');
  // Rate Limiter
//   const limiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//     message: {
//       success: false,
//       message: 'Too many requests from this IP, please try again later.'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//   });
//   app.use('/api/', limiter);

  // Log requests
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
    next();
  });

  // Health Check
  app.get('/health', async (req, res) => {
    try {
      const dbHealth = await database.healthCheck();
      const healthStatus = {
        status: dbHealth.status === 'unhealthy' ? 'unhealthy' : 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth.status,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      };
      const statusCode = dbHealth.status === 'unhealthy' ? 503 : 200;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  
  // Routes
  app.use('/api/auth', authRoutes);
//   app.use('/api/users', userRoutes);
  app.use('/api/dashboards', dashboardRoutes);
//   app.use('/api/analytics', analyticsRoutes);
  app.use('/api/data-source', dataSourceRoutes);
  app.use('/api/kpis', kpiRoutes);
  app.use('/api/widgets', widgetRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/export', exportRoutes);
//   app.use('/api/predictive', predictiveRoutes);

  // Public Routes
  app.get('/api/public/dashboards', (req, res) => {
    res.json({
      success: true,
      message: 'Public dashboards endpoint',
      data: []
    });
  });

  // API Docs
  app.get('/api/docs', (req, res) => {
    res.json({
      success: true,
      message: 'BI Analytics System API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        dashboards: '/api/dashboards',
        analytics: '/api/analytics',
        integration: '/api/data-source',
        kpis: '/api/kpis',
        widgets: '/api/widgets',
        reports: '/api/reports',
        export: '/api/export',
        predictive: '/api/predictive'
      },
      documentation: 'https://docs.bi-analytics-system.com'
    });
  });

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'BI Analytics System API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });

  // Error handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function start() {
  try {
    await database.connect();
    logger.info('Database connected successfully');

    const app = await createServer();
    const port = process.env.PORT || 3000;

    server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${port}/health`);
      logger.info(`API docs: http://localhost:${port}/api/docs`);
    });

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown() {
  try {
    logger.info('Shutting down server...');
    await database.close();
    logger.info('Database connection closed');

    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

start();
