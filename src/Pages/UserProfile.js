import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://31.97.206.144:7021/api/admin/getsingleuser/${userId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch user");

        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>User not found</p>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        <FiArrowLeft /> Back to Users List
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">User Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center">
            <img
              src={user.profileImage || "https://via.placeholder.com/150?text=No+Image"}
              alt={user.name}
              className="w-48 h-48 rounded-full object-cover border-4 border-blue-100"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=No+Image")}
            />
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">User ID: {user.id}</p>
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : user.status === "inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.status || "active"}
              </span>
            </div>
          </div>

          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Basic Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Mobile:</span> {user.mobile || "N/A"}
                  </p>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Account Information</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Joined On:</span>{" "}
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              {user.addresses && user.addresses.length > 0 && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((address, index) => (
                      <div
                        key={address.id || address._id || index}
                        className="border p-3 rounded"
                      >
                        <h4 className="font-medium mb-2">Address {index + 1}</h4>
                        <p>
                          {address.house}, {address.street}
                        </p>
                        <p>
                          {address.city}, {address.state}
                        </p>
                        <p>
                          {address.pincode}, {address.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {user.notifications && user.notifications.length > 0 && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Notifications</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {user.notifications.map((notification) => (
                      <div
                        key={notification.id || notification._id}
                        className={`p-3 rounded border-l-4 ${
                          notification.read ? "border-gray-300" : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium">{notification.message}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              notification.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {notification.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {!notification.read && (
                          <span className="inline-block mt-1 text-xs text-blue-600">New</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {user.orders && user.orders.length > 0 && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Orders</h3>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto">
                    {user.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-md font-semibold">
                            Order ID: <span className="font-normal">{order.id}</span>
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Delivery Address */}
                        <div className="mb-3">
                          <h5 className="font-semibold text-blue-700 mb-1">Delivery Address:</h5>
                          <p>
                            {order.deliveryAddress.house}, {order.deliveryAddress.street}
                          </p>
                          <p>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state}
                          </p>
                          <p>
                            {order.deliveryAddress.pincode}, {order.deliveryAddress.country}
                          </p>
                        </div>

                        {/* Order Items */}
                        <div className="mb-3">
                          <h5 className="font-semibold text-blue-700 mb-1">Order Items:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {order.orderItems.map((item) => (
                              <li key={item.id}>
                                <strong>{item.name}</strong> - Quantity: {item.quantity} | Price: ₹
                                {item.price} | Total: ₹{item.total}{" "}
                                {item.pharmacyName && (
                                  <span className="text-gray-500">(Pharmacy: {item.pharmacyName})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Status Timeline */}
                        <div className="mb-3">
                          <h5 className="font-semibold text-blue-700 mb-1">Status Timeline:</h5>
                          <ul className="space-y-1">
                            {order.statusTimeline.map((status) => (
                              <li key={status.timestamp}>
                                <span className="font-medium">{status.status}:</span> {status.message}{" "}
                                <span className="text-gray-500 text-xs">
                                  ({new Date(status.timestamp).toLocaleString()})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Other Details */}
                        <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p>
                            <strong>Total Amount:</strong> ₹{order.totalAmount}
                          </p>
                          <p>
                            <strong>Payment Method:</strong> {order.paymentMethod}
                          </p>
                          <p>
                            <strong>Notes:</strong> {order.notes || "N/A"}
                          </p>
                          {order.voiceNoteUrl && (
                            <p>
                              <strong>Voice Note:</strong>{" "}
                              <audio controls src={order.voiceNoteUrl} className="inline-block" />
                            </p>
                          )}
                          <p>
                            <strong>Assigned Rider Status:</strong> {order.assignedRiderStatus}
                          </p>
                        </div>

                        {/* Assigned Rider Info */}
                        {order.assignedRider && (
                          <div>
                            <h5 className="font-semibold text-blue-700 mb-1">Assigned Rider:</h5>
                            <p>Name: {order.assignedRider.name}</p>
                            <p>Phone: {order.assignedRider.phone}</p>
                            <p>Email: {order.assignedRider.email}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-3">
                          Created at: {new Date(order.createdAt).toLocaleString()} | Updated at:{" "}
                          {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
