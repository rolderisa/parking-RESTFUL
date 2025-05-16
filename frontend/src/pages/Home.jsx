import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const dashboardUrl = isAdmin ? '/admin/dashboard' : '/dashboard';
  
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative bg-[#111827] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Modern Parking</span>
                <span className="block text-primary-200">Management System</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-primary-100 sm:max-w-3xl">
                Book, manage and pay for parking spaces effortlessly with our smart parking management system
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                {isAuthenticated ? (
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button
                      to={dashboardUrl}
                      variant="secondary"
                      size="lg"
                      className="sm:w-auto px-8 py-3"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      to="/bookings/new"
                      variant="primary"
                      size="lg"
                      className="sm:w-auto px-8 py-3 bg-white text-primary-700 hover:bg-gray-50"
                    >
                      Book a Parking Spot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button
                      to="/login"
                      variant="secondary"
                      size="lg"
                      className="sm:w-auto px-8 py-3"
                    >
                      Login
                    </Button>
                    <Button
                      to="/register"
                      variant="primary"
                      size="lg"
                      className="sm:w-auto px-8 py-3 bg-white text-primary-700 hover:bg-gray-50"
                    >
                      Register Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 opacity-60"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
      
      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Smart Features for Modern Parking
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to manage parking efficiently
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg shadow-card px-6 py-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-primary-955 mb-4">
                  <Car size={40} />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Easy Booking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Search and book VIP or regular parking spaces with just a few clicks.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-lg shadow-card px-6 py-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-primary-955 mb-4">
                  <Clock size={40} />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Flexible Duration</h3>
                <p className="mt-2 text-base text-gray-500">
                  Book for hours, days, or weeks based on your specific needs.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-lg shadow-card px-6 py-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-primary-955 mb-4">
                  <CreditCard size={40} />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Payment Plans</h3>
                <p className="mt-2 text-base text-gray-500">
                  Choose from multiple payment plans that fit your budget and requirements.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-white rounded-lg shadow-card px-6 py-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-primary-955 mb-4">
                  <Shield size={40} />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Secure System</h3>
                <p className="mt-2 text-base text-gray-500">
                  Role-based access, booking approval workflow, and secure payment processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="bg-primary-955">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-200">Register today or log in to your account.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <div className="inline-flex rounded-md shadow">
              <Button
                to={isAuthenticated ? dashboardUrl : '/register'}
                variant="primary"
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-50"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </div>
            <div className="inline-flex rounded-md shadow">
              <Button
                to={isAuthenticated ? '/bookings/new' : '/login'}
                variant="secondary"
                size="lg"
              >
                {isAuthenticated ? 'Book Now' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;