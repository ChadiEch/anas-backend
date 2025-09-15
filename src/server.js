import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import technologyRoutes from './routes/technologies.js';
import aboutRoutes from './routes/about.js';
import homepageRoutes from './routes/homepage.js';
import contactRoutes from './routes/contact.js';

// Load environment variables
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
const envPath = path.join(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
// Use Railway's PORT or default to 5000
const PORT = process.env.RAILWAY_PORT || process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Explicit OPTIONS handler for all routes - MUST be before other middleware
app.options('*', (req, res) => {
  console.log('=== Handling OPTIONS request ===');
  console.log('Origin:', req.get('Origin'));
  console.log('Headers:', req.headers);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).send();
});

// Comprehensive CORS middleware
app.use((req, res, next) => {
  console.log('=== CORS Middleware ===');
  console.log('Method:', req.method);
  console.log('Origin:', req.get('Origin'));
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'OK', 
    message: 'CAD Craft Hub API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    railway: !!process.env.RAILWAY_ENVIRONMENT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: 'Welcome to CAD Craft Hub API',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      technologies: '/api/technologies',
      about: '/api/about',
      homepage: '/api/homepage',
      contact: '/api/contact',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CAD Craft Hub API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚂 Railway Environment: ${!!process.env.RAILWAY_ENVIRONMENT}`);
});