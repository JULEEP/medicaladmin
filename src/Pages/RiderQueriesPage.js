import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";

const RiderQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [viewingQuery, setViewingQuery] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRiderQueries = async () => {
    const res = await axios.get(
      "http://31.97.206.144:7021/api/admin/riderqueries"
    );
    setQueries(res.data.queries || []);
  };

  useEffect(() => { fetchRiderQueries(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this query?")) return;
    await axios.delete(`http://31.97.206.144:7021/api/admin/deletequeries/${id}`);
    setQueries((prev) => prev.filter((q) => q._id !== id));
  };

  const handleOpenPopup = (query) => {
    setSelectedQuery(query);
    setNewStatus(query.status);
  };

  const handleViewQuery = (query) => {
    setViewingQuery(query);
  };

  const handleUpdateStatus = async () => {
    const updatedAt = new Date().toISOString();

    await axios.put(
      `http://31.97.206.144:7021/api/admin/updatequeries/${selectedQuery._id}`,
      { status: newStatus, updatedAt }
    );

    setQueries((prev) =>
      prev.map((q) =>
        q._id === selectedQuery._id
          ? { ...q, status: newStatus, updatedAt }
          : q
      )
    );
    setSelectedQuery(null);
  };

  // Pagination
  const totalPages = Math.ceil(queries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQueries = queries.slice(startIndex, startIndex + itemsPerPage);

  const badgeColor = (status) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen p-2 md:p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🚴 Rider Queries</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage and respond to rider support queries</p>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border overflow-hidden">

          {/* Desktop Table View - Fixed column widths */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                <tr>
                  <th className="p-3 text-center w-16">S.No</th>
                  <th className="p-3 text-left w-32">Name</th>
                  <th className="p-3 text-left w-48">Email</th>
                  <th className="p-3 text-left w-28">Mobile</th>
                  <th className="p-3 text-left w-28">Status</th>
                  <th className="p-3 text-left w-28">Raised</th>
                  <th className="p-3 text-left w-28">Updated</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQueries.map((q, i) => (
                  <tr key={q._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 text-center font-semibold text-gray-500 truncate">{startIndex + i + 1}</td>
                    <td className="p-3 font-medium text-gray-800 truncate" title={q.name}>{q.name}</td>
                    <td className="p-3 text-gray-600 truncate" title={q.email}>{q.email}</td>
                    <td className="p-3 text-gray-600 truncate">{q.mobile}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeColor(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : "-"}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewQuery(q)}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition"
                          title="View details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenPopup(q)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                          title="Edit status"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {currentQueries.map((q, i) => (
              <div key={q._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500">#{startIndex + i + 1}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(q.status)}`}>
                        {q.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-base">{q.name}</h3>
                    <p className="text-xs text-gray-500 break-all">{q.email} • {q.mobile}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewQuery(q)}
                      className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600"
                      title="View details"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenPopup(q)}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                      title="Edit status"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>📅 Raised: {new Date(q.createdAt).toLocaleDateString()}</span>
                  {q.updatedAt && <span>🔄 Updated: {new Date(q.updatedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentQueries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No queries found</p>
            </div>
          )}

          {/* PREMIUM PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <FiChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm transition ${currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white border hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="w-8 h-8 flex items-center justify-center">...</span>
                )}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* EDIT STATUS MODAL */}
        {selectedQuery && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">
                Update Status - {selectedQuery.name}
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Message:</p>
                <p className="text-sm text-gray-800">{selectedQuery.message}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
        {viewingQuery && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Query Details</h3>
                <button
                  onClick={() => setViewingQuery(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(viewingQuery.status)}`}>
                  {viewingQuery.status}
                </span>
              </div>

              {/* Rider Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">S.No</label>
                  <p className="text-gray-800 font-medium mt-1">{queries.findIndex(q => q._id === viewingQuery._id) + 1}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Full Name</label>
                  <p className="text-gray-800 font-medium mt-1">{viewingQuery.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Email Address</label>
                  <p className="text-gray-800 font-medium mt-1 break-all">{viewingQuery.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Mobile Number</label>
                  <p className="text-gray-800 font-medium mt-1">{viewingQuery.mobile}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Query ID</label>
                  <p className="text-gray-800 font-medium mt-1 text-sm">{viewingQuery._id}</p>
                </div>
              </div>

              {/* Message Section */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase font-semibold block mb-2">Message / Query</label>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                  <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">{viewingQuery.message}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Date Raised</label>
                  <p className="text-gray-800 mt-1">
                    {new Date(viewingQuery.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {viewingQuery.updatedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Last Updated</label>
                    <p className="text-gray-800 mt-1">
                      {new Date(viewingQuery.updatedAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setViewingQuery(null);
                    handleOpenPopup(viewingQuery);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FiEdit3 size={16} />
                  Edit Status
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this query?")) {
                      handleDelete(viewingQuery._id);
                      setViewingQuery(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <FiTrash2 size={16} />
                  Delete Query
                </button>
                <button
                  onClick={() => setViewingQuery(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderQueriesPage;