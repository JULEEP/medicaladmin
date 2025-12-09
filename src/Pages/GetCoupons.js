import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';

const GetCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountPercentage, setNewDiscountPercentage] = useState('');
  const [newExpirationDate, setNewExpirationDate] = useState('');

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://31.97.206.144:7021/api/admin/getcoupons');
      setCoupons(response.data.coupons);
      setLoading(false);
    } catch (error) {
      setMessage('Failed to fetch coupons');
      setMessageType('error');
      setLoading(false);
    }
  };

 const handleDeleteCoupon = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this coupon?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`http://31.97.206.144:7021/api/admin/deletecoupon/${id}`);
    setCoupons(coupons.filter((coupon) => coupon._id !== id));
    setMessage('✅ Coupon deleted successfully');
    setMessageType('success');

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);

  } catch (error) {
    setMessage('❌ Failed to delete coupon');
    setMessageType('error');

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }
};


  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setNewCouponCode(coupon.couponCode);
    setNewDiscountPercentage(coupon.discountPercentage);
    setNewExpirationDate(coupon.expirationDate ? coupon.expirationDate.slice(0, 10) : '');
  };

  const handleUpdateCoupon = async () => {
    try {
      const updatedCoupon = {
        couponCode: newCouponCode,
        discountPercentage: newDiscountPercentage,
        expirationDate: newExpirationDate,
      };

      await axios.put(
        `http://31.97.206.144:7021/api/admin/editcoupon/${selectedCoupon._id}`,
        updatedCoupon
      );

      setCoupons(
        coupons.map((coupon) =>
          coupon._id === selectedCoupon._id
            ? { ...coupon, ...updatedCoupon }
            : coupon
        )
      );
      setSelectedCoupon(null);
      setMessage('Coupon updated successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update coupon');
      setMessageType('error');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Coupons</h2>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded max-w-xl w-full text-center
            ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          role="alert"
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b border-gray-200">Coupon Code</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Discount</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Expiration Date</th>
                <th className="py-3 px-6 text-center border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-normal">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-gray-100 border-b border-gray-200"
                  >
                    <td className="py-3 px-6 whitespace-nowrap">{coupon.couponCode}</td>
                    <td className="py-3 px-6">{coupon.discountPercentage}%</td>
                    <td className="py-3 px-6">
                      {coupon.expirationDate
                        ? new Date(coupon.expirationDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-6 flex justify-center gap-4">
                      <FiEdit3
                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                        size={18}
                        onClick={() => handleEditCoupon(coupon)}
                        title="Edit Coupon"
                      />
                      <FiTrash2
                        className="text-red-600 cursor-pointer hover:text-red-800"
                        size={18}
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        title="Delete Coupon"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No coupons available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Popup Modal */}
     {/* Edit Popup Modal */}
{selectedCoupon && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-30 z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[80vh]">
      <h3 className="text-xl font-semibold mb-5 text-gray-800">Edit Coupon</h3>

      <div className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Coupon Code</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value)}
            placeholder="Enter coupon code"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Discount Percentage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newDiscountPercentage}
            onChange={(e) => setNewDiscountPercentage(e.target.value)}
            placeholder="Enter discount percentage"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Expiration Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newExpirationDate}
            onChange={(e) => setNewExpirationDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={() => setSelectedCoupon(null)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleUpdateCoupon}
          >
            Update Coupon
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default GetCoupons;
