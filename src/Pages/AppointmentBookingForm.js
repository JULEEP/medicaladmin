import React, { useEffect, useState } from "react";
import { FiEye, FiDownload, FiFilter } from "react-icons/fi";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";

export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 5;

  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://31.97.206.144:7021/api/admin/getallpayments");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch payments");

      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Prepare data for CSV export
  const prepareCSVData = () => {
    const headers = [
      { label: "Payment ID", key: "_id" },
      { label: "User Name", key: "userName" },
      { label: "User Mobile", key: "userMobile" },
      { label: "Amount", key: "totalAmount" },
      { label: "Payment Method", key: "paymentMethod" },
      { label: "Status", key: "status" },
      { label: "Date", key: "date" },
    ];

    const data = filteredPayments.map((p) => ({
      _id: p._id,
      userName: p.userId?.name || "N/A",
      userMobile: p.userId?.mobile || "N/A",
      totalAmount: p.totalAmount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      date: new Date(p.createdAt).toLocaleString(),
    }));

    return { headers, data };
  };

  // Filter payments by method and status
  const filteredPayments = payments.filter((p) => {
    const methodMatch =
      !filterMethod ||
      (p.paymentMethod &&
        p.paymentMethod.toLowerCase().includes(filterMethod.toLowerCase()));
    const statusMatch =
      !filterStatus ||
      (p.status && p.status.toLowerCase().includes(filterStatus.toLowerCase()));
    return methodMatch && statusMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Unique filters
  const uniqueMethods = [...new Set(payments.map((p) => p.paymentMethod))].sort();
  const uniqueStatuses = [...new Set(payments.map((p) => p.status))].sort();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">All Payments</h1>

      {/* Filters + Export */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          <FiFilter /> Filters
        </button>

        {filteredPayments.length > 0 && (
          <CSVLink
            {...prepareCSVData()}
            filename="payments-export.csv"
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-900 no-underline"
          >
            <FiDownload className="inline mr-2" />
            Export to CSV
          </CSVLink>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded shadow-md mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Payment Method
              </label>
              <select
                value={filterMethod}
                onChange={(e) => {
                  setFilterMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">All Methods</option>
                {uniqueMethods.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
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
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      )}

      {loading && <p>Loading payments...</p>}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border rounded shadow bg-white">
            <table className="w-full table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p, idx) => (
                    <tr
                      key={p._id}
                      className="border-b hover:bg-gray-50 align-top"
                    >
                      <td className="p-3">{indexOfFirstItem + idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {p.userId?.profileImage && (
                            <img
                              src={p.userId.profileImage}
                              alt={p.userId.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/50?text=No+Img")
                              }
                            />
                          )}
                          <div>
                            <div className="font-semibold">
                              {p.userId?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {p.userId?.mobile || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-blue-700">
                        ₹{p.totalAmount}
                      </td>
                      <td className="p-3">{p.paymentMethod}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            p.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : p.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : p.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : p.status === "Confirmed"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 flex space-x-3 text-lg">
                        <FiEye
                          onClick={() => navigate(`/admin/payments/${p._id}`)}
                          className="text-green-500 cursor-pointer hover:text-green-600"
                          title="View"
                        />
                        <FiDownload
                          onClick={() =>
                            alert(`Downloading receipt for ${p._id}`)
                          }
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          title="Download Receipt"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500 font-medium"
                    >
                      No payments found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
