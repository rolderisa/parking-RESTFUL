import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0
  });
  
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    plateNumber: '',
    role: ''
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '')
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...cleanFilters
        }
      });

      const { users, page, limit, totalPages, totalCount } = response.data;

      setUsers(users);
      setPagination({
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalCount
      });

      if (users.length === 0 && Object.keys(cleanFilters).length > 0) {
        toast('No users match your search criteria', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [pagination.page, filters]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', plateNumber: '', role: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Plate Number',
      accessor: 'plateNumber',
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${row.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
        `}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Bookings',
      accessor: '_count.bookings',
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">View and search user accounts</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="secondary"
            onClick={exportUsers}
            icon={<Download size={16} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              label="Search by Name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Enter user name..."
              icon={<Search size={16} />}
            />
          </div>
          <div className="flex-1 max-w-md">
            <Input
              label="Search by Email"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Enter user email..."
              icon={<Search size={16} />}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            icon={<RefreshCw size={16} />}
          >
            Clear Filters
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            icon={<Filter size={16} />}
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Additional Filters */}
      {isFilterOpen && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Plate Number"
              name="plateNumber"
              value={filters.plateNumber}
              onChange={handleFilterChange}
              placeholder="Search by plate"
            />
            <Select
              label="Role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'USER', label: 'User' },
                { value: 'ADMIN', label: 'Admin' }
              ]}
            />
            <div className="md:col-span-3 flex justify-end space-x-2 mt-4" />
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">User List</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          data={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={loading}
          noDataMessage="No users found."
        />
      </Card>
    </div>
  );
};

export default Users;