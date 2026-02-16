import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3, FiEye } from "react-icons/fi";

const WithdrawalRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewPopup, setViewPopup] = useState(null);
  const rowsPerPage = 10;

  // Fetch all withdrawal requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:7021/api/admin/withdrawal-requests"
      );
      setRequests(res.data.requests);
    } catch (error) {
      console.error("Error fetching withdrawal requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Delete withdrawal request
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://31.97.206.144:7021/api/admin/deletewithdrawal-requests/${id}`
      );
      setRequests(requests.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Error deleting withdrawal request", error);
    }
  };

  // Open popup to update status
  const handleOpenPopup = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
  };

  // Open view popup
  const handleViewPopup = (request) => {
    setViewPopup(request);
  };

  // Update withdrawal request status
  const handleUpdateStatus = async () => {
    try {
      const res = await axios.put(
        `http://31.97.206.144:7021/api/admin/approvewithdrawalrequests/${selectedRequest._id}`,
        { status: newStatus }
      );

      setRequests(
        requests.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: newStatus, updatedAt: res.data.updatedAt }
            : r
        )
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating status", error);
      alert(
        error?.response?.data?.message ||
          "An error occurred while updating status"
      );
    }
  };

  // Search filter
  const filteredRequests = requests.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.riderId?.name?.toLowerCase().includes(query) ||
      r.riderId?.email?.toLowerCase().includes(query) ||
      r.riderId?.phone?.toLowerCase().includes(query) ||
      r.bankDetail?.bankName?.toLowerCase().includes(query) ||
      r.status?.toLowerCase().includes(query) ||
      r.amount?.toString().includes(query)
    );
  });

  // Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Rider Name",
      "Email",
      "Phone",
      "Amount",
      "Account Holder",
      "Bank Name",
      "Account Number",
      "IFSC",
      "UPI ID",
      "Status",
      "Requested At",
      "Updated At",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredRequests.map((r) =>
        [
          `"${r.riderId?.name || "N/A"}"`,
          `"${r.riderId?.email || "N/A"}"`,
          `"${r.riderId?.phone || "N/A"}"`,
          r.amount,
          `"${r.bankDetail?.accountHolderName || "N/A"}"`,
          `"${r.bankDetail?.bankName || "N/A"}"`,
          `"${r.bankDetail?.accountNumber || "N/A"}"`,
          `"${r.bankDetail?.ifscCode || "N/A"}"`,
          `"${r.bankDetail?.upiId || "N/A"}"`,
          `"${r.status}"`,
          `"${new Date(r.requestedAt).toLocaleString()}"`,
          `"${r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "N/A"}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "withdrawal_requests.csv");
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Withdrawal Requests</h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, email, phone, bank..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded w-80"
          />

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-100">
                <tr className="text-center">
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">S NO</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Rider Info</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Amount</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Bank Details</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Requested At</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap border">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((r, index) => (
                    <tr key={r._id} className="text-center hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap border font-semibold">
                      {(currentPage - 1)*rowsPerPage + index + 1}
                      </td>
                      {/* Rider Info */}
                      <td className="px-4 py-3 text-sm border">
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{r.riderId?.name || "N/A"}</div>
                          <div className="text-gray-500 text-xs">{r.riderId?.email || "N/A"}</div>
                          <div className="text-gray-500 text-xs">{r.riderId?.phone || "N/A"}</div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap border font-semibold">
                        ₹{r.amount?.toLocaleString()}
                      </td>

                      {/* Bank Details */}
                      <td className="px-4 py-3 text-sm border">
                        <div className="text-left">
                          <div className="font-medium">{r.bankDetail?.accountHolderName || "N/A"}</div>
                          <div className="text-gray-500 text-xs">{r.bankDetail?.bankName || "N/A"}</div>
                          <div className="text-gray-500 text-xs">A/C: {r.bankDetail?.accountNumber || "N/A"}</div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-sm border">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : r.status === "Requested" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      {/* Requested At */}
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap border">
                        {new Date(r.requestedAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(r.requestedAt).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-sm border">
                        <div className="flex justify-center gap-3">
                          <FiEye
                            className="text-green-600 cursor-pointer hover:text-green-800 transition-colors"
                            onClick={() => handleViewPopup(r)}
                            size={18}
                            title="View Details"
                          />
                          <FiEdit3
                            className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                            onClick={() => handleOpenPopup(r)}
                            size={18}
                            title="Edit Status"
                          />
                          <FiTrash2
                            className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                            onClick={() => handleDelete(r._id)}
                            size={18}
                            title="Delete Request"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-4 text-sm text-center text-gray-500 whitespace-nowrap border" colSpan="6">
                      No withdrawal requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-700">
          Page {currentPage} of {totalPages} | Showing {currentRequests.length} of {filteredRequests.length} requests
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Update Status Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl border">
            <h3 className="text-lg font-bold mb-4">
              Update Withdrawal Status
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Rider: <span className="font-medium">{selectedRequest.riderId?.name}</span></p>
              <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{selectedRequest.amount}</span></p>
            </div>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Requested">Requested</option>
              <option value="Approved">Approved</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleUpdateStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Popup */}
      {viewPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Withdrawal Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rider Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Rider Information</h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm">{viewPopup.riderId?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{viewPopup.riderId?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{viewPopup.riderId?.phone || "N/A"}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Bank Details</h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Holder</label>
                  <p className="text-sm">{viewPopup.bankDetail?.accountHolderName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Name</label>
                  <p className="text-sm">{viewPopup.bankDetail?.bankName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Number</label>
                  <p className="text-sm">{viewPopup.bankDetail?.accountNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                  <p className="text-sm">{viewPopup.bankDetail?.ifscCode || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">UPI ID</label>
                  <p className="text-sm">{viewPopup.bankDetail?.upiId || "N/A"}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Transaction Details</h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-sm font-semibold">₹{viewPopup.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewPopup.status === "Approved" 
                      ? "bg-green-100 text-green-800" 
                      : viewPopup.status === "Requested" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {viewPopup.status}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Timestamps</h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested At</label>
                  <p className="text-sm">{new Date(viewPopup.requestedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated At</label>
                  <p className="text-sm">{viewPopup.updatedAt ? new Date(viewPopup.updatedAt).toLocaleString() : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request ID</label>
                  <p className="text-sm font-mono text-xs">{viewPopup._id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                onClick={() => setViewPopup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestsPage;