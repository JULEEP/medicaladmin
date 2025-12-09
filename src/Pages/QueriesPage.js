import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3 } from "react-icons/fi";

const QueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // ✅ Fetch all queries
  const fetchQueries = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/allqueries");
      
      // Filter out queries that have a riderId or vendorId
      const filteredQueries = res.data.filter(query => !query.riderId && !query.vendorId);

      setQueries(filteredQueries);
    } catch (error) {
      console.error("Error fetching queries", error);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // ✅ Delete query
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://31.97.206.144:7021/api/admin/deletequeries/${id}`);
      setQueries(queries.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Error deleting query", error);
    }
  };

  // ✅ Open popup to update status
  const handleOpenPopup = (query) => {
    setSelectedQuery(query);
    setNewStatus(query.status);
  };

  // ✅ Update query status
  const handleUpdateStatus = async () => {
    try {
      const updatedAt = new Date().toISOString(); // current date & time
      await axios.put(
        `http://31.97.206.144:7021/api/admin/updatequeries/${selectedQuery._id}`,
        { status: newStatus, updatedAt } // send updatedAt to backend
      );

      setQueries(
        queries.map((q) =>
          q._id === selectedQuery._id
            ? { ...q, status: newStatus, updatedAt } // update in frontend
            : q
        )
      );

      setSelectedQuery(null);
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Queries</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Message</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Raised At</th>
            <th className="p-2 border">Updated At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {queries.map((q) => (
            <tr key={q._id} className="text-center">
              <td className="p-2 border">{q.name}</td>
              <td className="p-2 border">{q.email}</td>
              <td className="p-2 border">{q.mobile}</td>
              <td className="p-2 border">{q.message}</td>
              <td className="p-2 border">{q.status}</td>
              <td className="p-2 border">
                {new Date(q.createdAt).toLocaleString()}
              </td>
              <td className="p-2 border">
                {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-"}
              </td>
              <td className="p-2 border flex justify-center gap-3">
                <FiEdit3
                  className="text-blue-600 cursor-pointer"
                  onClick={() => handleOpenPopup(q)}
                />
                <FiTrash2
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDelete(q._id)}
                />
              </td>
            </tr>
          ))}

          {queries.length === 0 && (
            <tr>
              <td className="p-2 border text-center" colSpan="8">
                No queries found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Popup */}
      {selectedQuery && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl border pointer-events-auto">
            <h3 className="text-lg font-bold mb-4">
              Update Status - {selectedQuery.name}
            </h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setSelectedQuery(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleUpdateStatus}
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

export default QueriesPage;
