import express from 'express';
import { 
  completeBookingPayment, 
  createBooking, 
  downloadBookingAsPDF, 
  getBookingById, 
  getUserBookings, 
  updateBooking 
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.get('/:id/pdf', downloadBookingAsPDF);
router.post('/:id/pay', completeBookingPayment);

export default router;