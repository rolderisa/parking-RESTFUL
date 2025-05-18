import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams(); // Get vehicle ID from the URL
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        setVehicle(res.data);
      } catch (err) {
        toast.error('Failed to load vehicle details');
      }
    };

    fetchVehicle();
  }, [id]);

  if (!vehicle) return <div>Loading vehicle details...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>

      <div className="mb-2">
        <strong>Plate Number:</strong> {vehicle.plate_number}
      </div>

      <div className="mb-2">
        <strong>Type:</strong> {vehicle.vehicle_type}
      </div>

      <div className="mb-2">
        <strong>Size:</strong> {vehicle.size}
      </div>

      <div className="mb-2">
        <strong>Attributes:</strong>
        <ul className="list-disc ml-6">
          {vehicle.attributes &&
            Object.entries(vehicle.attributes).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-4">
        <Link
          to={`/vehicles/edit/${vehicle.id}`}
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
