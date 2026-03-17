import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit, FiCheckSquare, FiSquare } from "react-icons/fi";

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

  // Selection states
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Use localhost URL
  const baseURL = "http://31.97.206.144:7021/api/admin";

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications...");
      const res = await axios.get(`${baseURL}/allnotifications`);
      console.log("Fetched notifications:", res.data);
      setNotifications(res.data);
      // Reset selection on new fetch
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      console.log("Deselecting all notifications");
      setSelectedNotifications([]);
    } else {
      const currentPageIds = currentItems.map(item => item._id);
      console.log("Selecting all notifications:", currentPageIds);
      setSelectedNotifications(currentPageIds);
    }
    setSelectAll(!selectAll);
  };

  // ✅ Handle single select
  const handleSelectNotification = (id) => {
    console.log("Toggling selection for notification:", id);
    let newSelected = [...selectedNotifications];
    
    if (newSelected.includes(id)) {
      newSelected = newSelected.filter(notifId => notifId !== id);
      console.log("Removed from selection. Current:", newSelected);
    } else {
      newSelected.push(id);
      console.log("Added to selection. Current:", newSelected);
    }
    
    setSelectedNotifications(newSelected);
    
    // Check if all current page items are selected
    const currentPageIds = currentItems.map(item => item._id);
    const allSelected = currentPageIds.every(id => newSelected.includes(id));
    setSelectAll(allSelected);
  };

  // ✅ Delete single notification
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      console.log("Deleting single notification:", id);
      const response = await axios.delete(`${baseURL}/deletenotification/${id}`);
      
      console.log("Delete response:", response.data);
      
      if (response.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setSelectedNotifications(prev => prev.filter(notifId => notifId !== id));
        alert("Notification deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to delete notification");
    }
  };

  // ✅ Bulk delete notifications
  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      alert("Please select at least one notification to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      return;
    }

    setBulkDeleteLoading(true);

    try {
      console.log("Bulk deleting notifications. Selected IDs:", selectedNotifications);
      console.log("Sending to URL:", `${baseURL}/deletenotifications`);
      console.log("Request body:", { notificationIds: selectedNotifications });

      const response = await axios({
        method: 'delete',
        url: `${baseURL}/deletenotifications`,
        data: { notificationIds: selectedNotifications },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Bulk delete response:", response.data);
      console.log("Response status:", response.status);
      
      if (response.data.success) {
        // Remove deleted notifications from state
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
        setSelectedNotifications([]);
        setSelectAll(false);
        
        alert(response.data.message || `Successfully deleted ${selectedNotifications.length} notification(s)!`);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      
      // Detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        alert(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        alert("No response from server. Please check if server is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        alert("Error: " + error.message);
      }
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ✅ Open modal for editing notification
  const handleEdit = (notification) => {
    console.log("Editing notification:", notification);
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
      console.log("Updating notification:", editingNotification._id, editForm);
      const response = await axios.put(`${baseURL}/updatenotifications/${editingNotification._id}`, {
        title: editForm.title,
        body: editForm.body,
      });

      console.log("Update response:", response.data);
      
      if (response.data.success) {
        alert("Notification updated successfully!");
        // Refresh data
        fetchNotifications();
        setEditingNotification(null);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to update notification.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Open pharmacy status modal
  const handlePharmacyStatusEdit = (notification) => {
    console.log("Editing pharmacy status for:", notification);
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
      console.log("Updating pharmacy status:", selectedPharmacyNotification.referenceId, pharmacyStatus);
      
      // Update pharmacy status
      const pharmacyRes = await axios.put(
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${selectedPharmacyNotification.referenceId}`,
        { status: pharmacyStatus }
      );

      console.log("Pharmacy update response:", pharmacyRes.data);

      if (pharmacyRes.data.success) {
        // Update notification status as well
        await axios.put(`${baseURL}/updatenotifications/${selectedPharmacyNotification._id}`, {
          status: pharmacyStatus,
        });

        // Refresh notifications
        fetchNotifications();
        
        // Close modal
        setPharmacyStatusModal(false);
        setSelectedPharmacyNotification(null);
        alert("Pharmacy status updated successfully!");
      }
    } catch (err) {
      console.error("Error updating pharmacy status:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.message || "Failed to update pharmacy status.");
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
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setSelectAll(false);
      setSelectedNotifications([]);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setSelectAll(false);
      setSelectedNotifications([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Notifications</h2>
        
        {/* Bulk Delete Button */}
        {selectedNotifications.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            <FiTrash2 />
            <span>{bulkDeleteLoading ? "Deleting..." : `Delete Selected (${selectedNotifications.length})`}</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto shadow rounded border">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 border w-10">
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-700 hover:text-blue-600 focus:outline-none"
                    title={selectAll ? "Deselect All" : "Select All"}
                  >
                    {selectAll ? (
                      <FiCheckSquare className="text-xl" />
                    ) : (
                      <FiSquare className="text-xl" />
                    )}
                  </button>
                </div>
              </th>
              <th className="p-2 border">S NO</th> 
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentItems.length > 0 ? (
              currentItems.map((n, index) => (
                <tr key={n._id} className="text-center border-t hover:bg-gray-50">
                  <td className="p-2 border w-10">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleSelectNotification(n._id)}
                        className="text-gray-700 hover:text-blue-600 focus:outline-none"
                      >
                        {selectedNotifications.includes(n._id) ? (
                          <FiCheckSquare className="text-xl text-blue-600" />
                        ) : (
                          <FiSquare className="text-xl" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-2 border">{(currentPage - 1)*itemsPerPage + index +1}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${n.type === 'Pharmacy' ? 'bg-purple-100 text-purple-800' : 
                        n.type === 'Order' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="p-2 border max-w-md truncate">{n.message}</td>
                  <td className="p-2 border">
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-4">
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan="6">
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Count Display */}
      {selectedNotifications.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedNotifications.length} notification(s) selected
        </div>
      )}

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