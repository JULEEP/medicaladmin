import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiEye, FiDollarSign, FiChevronLeft, FiChevronRight, FiDownload, FiSearch, FiRefreshCw, FiInbox, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function InactivePharmacyList() {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Edit modal state
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    vendorId: "",
    password: "",
    image: "",
    status: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Revenue modal state
  const [revenueModal, setRevenueModal] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});

  const fetchInactivePharmacies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.simcurarx.com/api/admin/getallinactiveorders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch inactive pharmacies");
      setPharmacies(data.pharmacies || []);
      setFilteredPharmacies(data.pharmacies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactivePharmacies();
  }, []);

  // Search filter effect
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPharmacies(pharmacies);
    } else {
      const filtered = pharmacies.filter(pharmacy =>
        pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.vendorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.vendorPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.vendorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, pharmacies]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPharmacies = filteredPharmacies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // CSV Download function
  const downloadCSV = () => {
    const headers = ["Name", "Vendor Name", "Vendor Email", "Vendor Phone", "Vendor ID", "Status", "Address", "Latitude", "Longitude", "Last Updated"];

    const csvData = filteredPharmacies.map(pharmacy => [
      pharmacy.name || "",
      pharmacy.vendorName || "",
      pharmacy.vendorEmail || "",
      pharmacy.vendorPhone || "",
      pharmacy.vendorId || "",
      pharmacy.status || "",
      pharmacy.address || "",
      pharmacy.latitude || "",
      pharmacy.longitude || "",
      new Date(pharmacy.updatedAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inactive_pharmacies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (pharmacy) => {
    setEditingPharmacy(pharmacy);
    setEditForm({
      name: pharmacy.name,
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      vendorName: pharmacy.vendorName || "",
      vendorEmail: pharmacy.vendorEmail || "",
      vendorPhone: pharmacy.vendorPhone || "",
      vendorId: pharmacy.vendorId || "",
      password: pharmacy.password || "",
      image: pharmacy.image || "",
      status: pharmacy.status || ""
    });
    setEditError("");
    setEditMessage("");
  };

  const closeEditModal = () => setEditingPharmacy(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditMessage("");

    try {
      const res = await fetch(
        `https://api.simcurarx.com/api/pharmacy/updatepharmacy/${editingPharmacy._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            latitude: parseFloat(editForm.latitude),
            longitude: parseFloat(editForm.longitude),
            vendorName: editForm.vendorName,
            vendorEmail: editForm.vendorEmail,
            vendorPhone: editForm.vendorPhone,
            vendorId: editForm.vendorId,
            password: editForm.password,
            image: editForm.image,
            status: editForm.status,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setEditMessage("Pharmacy updated successfully!");
      fetchInactivePharmacies();
      setTimeout(() => closeEditModal(), 1500);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pharmacy?")) return;

    try {
      const res = await fetch(`https://api.simcurarx.com/api/pharmacy/deletepharmacy/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      alert("Pharmacy deleted successfully!");
      fetchInactivePharmacies();
      if (currentPharmacies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const openRevenueModal = (pharmacy) => {
    setRevenueModal(pharmacy);
    if (pharmacy.revenueByMonth) {
      const statusObj = {};
      Object.keys(pharmacy.revenueByMonth).forEach(month => {
        statusObj[month] = pharmacy.revenueByMonth[month].status || 'pending';
      });
      setPaymentStatus(statusObj);
    }
  };

  const closeRevenueModal = () => setRevenueModal(null);

  const handlePaymentStatusChange = (month, status) => {
    setPaymentStatus(prev => ({
      ...prev,
      [month]: status
    }));
  };

  const updatePaymentStatus = async (month, status, amount) => {
    try {
      const res = await fetch(`https://api.simcurarx.com/api/pharmacy/updatepayment/${revenueModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          status,
          amount,
        }),
      });

      if (res.ok) {
        handlePaymentStatusChange(month, status);
        fetchInactivePharmacies();
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setSearchTerm("");
    fetchInactivePharmacies();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Inactive Pharmacy Management</h1>
              <span className="text-sm text-gray-500">
                Total: {filteredPharmacies.length} inactive pharmacies
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search inactive pharmacies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* CSV Download */}
              <button
                onClick={downloadCSV}
                disabled={filteredPharmacies.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Download CSV
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Table Structure - Always Show */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S NO</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pharmacy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {error ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
                            <FiAlertCircle className="h-8 w-8 text-red-500" />
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-1">{error}</h3>
                          <p className="text-sm text-gray-500 mb-3">Click below to try again</p>
                        
                        </td>
                      </tr>
                    ) : filteredPharmacies.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                            <FiInbox className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-1">No inactive pharmacies found</h3>
                          <p className="text-sm text-gray-500">
                            {searchTerm ? `No results match "${searchTerm}"` : "All pharmacies are currently active"}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Clear Search
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      currentPharmacies.map((pharmacy, index) => (
                        <tr key={pharmacy._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-lg object-cover border"
                                src={pharmacy.image || "https://via.placeholder.com/40"}
                                alt={pharmacy.name}
                                onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                                <div className="text-xs text-gray-500">ID: {pharmacy.vendorId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">{pharmacy.address}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{pharmacy.vendorName}</div>
                            <div className="text-xs text-gray-500">{pharmacy.vendorEmail}</div>
                            <div className="text-xs text-gray-500">{pharmacy.vendorPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {pharmacy.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {pharmacy.revenueByMonth && Object.keys(pharmacy.revenueByMonth).length > 0 ? (
                              <button
                                onClick={() => openRevenueModal(pharmacy)}
                                className="px-3 py-1 text-sm rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                              >
                                ₹ View Revenue
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(pharmacy.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <FiEye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openEditModal(pharmacy)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(pharmacy._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FiTrash className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPharmacies.length > 0 && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-3 sm:mb-0">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPharmacies.length)} of {filteredPharmacies.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FiChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 border rounded-md ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Pharmacy</h3>
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {editError}
              </div>
            )}
            {editMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                {editMessage}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={editForm.latitude}
                    onChange={handleEditChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={editForm.longitude}
                    onChange={handleEditChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revenue Modal */}
      {revenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Details</h3>
            <p className="text-sm text-gray-600 mb-4">{revenueModal.name}</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {revenueModal?.revenueByMonth && Object.keys(revenueModal.revenueByMonth).length > 0 ? (
                Object.entries(revenueModal.revenueByMonth).map(([month, data]) => (
                  <div key={month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{month}</div>
                      <div className="text-sm text-gray-500">₹{(data.amount || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <select
                      value={data.status || 'pending'}
                      onChange={(e) => updatePaymentStatus(month, e.target.value, data.amount || 0)}
                      className={`text-xs font-medium rounded-md border px-2 py-1 ${getStatusColor(data.status || 'pending')}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No revenue data available</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeRevenueModal}
                className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}