import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorMiddleware.js';
// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from '../swagger/doc/swagger.json' assert { type: 'json' };
// Routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import parkingSlotRoutes from './routes/parkingSlotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// import { swaggerSpec, swaggerUi } from '../swagger/doc/index.js';
// Initialize
dotenv.config();
export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
// Serve Swagger UI at /api-docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Routes
app.use('/api/auth', authRoutes);
    /*
        #swagger.tags = ['Auth']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */
app.use('/api/users', userRoutes);
  /*
        #swagger.tags = ['Users']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */
app.use('/api/parking-slots', parkingSlotRoutes);
  /*
        #swagger.tags = ['parking-slots']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */
app.use('/api/bookings', bookingRoutes);
  /*
        #swagger.tags = ['bookings']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */
app.use('/api/payments', paymentRoutes);
/*
        #swagger.tags = ['payments']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */
app.use('/api/admin', adminRoutes);
/*
        #swagger.tags = ['admin']
        #swagger.security = [{
                "bearerAuth": []
        }] 
    */

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

export default app;