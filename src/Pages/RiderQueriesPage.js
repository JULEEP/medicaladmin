import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3 } from "react-icons/fi";

const RiderQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-white">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🚴 Rider Queries</h1>
        <p className="text-gray-500">Manage and respond to rider support queries</p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white/80 backdrop-blur-xl border rounded-3xl shadow-xl overflow-x-auto">

        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Mobile</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4">Raised</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentQueries.map((q, i) => (
              <tr key={q._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-semibold">{startIndex + i + 1}</td>
                <td className="p-4">{q.name}</td>
                <td className="p-4">{q.email}</td>
                <td className="p-4">{q.mobile}</td>
                <td className="p-4 max-w-[250px] truncate">{q.message}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${badgeColor(q.status)}`}>
                    {q.status}
                  </span>
                </td>

                <td className="p-4">{new Date(q.createdAt).toLocaleDateString()}</td>
                <td className="p-4">{q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : "-"}</td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleOpenPopup(q)}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PREMIUM PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-6 border-t">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderQueriesPage;
