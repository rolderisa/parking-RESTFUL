import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Plus, Edit, Trash, Save, X } from 'lucide-react';
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
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    slotNumber: '',
    type: '',
    isAvailable: '',
    size: '',
    vehicleType: '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editSlotId, setEditSlotId] = useState(null);

  const [slotForm, setSlotForm] = useState({
    slotNumber: '',
    type: 'REGULAR',
    isAvailable: true,
    size: 'MEDIUM',
    vehicleType: 'CAR',
    location: '',
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
      setPagination((prev) => ({
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
  }, [pagination.page, filters]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSlots();
  };

  const clearFilters = () => {
    setFilters({
      slotNumber: '',
      type: '',
      isAvailable: '',
      size: '',
      vehicleType: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSlots();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSlotForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.slotNumber) {
      toast.error('Slot number is required');
      return;
    }
    const dataToSend = {
      ...slotForm,
      location: slotForm.location || undefined, // Send undefined if location is empty
    };
    console.log('Sending slotForm:', dataToSend); // Debug
    try {
      await api.post('/parking-slots', dataToSend);
      toast.success('Parking slot added successfully');
      setIsAddMode(false);
      setSlotForm({
        slotNumber: '',
        type: 'REGULAR',
        isAvailable: true,
        size: 'MEDIUM',
        vehicleType: 'CAR',
        location: '',
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
      isAvailable: slot.isAvailable,
      size: slot.size,
      vehicleType: slot.vehicleType || 'CAR',
      location: slot.location || '',
    });
  };

  const cancelEdit = () => {
    setEditSlotId(null);
    setSlotForm({
      slotNumber: '',
      type: 'REGULAR',
      isAvailable: true,
      size: 'MEDIUM',
      vehicleType: 'CAR',
      location: '',
    });
  };

  const handleUpdateSlot = async (id) => {
    if (!slotForm.slotNumber) {
      toast.error('Slot number is required');
      return;
    }
    const dataToSend = {
      ...slotForm,
      location: slotForm.location || undefined, // Send undefined if location is empty
    };
    try {
      await api.put(`/parking-slots/${id}`, dataToSend);
      toast.success('Parking slot updated successfully');
      cancelEdit();
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
      cell: (row) =>
        editSlotId === row.id ? (
          <Input
            name="slotNumber"
            value={slotForm.slotNumber}
            onChange={handleFormChange}
            className="w-28"
          />
        ) : (
          <span className="font-medium">{row.slotNumber}</span>
        ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) =>
        editSlotId === row.id ? (
          <Select
            name="type"
            value={slotForm.type}
            onChange={handleFormChange}
            options={[
              { value: 'VIP', label: 'VIP' },
              { value: 'REGULAR', label: 'Regular' },
            ]}
            className="w-28"
          />
        ) : (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              row.type === 'VIP'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {row.type}
          </span>
        ),
    },
    {
      header: 'Size',
      accessor: 'size',
      cell: (row) =>
        editSlotId === row.id ? (
          <Select
            name="size"
            value={slotForm.size}
            onChange={handleFormChange}
            options={[
              { value: 'SMALL', label: 'Small' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LARGE', label: 'Large' },
            ]}
            className="w-28"
          />
        ) : (
          <span>{row.size}</span>
        ),
    },
    {
      header: 'Vehicle Type',
      accessor: 'vehicleType',
      cell: (row) =>
        editSlotId === row.id ? (
          <Select
            name="vehicleType"
            value={slotForm.vehicleType}
            onChange={handleFormChange}
            options={[
              { value: 'CAR', label: 'Car' },
              { value: 'BIKE', label: 'Bike' },
              { value: 'MOTORCYCLE', label: 'Motorcycle' },
              { value: 'TRUCK', label: 'Truck' },
            ]}
            className="w-28"
          />
        ) : (
          <span>{row.vehicleType || 'N/A'}</span>
        ),
    },
    {
      header: 'Location',
      accessor: 'location',
      cell: (row) =>
        editSlotId === row.id ? (
          <Input
            name="location"
            value={slotForm.location}
            onChange={handleFormChange}
            className="w-28"
          />
        ) : (
          <span>{row.location || 'N/A'}</span>
        ),
    },
    {
      header: 'Status',
      accessor: 'isAvailable',
      cell: (row) =>
        editSlotId === row.id ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={slotForm.isAvailable}
              onChange={handleFormChange}
              className="h-4 w-4"
            />
            <span className="ml-2 text-sm">Available</span>
          </div>
        ) : (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              row.isAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.isAvailable ? 'Available' : 'Occupied'}
          </span>
        ),
    },
    {
      header: 'Actions',
      cell: (row) =>
        editSlotId === row.id ? (
          <div className="flex space-x-2 justify-end">
            <Button
              size="sm"
              variant="success"
              onClick={() => handleUpdateSlot(row.id)}
              title="Save"
            >
              <Save size={16} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={cancelEdit}
              title="Cancel"
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEdit(row)}
              title="Edit"
            >
              <Edit size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteSlot(row.id)}
              title="Delete"
            >
              <Trash size={16} />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header + Add Button */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Parking Slot Management
          </h1>
          <p className="text-gray-600">
            Manage parking slots with types, sizes, and vehicle compatibility
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddMode(!isAddMode)}
          icon={isAddMode ? <X size={16} /> : <Plus size={16} />}
        >
          {isAddMode ? 'Cancel' : 'Add New Slot'}
        </Button>
      </div>

      {/* Add Form */}
      {isAddMode && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Parking Slot</h2>
          <form
            onSubmit={handleAddSlot}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Input
              label="Slot Number"
              name="slotNumber"
              value={slotForm.slotNumber}
              onChange={handleFormChange}
              required
            />
            <Select
              label="Slot Type"
              name="type"
              value={slotForm.type}
              onChange={handleFormChange}
              options={[
                { value: 'REGULAR', label: 'Regular' },
                { value: 'VIP', label: 'VIP' },
              ]}
              required
            />
            <Select
              label="Slot Size"
              name="size"
              value={slotForm.size}
              onChange={handleFormChange}
              options={[
                { value: 'SMALL', label: 'Small' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LARGE', label: 'Large' },
              ]}
              required
            />
            <Select
              label="Vehicle Type"
              name="vehicleType"
              value={slotForm.vehicleType}
              onChange={handleFormChange}
              options={[
                { value: 'CAR', label: 'Car' },
                { value: 'BIKE', label: 'Bike' },
                { value: 'MOTORCYCLE', label: 'Motorcycle' },
                { value: 'TRUCK', label: 'Truck' },
              ]}
              required
            />
            <Input
              label="Location"
              name="location"
              value={slotForm.location}
              onChange={handleFormChange}
            />
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                name="isAvailable"
                checked={slotForm.isAvailable}
                onChange={handleFormChange}
              />
              <label className="ml-2">Available for booking</label>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
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
            />
            <Select
              label="Slot Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All' },
                { value: 'VIP', label: 'VIP' },
                { value: 'REGULAR', label: 'Regular' },
              ]}
            />
            <Select
              label="Size"
              name="size"
              value={filters.size}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All' },
                { value: 'SMALL', label: 'Small' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LARGE', label: 'Large' },
              ]}
            />
            <Select
              label="Vehicle Type"
              name="vehicleType"
              value={filters.vehicleType}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All' },
                { value: 'CAR', label: 'Car' },
                { value: 'BIKE', label: 'Bike' },
                { value: 'MOTORCYCLE', label: 'Motorcycle' },
                { value: 'TRUCK', label: 'Truck' },
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
                { value: 'false', label: 'Occupied' },
              ]}
            />
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyFilters}
                icon={<Search size={16} />}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Parking Slot List</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSlots}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
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