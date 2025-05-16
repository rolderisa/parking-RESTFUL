import express from 'express';
import { 
  exportBookings, 
  exportUsers, 
  getBookings, 
  getDashboardStats, 
  getUsers, 
  updateBookingStatus 
} from '../controllers/adminController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/users/export', exportUsers);
router.get('/bookings/export', exportBookings);

export default router;