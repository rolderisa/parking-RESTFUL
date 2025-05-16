import React from 'react';
import { Car } from 'lucide-react';

const SlotGrid = ({ 
  slots = [], 
  onSelectSlot, 
  selectedSlotId = null,
  isSelectable = true
}) => {
  // Group slots by their type (VIP or REGULAR)
  const vipSlots = slots.filter(slot => slot.type === 'VIP');
  const regularSlots = slots.filter(slot => slot.type === 'REGULAR');
  
  // Determine the number of columns based on the number of slots
  const getColumns = (count) => {
    if (count <= 4) return count;
    if (count <= 9) return Math.ceil(Math.sqrt(count));
    return 6; // Max 6 columns for larger grids
  };
  
  const renderSlot = (slot) => {
    const isSelected = selectedSlotId === slot.id;
    const isVip = slot.type === 'VIP';
    
    let bgColor = isVip 
      ? 'bg-warning-100 border-warning-300' 
      : 'bg-gray-100 border-gray-300';
    
    if (isSelected) {
      bgColor = isVip 
        ? 'bg-warning-200 border-warning-500' 
        : 'bg-primary-100 border-primary-500';
    }
    
    const cursor = isSelectable ? 'cursor-pointer' : 'cursor-default';
    
    return (
      <div
        key={slot.id}
        onClick={() => isSelectable && onSelectSlot && onSelectSlot(slot)}
        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${bgColor} ${cursor} transition-all duration-200 transform hover:scale-105 relative w-24 h-24 m-1`}
      >
        <Car 
          size={24} 
          className={isVip ? 'text-warning-600' : 'text-primary-600'} 
        />
        <span className="mt-1 text-sm font-medium">
          {slot.slotNumber}
        </span>
        <span className="text-xs mt-1">
          {isVip ? 'VIP' : 'Regular'}
        </span>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {vipSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">VIP Parking</h3>
          <div 
            className="flex flex-wrap justify-center"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${getColumns(vipSlots.length)}, minmax(100px, 1fr))`,
              gap: '0.75rem'
            }}
          >
            {vipSlots.map(slot => renderSlot(slot))}
          </div>
        </div>
      )}
      
      {regularSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Regular Parking</h3>
          <div 
            className="flex flex-wrap justify-center"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${getColumns(regularSlots.length)}, minmax(100px, 1fr))`,
              gap: '0.75rem'
            }}
          >
            {regularSlots.map(slot => renderSlot(slot))}
          </div>
        </div>
      )}
      
      {slots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No parking slots available for the selected time.
        </div>
      )}
    </div>
  );
};

export default SlotGrid;