import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams(); // Get vehicle ID or plateNumber from the URL
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        console.log('Fetching vehicle with ID:', id); // Debug log
        const res = await axios.get(`/api/vehicles/plate/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Ensure auth if required
        });
        console.log('Vehicle data:', res.data); // Debug log
        setVehicle(res.data);
      } catch (err) {
        console.error('Error fetching vehicle:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load vehicle details');
        toast.error(err.response?.data?.message || 'Failed to load vehicle details');
      }
    };

    fetchVehicle();
  }, [id]);

  if (error) return <div className="max-w-xl mx-auto bg-white shadow p-6 rounded text-red-600">{error}</div>;
  if (!vehicle) return <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">Loading vehicle details...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>

      <div className="mb-2">
        <strong>Plate Number:</strong> {vehicle.plateNumber || 'N/A'}
      </div>

      <div className="mb-2">
        <strong>Type:</strong> {vehicle.type || 'N/A'}
      </div>

      <div className="mb-2">
        <strong>Size:</strong> {vehicle.size || 'N/A'}
      </div>

      <div className="mb-2">
        <strong>Attributes:</strong>
        <ul className="list-disc ml-6">
          {vehicle.attributes && Object.entries(vehicle.attributes).length > 0 ? (
            Object.entries(vehicle.attributes).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value || 'N/A'}
              </li>
            ))
          ) : (
            <li>No attributes available</li>
          )}
        </ul>
      </div>

      <div className="mt-4 flex gap-4">
        <Link
          to={`/vehicles/edit/${vehicle.plateNumber}`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit
        </Link>
        <Link
          to="/vehicles"
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to List
        </Link>
      </div>
    </div>
  );
};

export default VehicleDetails;