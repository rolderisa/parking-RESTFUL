import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { prisma } from '../index.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { loginSchema, registerSchema } from '../utils/validationSchemas.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = registerSchema.parse(req.body);
  
  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedData.password, salt);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword
    }
  });
  
  if (user) {
    // Generate token and send response
    sendTokenResponse(user, 201, res);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  // Validate request data
  const validatedData = loginSchema.parse(req.body);
  
  // Check for user
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isMatch = await bcrypt.compare(validatedData.password, user.password);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  
  // Generate token and send response
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      plateNumber: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user);
});