import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { bookingSearchSchema, createBookingSchema, updateBookingSchema } from '../utils/validationSchemas.js';
import { generateBookingPDF } from '../utils/pdfGenerator.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = createBookingSchema.parse(req.body);
  const { startTime, endTime, slotId, planId } = validatedData;
  
  // Parse dates
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Set expiration time for pending booking (2 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);
  
  // Check if slot exists and is available
  const slot = await prisma.parkingSlot.findUnique({
    where: { id: slotId }
  });
  
  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }
  
  if (!slot.isAvailable) {
    res.status(400);
    throw new Error('Parking slot is not available');
  }
  
  // Check if the slot has conflicting bookings
  const conflictingBookings = await prisma.booking.findFirst({
    where: {
      slotId,
      status: {
        in: ['PENDING', 'APPROVED']
      },
      AND: [
        {
          startTime: {
            lt: end
          }
        },
        {
          endTime: {
            gt: start
          }
        }
      ]
    }
  });
  
  if (conflictingBookings) {
    res.status(400);
    throw new Error('This slot is already booked for the selected time');
  }
  
  // Check if payment plan exists
  const plan = await prisma.paymentPlan.findUnique({
    where: { id: planId }
  });
  
  if (!plan) {
    res.status(404);
    throw new Error('Payment plan not found');
  }
  
  // Create booking
  const booking = await prisma.booking.create({
    data: {
      startTime: start,
      endTime: end,
      expiresAt,
      userId: req.user.id,
      slotId,
      payment: {
        create: {
          amount: plan.price,
          userId: req.user.id,
          planId
        }
      }
    },
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      },
      payment: {
        include: {
          plan: true
        }
      }
    }
  });
  
  res.status(201).json(booking);
});

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  // Validate query parameters
  const { page, limit, status } = bookingSearchSchema.parse(req.query);
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = { userId: req.user.id };
  if (status) where.status = status;
  
  // Get total count
  const totalCount = await prisma.booking.count({ where });
  
  // Get bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      parkingSlot: true,
      payment: {
        include: {
          plan: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: limit
  });
  
  res.status(200).json({
    bookings,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      },
      payment: {
        include: {
          plan: true
        }
      }
    }
  });
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if user owns the booking or is admin
  if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to access this booking');
  }
  
  res.status(200).json(booking);
});

// @desc    Update booking status (cancel for users)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = updateBookingSchema.parse(req.body);
  
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      payment: true
    }
  });
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Users can only cancel their own bookings that are in PENDING state
  if (req.user.role !== 'ADMIN') {
    if (booking.userId !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to update this booking');
    }
    
    if (validatedData.status && validatedData.status !== 'CANCELLED') {
      res.status(403);
      throw new Error('Users can only cancel bookings');
    }
    
    if (booking.status !== 'PENDING') {
      res.status(400);
      throw new Error('Only pending bookings can be cancelled');
    }
  }
  
  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: validatedData,
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      },
      payment: {
        include: {
          plan: true
        }
      }
    }
  });
  
  // If booking is cancelled/rejected and there's a payment, mark it as REFUNDED
  if ((updatedBooking.status === 'CANCELLED' || updatedBooking.status === 'REJECTED') && 
      updatedBooking.payment && 
      updatedBooking.payment.status === 'PAID') {
    await prisma.payment.update({
      where: { id: updatedBooking.payment.id },
      data: { status: 'REFUNDED' }
    });
  }
  
  res.status(200).json(updatedBooking);
});

// @desc    Download booking as PDF
// @route   GET /api/bookings/:id/pdf
// @access  Private
export const downloadBookingAsPDF = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      parkingSlot: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plateNumber: true
        }
      },
      payment: {
        include: {
          plan: true
        }
      }
    }
  });
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if user owns the booking or is admin
  if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to access this booking');
  }
  
  // Generate PDF
  generateBookingPDF(booking, res);
});

// @desc    Complete fake payment for booking
// @route   POST /api/bookings/:id/pay
// @access  Private
export const completeBookingPayment = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      payment: true
    }
  });
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Check if user owns the booking
  if (booking.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to pay for this booking');
  }
  
  // Check if booking is in an appropriate state
  if (booking.status !== 'APPROVED') {
    res.status(400);
    throw new Error('Can only pay for approved bookings');
  }
  
  // Check if already paid
  if (booking.isPaid) {
    res.status(400);
    throw new Error('Booking is already paid');
  }
  
  // Update payment and booking status
  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: 'PAID' }
    });
  }
  
  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { isPaid: true },
    include: {
      parkingSlot: true,
      payment: {
        include: {
          plan: true
        }
      }
    }
  });
  
  res.status(200).json(updatedBooking);
});