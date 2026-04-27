import React, { useEffect, useState } from "react";
import { 
  FiEdit, FiTrash, FiEye, FiCalendar, FiUser, 
  FiMail, FiPhone, FiDollarSign, FiPackage,
  FiRefreshCw, FiInbox, FiAlertCircle, FiX
} from "react-icons/fi";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

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
        const response = await axios.get("https://api.simcurarx.com/api/admin/todayorders");
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
        await axios.put(`https://api.simcurarx.com/api/admin/orderstatus/${selectedOrder._id}`, { 
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
        await axios.delete(`https://api.simcurarx.com/api/admin/deleteorder/${orderId}`);

        // Remove the order from the local state
        setOrdersData(ordersData.filter((order) => order._id !== orderId));
        alert("Order deleted successfully.");
      } catch (err) {
        console.error("Error deleting order", err);
        alert("Error deleting order. Please try again.");
      }
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    const fetchTodaysOrders = async () => {
      try {
        const response = await axios.get("https://api.simcurarx.com/api/admin/todayorders");
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
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to get payment method color
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "Cash on Delivery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading today's orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <FiAlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load orders</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-green-600" />
                Today's Orders
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all orders placed today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                <FiPackage className="mr-1 h-4 w-4" />
                Total: {ordersData.length} orders
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Payment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Items</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-3 py-12">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <FiInbox className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                          No orders found for today
                        </h3>
                        <p className="text-sm text-gray-500">
                          There are no orders placed today yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ordersData.map((order, index) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {order._id?.slice(-6)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="ml-2">
                            <div className="text-xs font-medium text-gray-900">
                              {order.userId?.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center text-xs text-gray-500">
                            <FiMail className="h-2.5 w-2.5 mr-1 text-gray-400" />
                            <span className="truncate max-w-[100px]">{order.userId?.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <FiPhone className="h-2.5 w-2.5 mr-1 text-gray-400" />
                            {order.userId?.mobile || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full border ${getPaymentMethodColor(order.paymentMethod)}`}>
                          {order.paymentMethod === "Cash on Delivery" ? "COD" : "Online"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <span className="font-medium">
                            {order.orderItems[0]?.medicineId?.name?.split(' ').slice(0, 2).join(' ') || "N/A"}
                          </span>
                          {order.orderItems?.length > 1 && (
                            <span className="text-gray-400 ml-1">+{order.orderItems.length - 1}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.orderItems[0]?.medicineId?.pharmacyId?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-semibold text-green-600">
                          ₹{order.totalAmount?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <FiCalendar className="h-2.5 w-2.5 mr-1 text-gray-400" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-1">
                          <button
                            className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                            onClick={() => handleEdit(order)}
                            title="Edit Status"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                          <button
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            onClick={() => handleDelete(order._id)}
                            title="Delete Order"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Editing Status */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Order Status</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-mono font-medium">{selectedOrder?._id?.slice(-8)}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysOrders;