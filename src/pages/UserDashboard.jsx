import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import InvoiceManagement from '../components/InvoiceManagement';
import { getSales } from '../firebase/firestore';

const UserDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const salesData = await getSales();
        setSales(salesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p>Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <p className="text-red-500">Error loading sales data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold">User Dashboard</h1>
      <p>Welcome, User!</p>
      {currentUser && <InvoiceManagement sales={sales} userRole="user" currentUserId={currentUser.uid} />}
    </div>
  );
};

export default UserDashboard;
