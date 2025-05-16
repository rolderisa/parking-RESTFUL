import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car, CreditCard, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import SlotGrid from '../../components/parking/SlotGrid';
import PlanSelector from '../../components/parking/PlanSelector';

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    slotId: '',
    planId: ''
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  // Fetch payment plans
  useEffect(() => {
    const fetchPaymentPlans = async () => {
      try {
        const response = await api.get('/payments/plans');
        setPaymentPlans(response.data);
      } catch (error) {
        console.error('Error fetching payment plans:', error);
        toast.error('Failed to load payment plans');
      }
    };
    
    fetchPaymentPlans();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const searchAvailableSlots = async () => {
    setLoading(true);
    setErrors({});
    
    // Validate dates
    if (!formData.startTime || !formData.endTime) {
      setErrors({
        date: 'Please select both start and end dates'
      });
      setLoading(false);
      return;
    }
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (start >= end) {
      setErrors({
        date: 'End time must be after start time'
      });
      setLoading(false);
      return;
    }
    
    // Calculate the duration in hours
    const durationHours = Math.abs(end - start) / 36e5;
    if (durationHours < 1) {
      setErrors({
        date: 'Minimum booking duration is 1 hour'
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/parking-slots/available', {
        params: {
          startTime: formData.startTime,
          endTime: formData.endTime
        }
      });
      
      setAvailableSlots(response.data);
      
      if (response.data.length === 0) {
        toast.error('No available slots for the selected time period');
      } else {
        setStep(2);
        toast.success(`Found ${response.data.length} available slots`);
      }
    } catch (error) {
      console.error('Error searching for slots:', error);
      toast.error('Failed to search for available slots');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectSlot = (slot) => {
    setFormData(prev => ({ ...prev, slotId: slot.id }));
  };
  
  const handleSelectPlan = (plan) => {
    setFormData(prev => ({ ...prev, planId: plan.id }));
  };
  
  const proceedToPayment = () => {
    if (!formData.slotId) {
      toast.error('Please select a parking slot');
      return;
    }
    
    setStep(3);
  };
  
  const createBooking = async () => {
    if (!formData.planId) {
      toast.error('Please select a payment plan');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/bookings', formData);
      toast.success('Booking created successfully');
      navigate(`/bookings/${response.data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select Booking Time</h2>
            
            {errors.date && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded">
                {errors.date}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Time"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                icon={<Calendar size={16} />}
                required
              />
              
              <Input
                label="End Time"
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                icon={<Clock size={16} />}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={searchAvailableSlots}
                isLoading={loading}
                icon={!loading && <ArrowRight size={16} />}
              >
                Find Available Slots
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Select a Parking Slot</h2>
              <div className="text-sm text-gray-500">
                {availableSlots.length} slots available
              </div>
            </div>
            
            <SlotGrid
              slots={availableSlots}
              onSelectSlot={handleSelectSlot}
              selectedSlotId={formData.slotId}
            />
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Back to Times
              </Button>
              
              <Button
                variant="primary"
                onClick={proceedToPayment}
                disabled={!formData.slotId}
                icon={<ArrowRight size={16} />}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">Select Payment Plan</h2>
            
            <PlanSelector
              plans={paymentPlans}
              selectedPlanId={formData.planId}
              onSelectPlan={handleSelectPlan}
            />
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
              >
                Back to Slot Selection
              </Button>
              
              <Button
                variant="primary"
                onClick={createBooking}
                isLoading={loading}
                disabled={!formData.planId}
                icon={!loading && <CreditCard size={16} />}
              >
                Complete Booking
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book a Parking Slot</h1>
        <p className="mt-1 text-gray-600">Reserve a parking space for your vehicle</p>
      </div>
      
      <Card className="mb-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                <Calendar size={18} />
              </div>
              <div className="ml-2 text-sm font-medium">Time Selection</div>
            </div>
            
            <div className={`flex-1 mx-4 h-1 ${step > 1 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                <Car size={18} />
              </div>
              <div className="ml-2 text-sm font-medium">Slot Selection</div>
            </div>
            
            <div className={`flex-1 mx-4 h-1 ${step > 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
            
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                <CreditCard size={18} />
              </div>
              <div className="ml-2 text-sm font-medium">Payment</div>
            </div>
          </div>
        </div>
        
        {renderStepContent()}
      </Card>
    </div>
  );
};

export default BookingForm;