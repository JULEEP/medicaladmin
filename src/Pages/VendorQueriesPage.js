import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3, FiSearch } from "react-icons/fi";

const API = "http://31.97.206.144:7021/api/admin";

const VendorQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchVendorQueries = async () => {
    try {
      const res = await axios.get(`${API}/vendorqueries`);
      setQueries(res.data.queries || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorQueries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this query?")) return;
    await axios.delete(`${API}/deletequeries/${id}`);
    setQueries((prev) => prev.filter((q) => q._id !== id));
  };

  const handleOpenPopup = (query) => {
    setSelectedQuery(query);
    setNewStatus(query.status);
  };

  const handleUpdateStatus = async () => {
    const updatedAt = new Date().toISOString();

    await axios.put(`${API}/updatequeries/${selectedQuery._id}`, {
      status: newStatus,
      updatedAt,
    });

    setQueries((prev) =>
      prev.map((q) =>
        q._id === selectedQuery._id
          ? { ...q, status: newStatus, updatedAt }
          : q
      )
    );

    setSelectedQuery(null);
  };

  // SEARCH
  const filtered = queries.filter(
    (q) =>
      q.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.message?.toLowerCase().includes(search.toLowerCase())
  );

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (d) => new Date(d).toLocaleString();

  const statusColor = (status) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          📨 Vendor Queries
        </h2>

        <div className="flex items-center bg-white shadow px-4 py-2 rounded-xl border">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            placeholder="Search queries..."
            className="outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-4">S.No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Mobile</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Raised</th>
              <th className="p-4 text-left">Updated</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center p-10">
                  Loading queries...
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((q, i) => (
                <tr key={q._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{startIndex + i + 1}</td>
                  <td className="p-4">{q.name}</td>
                  <td className="p-4">{q.email}</td>
                  <td className="p-4">{q.mobile}</td>
                  <td className="p-4 max-w-[250px] truncate">{q.message}</td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColor(q.status)}`}>
                      {q.status}
                    </span>
                  </td>

                  <td className="p-4">{formatDate(q.createdAt)}</td>
                  <td className="p-4">{q.updatedAt ? formatDate(q.updatedAt) : "-"}</td>

                  <td className="p-4 text-center space-x-3">
                    <button onClick={() => handleOpenPopup(q)}>
                      <FiEdit3 className="text-blue-600 hover:text-blue-800" />
                    </button>
                    <button onClick={() => handleDelete(q._id)}>
                      <FiTrash2 className="text-red-600 hover:text-red-800" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-10 text-gray-500">
                  No queries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-5">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STATUS MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Update Status - {selectedQuery.name}
            </h3>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorQueriesPage;
