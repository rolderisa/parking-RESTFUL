import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, Plus, Edit, Trash, Save, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import SlotGrid from '../../components/parking/SlotGrid';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0
  });
  
  const [filters, setFilters] = useState({
    slotNumber: '',
    type: '',
    isAvailable: ''
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editSlotId, setEditSlotId] = useState(null);
  
  const [slotForm, setSlotForm] = useState({
    slotNumber: '',
    type: 'REGULAR',
    isAvailable: true
  });
  
const cleanFilters = Object.fromEntries(
  Object.entries(filters).filter(([_, v]) => v !== '')
);

const fetchSlots = async () => {
  setLoading(true);
  try {
    const response = await api.get('/parking-slots', {
      params: {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...cleanFilters,
      },
    });

    const { slots, page, limit, totalPages, totalCount } = response.data;

    setSlots(slots);
    setPagination(prev => ({
      ...prev,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalCount,
    }));
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    toast.error('Failed to load parking slots');
  } finally {
    setLoading(false);
  }
};


  
  useEffect(() => {
    fetchSlots();
  }, [pagination.page]);
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSlots();
  };
  
  const clearFilters = () => {
    setFilters({ slotNumber: '', type: '', isAvailable: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSlots();
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSlotForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    if (!slotForm.slotNumber) {
      toast.error('Slot number is required');
      return;
    }
    
    try {
      await api.post('/parking-slots', slotForm);
      toast.success('Parking slot added successfully');
      setIsAddMode(false);
      setSlotForm({
        slotNumber: '',
        type: 'REGULAR',
        isAvailable: true
      });
      fetchSlots();
    } catch (error) {
      console.error('Error adding parking slot:', error);
      toast.error(error.response?.data?.message || 'Failed to add parking slot');
    }
  };
  
  const startEdit = (slot) => {
    setEditSlotId(slot.id);
    setSlotForm({
      slotNumber: slot.slotNumber,
      type: slot.type,
      isAvailable: slot.isAvailable
    });
  };
  
  const cancelEdit = () => {
    setEditSlotId(null);
    setSlotForm({
      slotNumber: '',
      type: 'REGULAR',
      isAvailable: true
    });
  };
  
  const handleUpdateSlot = async (id) => {
    if (!slotForm.slotNumber) {
      toast.error('Slot number is required');
      return;
    }
    
    try {
      await api.put(`/parking-slots/${id}`, slotForm);
      toast.success('Parking slot updated successfully');
      setEditSlotId(null);
      setSlotForm({
        slotNumber: '',
        type: 'REGULAR',
        isAvailable: true
      });
      fetchSlots();
    } catch (error) {
      console.error('Error updating parking slot:', error);
      toast.error(error.response?.data?.message || 'Failed to update parking slot');
    }
  };
  
  const handleDeleteSlot = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking slot?')) {
      try {
        await api.delete(`/parking-slots/${id}`);
        toast.success('Parking slot deleted successfully');
        fetchSlots();
      } catch (error) {
        console.error('Error deleting parking slot:', error);
        toast.error(error.response?.data?.message || 'Failed to delete parking slot');
      }
    }
  };
  
  const columns = [
    {
      header: 'Slot Number',
      accessor: 'slotNumber',
      cell: (row) => {
        if (editSlotId === row.id) {
          return (
            <Input
              name="slotNumber"
              value={slotForm.slotNumber}
              onChange={handleFormChange}
              className="w-28"
            />
          );
        }
        return <span className="font-medium">{row.slotNumber}</span>;
      },
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => {
        if (editSlotId === row.id) {
          return (
            <Select
              name="type"
              value={slotForm.type}
              onChange={handleFormChange}
              options={[
                { value: 'VIP', label: 'VIP' },
                { value: 'REGULAR', label: 'Regular' }
              ]}
              className="w-28"
            />
          );
        }
        return (
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${row.type === 'VIP' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}
          `}>
            {row.type}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'isAvailable',
      cell: (row) => {
        if (editSlotId === row.id) {
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={slotForm.isAvailable}
                onChange={handleFormChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Available</span>
            </div>
          );
        }
        return (
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${row.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}>
            {row.isAvailable ? 'Available' : 'Occupied'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => {
        if (editSlotId === row.id) {
          return (
            <div className="flex space-x-2 justify-end">
              <Button
                size="sm"
                variant="success"
                className="text-xs py-1"
                onClick={() => handleUpdateSlot(row.id)}
                title="Save"
              >
                <Save size={16} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs py-1"
                onClick={cancelEdit}
                title="Cancel"
              >
                <X size={16} />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex space-x-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-600 text-xs py-1"
              onClick={() => startEdit(row)}
              title="Edit"
            >
              <Edit size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-error-600 text-xs py-1"
              onClick={() => handleDeleteSlot(row.id)}
              title="Delete"
            >
              <Trash size={16} />
            </Button>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parking Slot Management</h1>
          <p className="mt-1 text-gray-600">Configure and manage parking spaces</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="primary"
            onClick={() => setIsAddMode(!isAddMode)}
            icon={isAddMode ? <X size={16} /> : <Plus size={16} />}
          >
            {isAddMode ? 'Cancel' : 'Add New Slot'}
          </Button>
        </div>
      </div>
      
      {/* Add New Slot Form */}
      {isAddMode && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Parking Slot</h2>
          
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Slot Number"
              name="slotNumber"
              value={slotForm.slotNumber}
              onChange={handleFormChange}
              placeholder="e.g., A1"
              required
            />
            
            <Select
              label="Slot Type"
              name="type"
              value={slotForm.type}
              onChange={handleFormChange}
              options={[
                { value: 'REGULAR', label: 'Regular' },
                { value: 'VIP', label: 'VIP' }
              ]}
              required
            />
            
            <div className="flex items-end mb-4">
              <div className="flex items-center h-10 mt-6">
                <input
                  id="isAvailable"
                  name="isAvailable"
                  type="checkbox"
                  checked={slotForm.isAvailable}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Available for booking
                </label>
              </div>
            </div>
            
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddMode(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Plus size={16} />}
              >
                Add Slot
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            icon={<Filter size={16} />}
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Slot Number"
              name="slotNumber"
              value={filters.slotNumber}
              onChange={handleFilterChange}
              placeholder="Search by slot number"
            />
            
            <Select
              label="Slot Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Types' },
                { value: 'VIP', label: 'VIP' },
                { value: 'REGULAR', label: 'Regular' }
              ]}
            />
            
            <Select
              label="Availability"
              name="isAvailable"
              value={filters.isAvailable}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Available' },
                { value: 'false', label: 'Occupied' }
              ]}
            />
            
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyFilters}
                icon={<Search size={16} />}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Slots Visualization */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Parking Slots Visualization</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSlots}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
        
        <SlotGrid slots={slots} isSelectable={false} />
      </Card>
      
      {/* Slots Table */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Parking Slots List</h2>
        </div>
        
        <Table
          columns={columns}
          data={slots}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No parking slots found."
        />
      </Card>
    </div>
  );
};

export default ParkingSlots;