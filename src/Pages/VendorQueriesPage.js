import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3 } from "react-icons/fi";

const VendorQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // ✅ Fetch all vendor queries
  const fetchVendorQueries = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:7021/api/admin/vendorqueries"
      );
      setQueries(res.data.queries || []);
    } catch (error) {
      console.error("Error fetching vendor queries", error);
    }
  };

  useEffect(() => {
    fetchVendorQueries();
  }, []);

  // ✅ Delete a query
  const handleDelete = async (id) => {
    // Show confirmation alert before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this query?");
    
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://31.97.206.144:7021/api/admin/deletequeries/${id}`
        );
        setQueries((prev) => prev.filter((q) => q._id !== id));
        alert("Query deleted successfully!");  // Show success alert
      } catch (error) {
        console.error("Error deleting vendor query", error);
        alert("Failed to delete the query!");  // Show error alert
      }
    }
  };

  // ✅ Open popup
  const handleOpenPopup = (query) => {
    setSelectedQuery(query);
    setNewStatus(query.status);
  };

  // ✅ Update status
  const handleUpdateStatus = async () => {
    try {
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
    } catch (error) {
      console.error("Error updating vendor query status", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-sm font-bold mb-4">All Vendor Queries</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm table-fixed">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-2 border w-1/5">Query Name</th>
              <th className="p-2 border w-1/5">Query Email</th>
              <th className="p-2 border w-1/5">Mobile</th>
              <th className="p-2 border w-1/5">Message</th>
              <th className="p-2 border w-1/5">Status</th>
              <th className="p-2 border w-1/5">Raised At</th>
              <th className="p-2 border w-1/5">Updated At</th>
              <th className="p-2 border text-center w-1/5">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {queries.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-4">
                  No vendor queries found.
                </td>
              </tr>
            ) : (
              queries.map((q) => (
                <tr key={q._id}>
                  <td className="p-2 border">{q.name || "N/A"}</td>
                  <td className="p-2 border">{q.email || "N/A"}</td>
                  <td className="p-2 border">{q.mobile || "N/A"}</td>
                  <td className="p-2 border">{q.message}</td>
                  <td className="p-2 border">{q.status}</td>
                  <td className="p-2 border">
                    {new Date(q.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center justify-center gap-2">
                      <FiEdit3
                        className="text-blue-600 cursor-pointer"
                        onClick={() => handleOpenPopup(q)}
                        title="Edit Status"
                      />
                      <FiTrash2
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleDelete(q._id)}
                        title="Delete Query"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
{selectedQuery && (
  <div className="fixed inset-0 bg-gray-300 bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96 shadow-xl border">
      <h3 className="text-lg font-bold mb-4">
        Update Status - {selectedQuery.name || "Unknown Query"}
      </h3>
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
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

export default VendorQueriesPage;
