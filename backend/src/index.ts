import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import categoryRoutes from './routes/category.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import lessonsRoutes from './routes/lessons.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import ticketRoutes from './routes/ticket.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware - CRITICAL: Parse body BEFORE routes
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware - log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n📨 [${req.method}] ${req.path}`);
  console.log('   Headers:', req.headers);
  console.log('   Body:', req.body);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/lessons', lessonsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware - MUST BE LAST
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Initialize database and start server
async function initializeApp() {
  try {
    await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'course_marketplace',
      synchronize: false,
      logging: true,
      entities: [
        __dirname + '/entities/**/*.js',
        __dirname + '/entities/*.js'
      ],
      migrations: [__dirname + '/migrations/**/*.js'],
      subscribers: [__dirname + '/subscribers/**/*.js']
    });

    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();

export default app;
