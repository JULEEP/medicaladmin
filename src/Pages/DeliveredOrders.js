import React, { useState, useEffect } from "react";
import { FiDownload, FiFilter } from "react-icons/fi";
import { CSVLink } from "react-csv";
import axios from "axios";

export default function DeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [filterRider, setFilterRider] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // all statuses
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/delivered-orders");
      setOrders(res.data.orders);
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const riderMatch =
      !filterRider ||
      order.assignedRider?.name?.toLowerCase().includes(filterRider.toLowerCase());
    const statusMatch =
      !filterStatus ||
      order.status?.toLowerCase().includes(filterStatus.toLowerCase());
    return riderMatch && statusMatch;
  });

  // Prepare CSV Data
  const prepareCSVData = () => {
    const headers = [
      { label: "Order ID", key: "_id" },
      { label: "User Name", key: "userName" },
      { label: "User Mobile", key: "userMobile" },
      { label: "Medicines", key: "medicines" },
      { label: "Total Amount", key: "totalAmount" },
      { label: "Status", key: "status" },
      { label: "Date", key: "date" },
      { label: "Payment Method", key: "paymentMethod" },
      { label: "Rider Name", key: "riderName" },
      { label: "Rider Mobile", key: "riderMobile" },
      { label: "Vehicle", key: "vehicle" },
    ];

    const data = filteredOrders.map((order) => ({
      _id: order._id,
      userName: order.userId?.name,
      userMobile: order.userId?.mobile,
      medicines: order.orderItems
        ?.map((m) => `${m.name} (Qty: ${m.quantity})`)
        .join(", "),
      totalAmount: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleString(),
      paymentMethod: order.paymentMethod,
      riderName: order.assignedRider?.name,
      riderMobile: order.assignedRider?.mobile,
      vehicle: order.assignedRider?.vehicle,
    }));

    return { headers, data };
  };

  const uniqueRiders = [...new Set(orders.map((o) => o.assignedRider?.name).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Delivered Orders</h1>

      {/* Filters and Export */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
        >
          <FiFilter /> Filters
        </button>

        {filteredOrders.length > 0 && (
          <CSVLink
            {...prepareCSVData()}
            filename="delivered-orders.csv"
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 no-underline"
          >
            <FiDownload className="inline mr-2" /> Export CSV
          </CSVLink>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded shadow-md mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Rider
              </label>
              <select
                value={filterRider}
                onChange={(e) => setFilterRider(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Riders</option>
                {uniqueRiders.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto border rounded shadow bg-white">
        <table className="w-full table-auto">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">S NO</th>
              <th className="p-3 text-left">OrderId</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Medicines</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Rider</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 align-top">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-mono text-sm">{order._id?.slice(-6)}</td>
                  <td className="p-3">
                    <div className="font-semibold">{order.userId?.name || "N/A"}</div>
                    <div className="text-sm text-gray-500">{order.userId?.mobile}</div>
                  </td>
                  <td className="p-3">
                    {order.orderItems?.map((m, i) => (
                      <div key={i} className="text-sm">
                        {m.name} × {m.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-3 font-bold text-green-700">₹{order.totalAmount}</td>
                  <td className="p-3">{order.paymentMethod}</td>
                  <td className="p-3">
                    <div className="font-semibold">{order.assignedRider?.name}</div>
                    <div className="text-sm">{order.assignedRider?.mobile}</div>
                    <div className="text-xs text-gray-500">{order.assignedRider?.vehicle}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500 font-medium">
                  No delivered orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
