import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side with image or illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-[#111827] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center">
              <Car size={36} className="text-white" />
              <h1 className="text-3xl font-bold text-white ml-2">ParkLot</h1>
            </div>
            <p className="text-primary-100 mt-4 text-lg">
              The smart way to manage parking spaces
            </p>
          </div>
          
          <div className="text-white space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-lg">Easily find and book parking spaces</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-lg">VIP and regular parking options</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-lg">Manage reservations and view history</p>
            </div>
          </div>
          
          <p className="text-primary-200 text-sm">
            &copy; {new Date().getFullYear()} ParkEase. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;