import React, { useState, useEffect } from "react";
import { FiDownload, FiFilter } from "react-icons/fi";
import { CSVLink } from "react-csv";
import axios from "axios";

export default function RefundOrders() {
  const [orders, setOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRefundOrders();
  }, []);

  const fetchRefundOrders = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/refund-orders");
      setOrders(res.data.refundOrders);
    } catch (error) {
      console.error("Error fetching refund orders:", error);
    }
  };

  const prepareCSVData = () => {
    const headers = [
      { label: "Refund ID", key: "_id" },
      { label: "User Name", key: "userName" },
      { label: "User Mobile", key: "userMobile" },
      { label: "Medicines", key: "medicines" },
      { label: "Total Amount", key: "totalAmount" },
      { label: "Refund Amount", key: "refundAmount" },
      { label: "Status", key: "status" },
      { label: "Reason", key: "reason" },
      { label: "Date", key: "date" },
      { label: "Payment Method", key: "paymentMethod" },
    ];

    const data = orders.map((order) => ({
      _id: order._id,
      userName: order.userId?.name,
      userMobile: order.userId?.mobile,
      medicines: order.items?.map((m) => `${m.name} (Qty: ${m.quantity})`).join(", "),
      totalAmount: order.totalAmount,
      refundAmount: order.refundAmount,
      status: order.status,
      reason: order.refundReason,
      date: new Date(order.createdAt).toLocaleString(),
      paymentMethod: order.paymentMethod,
    }));

    return { headers, data };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-700">Refund Orders</h1>

      {/* Export CSV */}
      {orders.length > 0 && (
        <CSVLink
          {...prepareCSVData()}
          filename="refund-orders.csv"
          className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 no-underline mb-4 inline-block"
        >
          <FiDownload className="inline mr-2" /> Export CSV
        </CSVLink>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto border rounded shadow bg-white">
        <table className="w-full table-auto">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Medicines</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Refund</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, idx) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 align-top">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold">{order.userId?.name}</div>
                    <div className="text-sm text-gray-500">{order.userId?.mobile}</div>
                  </td>
                  <td className="p-3">
                    {order.items?.map((m, i) => (
                      <div key={i} className="text-sm">{m.name} × {m.quantity}</div>
                    ))}
                  </td>
                  <td className="p-3 font-bold text-gray-700">₹{order.totalAmount}</td>
                  <td className="p-3 font-bold text-red-700">₹{order.refundAmount}</td>
                  <td className="p-3">{order.paymentMethod}</td>
                  <td className="p-3 text-sm text-gray-600">{order.refundReason}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{order.status}</span>
                  </td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500 font-medium">
                  No refund orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
