import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Eye, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    type: '',
    plateNumber: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );

    try {
      const response = await api.get('/vehicles', {
        params: {
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...cleanFilters,
        },
      });

      const { vehicles, page, limit, totalPages, totalCount } = response.data;

      setVehicles(vehicles);
      setPagination({
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalCount,
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [pagination.page, filters]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ type: '', plateNumber: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (plateNumber) => {
    try {
      await api.delete(`/vehicles/${plateNumber}`);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const columns = [
    {
      header: 'Plate Number',
      accessor: 'plateNumber',
      cell: (row) => (
        <span className="font-medium text-gray-900">{row.plateNumber}</span>
      ),
    },
    {
      header: 'Vehicle Type',
      accessor: 'type',
      cell: (row) => (
        <span className="uppercase text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Size',
      accessor: 'size',
      cell: (row) => (
        <span className="uppercase text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {row.size}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2 justify-end">
          <Link to={`/vehicles/edit/${row.plateNumber}`}>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-600"
              title="Edit Vehicle"
            >
              <Pencil size={16} />
            </Button>
          </Link>

          <Link to={`/vehicles/${row.plateNumber}`}>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-600"
              title="View Details"
            >
              <Eye size={16} />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            className="text-error-600"
            onClick={() => handleDelete(row.plateNumber)}
            title="Delete Vehicle"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="mt-1 text-gray-600">Manage your registered vehicles</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            to="/vehicles/add"
            variant="primary"
            icon={<Plus size={16} />}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

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
            {/* Vehicle Type Filter */}
            <Select
              label="Vehicle Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Types' },
                { value: 'CAR', label: 'Car' },
                { value: 'MOTORCYCLE', label: 'Motorcycle' },
                { value: 'TRUCK', label: 'Truck' },
              ]}
            />

           

            {/* Filter Buttons */}
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={fetchVehicles}
                icon={<Search size={16} />}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
       {/* Plate Number Search */}
            <div className='mb-4'>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plate Number
              </label>
              <input
                type="text"
                name="plateNumber"
                value={filters.plateNumber}
                onChange={handleFilterChange}
                placeholder="Search by Plate Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

      {/* Vehicles Table */}
      <Card className="mb-6 ">
        <Table
          columns={columns}
          data={vehicles}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No vehicles found"
        />
      </Card>
    </div>
  );
};

export default Vehicles;
