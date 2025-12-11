import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const TodaysOrders = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Fetch today's orders when the component mounts
  useEffect(() => {
    const fetchTodaysOrders = async () => {
      try {
        const response = await axios.get("http://31.97.206.144:7021/api/admin/todayorders");
        if (response.data && response.data.orders) {
          setOrdersData(response.data.orders);
        }
      } catch (err) {
        setError("Error fetching today's orders.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysOrders();
  }, []);

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = async () => {
    if (selectedOrder) {
      try {
        // Update status in the backend
        await axios.put(`http://31.97.206.144:7021/api/admin/orderstatus/${selectedOrder._id}`, { 
          status: newStatus 
        });

        // Update the status in the local state
        setOrdersData((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id ? { ...order, status: newStatus } : order
          )
        );

        setIsModalOpen(false);
        alert("Status updated successfully!");
      } catch (err) {
        console.error("Error updating status", err);
        alert("Error updating status. Please try again.");
      }
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://31.97.206.144:7021/api/admin/order/${orderId}`);

        // Remove the order from the local state
        setOrdersData(ordersData.filter((order) => order._id !== orderId));
        alert("Order deleted successfully.");
      } catch (err) {
        console.error("Error deleting order", err);
        alert("Error deleting order. Please try again.");
      }
    }
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-lg text-blue-900">Loading today's orders...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-lg text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Today's Orders</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Total: {ordersData.length} orders
        </div>
      </div>

      {ordersData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found for today.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 border text-left">Sl</th>
                <th className="p-3 border text-left">Order ID</th>
                <th className="p-3 border text-left">User Name</th>
                <th className="p-3 border text-left">User Email</th>
                <th className="p-3 border text-left">Mobile</th>
                <th className="p-3 border text-left">Payment Method</th>
                <th className="p-3 border text-left">Poster Name</th>
                <th className="p-3 border text-left">Pharmacy</th>
                <th className="p-3 border text-left">Total Amount</th>
                <th className="p-3 border text-left">Order Status</th>
                <th className="p-3 border text-left">Order Date</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order, index) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border font-mono text-sm">{order._id?.slice(-6)}</td>
                  <td className="p-3 border font-medium">{order.userId?.name || "N/A"}</td>
                  <td className="p-3 border text-blue-600">{order.userId?.email || "N/A"}</td>
                  <td className="p-3 border">{order.userId?.mobile || "N/A"}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.paymentMethod === "Cash on Delivery" 
                        ? "bg-orange-100 text-orange-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 border">
                    {order.orderItems[0]?.medicineId?.name || "N/A"}
                  </td>
                  <td className="p-3 border">
                    {order.orderItems[0]?.medicineId?.pharmacyId?.name || "N/A"}
                  </td>
                  <td className="p-3 border font-semibold text-green-700">
                    ₹{order.totalAmount?.toLocaleString() || "0"}
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 border text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border">
                    <div className="flex justify-start gap-3">
                      <button
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => handleEdit(order)}
                        title="Edit Status"
                      >
                        <FaEdit className="text-sm" />
                        <span className="text-xs">Edit</span>
                      </button>
                      <button
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                        onClick={() => handleDelete(order._id)}
                        title="Delete Order"
                      >
                        <FaTrash className="text-sm" />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Editing Status */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3 max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Order Status</h2>
            <div className="my-4">
              <label className="block mb-2 font-medium text-gray-700" htmlFor="status">
                Order Status
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={handleStatusChange}
                className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysOrders;