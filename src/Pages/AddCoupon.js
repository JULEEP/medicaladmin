import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const AddCoupon = () => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  // ✅ Add Coupon API
  const addCoupon = async () => {
    if (!couponCode || !discountPercentage || !expirationDate) {
      setMessage('Please fill in all fields!');
      return;
    }

    try {
      const response = await axios.post('http://31.97.206.144:7021/api/admin/addcoupon', {
        couponCode,
        discountPercentage,
        expirationDate,
      });

      setMessage(response.data.message || 'Coupon added successfully');
      
      // Reset the form fields
      setCouponCode('');
      setDiscountPercentage('');
      setExpirationDate('');

      // Redirect to the /couponlist page
      setTimeout(() => {
        navigate('/couponlist');
      }, 1000); // Delay to show success message before navigating
    } catch (error) {
      console.error('Error adding coupon', error);
      setMessage('Failed to add coupon');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Coupon</h2>

      {/* Message Display */}
      {message && (
        <div className="text-sm text-green-600 mb-4">{message}</div>
      )}

      <div className="space-y-6">
        {/* Coupon Code & Discount Percentage - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <label className="block text-gray-700 mb-2">Coupon Code</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <label className="block text-gray-700 mb-2">Discount Percentage (%)</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="Enter discount percentage"
            />
          </div>
        </div>

        {/* Expiration Date - Row 2 */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <label className="block text-gray-700 mb-2">Expiration Date</label>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        {/* Add Coupon Button */}
        <div className="flex justify-end">
          <button
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none"
            onClick={addCoupon}
          >
            Add Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCoupon;
