import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit } from "react-icons/fi";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingNotification, setEditingNotification] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", body: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Pharmacy status update states
  const [pharmacyStatusModal, setPharmacyStatusModal] = useState(false);
  const [selectedPharmacyNotification, setSelectedPharmacyNotification] = useState(null);
  const [pharmacyStatus, setPharmacyStatus] = useState("Pending");
  const [statusLoading, setStatusLoading] = useState(false);

  const baseURL = "http://31.97.206.144:7021/api/admin";

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${baseURL}/allnotifications`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Delete notification
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      await axios.delete(`${baseURL}/deletenotification/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  // ✅ Open modal for editing notification
  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setEditForm({ title: notification.type, body: notification.message });
  };

  // ✅ Handle form change for notification
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit updated notification
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingNotification?._id) return;

    setIsUpdating(true);

    try {
      await axios.put(`${baseURL}/updatenotifications/${editingNotification._id}`, {
        title: editForm.title,
        body: editForm.body,
      });

      alert("Notification updated successfully!");

      // Refresh data
      fetchNotifications();
      setEditingNotification(null);
    } catch (error) {
      console.error("Error updating notification", error);
      alert("Failed to update notification.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Open pharmacy status modal
  const handlePharmacyStatusEdit = (notification) => {
    if (notification.type === "Pharmacy" && notification.referenceId) {
      setSelectedPharmacyNotification(notification);
      setPharmacyStatus(notification.status || "Pending");
      setPharmacyStatusModal(true);
    }
  };

  // ✅ Update pharmacy status
  const handlePharmacyStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPharmacyNotification?.referenceId) return;

    setStatusLoading(true);

    try {
      const res = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${selectedPharmacyNotification.referenceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: pharmacyStatus,
          }),
        }
      );
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update notification status as well
      await axios.put(`${baseURL}/updatenotifications/${selectedPharmacyNotification._id}`, {
        status: pharmacyStatus,
      });

      // Refresh notifications
      fetchNotifications();
      
      // Close modal
      setPharmacyStatusModal(false);
      setSelectedPharmacyNotification(null);
      
    } catch (err) {
      console.error("Error updating pharmacy status:", err);
      alert("Failed to update pharmacy status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const closePharmacyStatusModal = () => {
    setPharmacyStatusModal(false);
    setSelectedPharmacyNotification(null);
    setPharmacyStatus("Pending");
  };

  // ✅ Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = notifications.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Notifications</h2>

      <div className="overflow-x-auto shadow rounded border">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentItems.length > 0 ? (
              currentItems.map((n) => (
                <tr key={n._id} className="text-center border-t">
                  <td className="p-2 border">{n.type}</td>
                  <td className="p-2 border">{n.message}</td>
                  <td className="p-2 border">
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border flex justify-center gap-4">
                    {/* Edit Icon - for all notifications */}
                    <FiEdit
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      title="Edit"
                      onClick={() => {
                        if (n.type === "Pharmacy" && n.referenceId) {
                          handlePharmacyStatusEdit(n);
                        } else {
                          handleEdit(n);
                        }
                      }}
                    />
                    <FiTrash2
                      className="text-red-600 cursor-pointer hover:text-red-800"
                      title="Delete"
                      onClick={() => handleDelete(n._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan="5">
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination controls */}
      {notifications.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Prev
          </button>

          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ Edit Notification Modal */}
      {editingNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">Update Notification</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Message</label>
                <textarea
                  name="body"
                  value={editForm.body}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotification(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Pharmacy Status Update Modal */}
      {pharmacyStatusModal && selectedPharmacyNotification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold text-green-600 mb-4">Update Pharmacy Status</h3>
            <p className="mb-4 text-gray-600">
              Pharmacy: <strong>{selectedPharmacyNotification.message}</strong>
            </p>
            <form onSubmit={handlePharmacyStatusUpdate}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={pharmacyStatus}
                  onChange={(e) => setPharmacyStatus(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePharmacyStatusModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {statusLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;