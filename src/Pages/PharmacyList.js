import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiEye, FiDollarSign, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiDownload, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function PharmacyList() {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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
  const [selectedStatuses, setSelectedStatuses] = React.useState({});

  const fetchPharmacies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://31.97.206.144:7021/api/pharmacy/getallpjarmacy");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setPharmacies(data.pharmacies || []);
      setFilteredPharmacies(data.pharmacies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
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
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, pharmacies]);

  useEffect(() => {
    if (revenueModal?.revenueByMonth) {
      const initialStatuses = {};
      Object.entries(revenueModal.revenueByMonth).forEach(([month, data]) => {
        initialStatuses[month] = data.status || 'pending';
      });
      setSelectedStatuses(initialStatuses);
    }
  }, [revenueModal]);

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
    link.setAttribute("download", `pharmacies_${new Date().toISOString().split('T')[0]}.csv`);
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
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${editingPharmacy._id}`,
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
      fetchPharmacies();
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
      const res = await fetch(`http://31.97.206.144:7021/api/pharmacy/deletepharmacy/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      alert("Pharmacy deleted successfully!");
      fetchPharmacies();
      // Reset to first page if current page becomes empty
      if (currentPharmacies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const openRevenueModal = (pharmacy) => {
    setRevenueModal(pharmacy);
    // Initialize payment status
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
    const res = await fetch(`http://31.97.206.144:7021/api/pharmacy/updatepayment/${revenueModal._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        status,
        amount,  // send amount here
      }),
    });

    if (res.ok) {
      // Handle successful status change
      handlePaymentStatusChange(month, status);
      
      // Refetch pharmacies data if needed
      fetchPharmacies();

      // Close the revenue modal after successful update
      closeRevenueModal();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Truncate long text for display
  const truncateText = (text, maxLength = 25) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header with Search and Download */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Pharmacy Management</h1>
                <span className="text-blue-100 text-sm">
                  Total: {filteredPharmacies.length} pharmacies
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search Filter */}
                <div className="relative flex-1 sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search pharmacies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                  />
                </div>

                {/* CSV Download */}
                <button
                  onClick={downloadCSV}
                  disabled={filteredPharmacies.length === 0}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="mx-5 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Pharmacy
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Updated
                        </th>
                        <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentPharmacies.map((pharmacy) => (
                        <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* Pharmacy Column */}
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img
                                  className="h-8 w-8 rounded-lg object-cover border border-gray-300"
                                  src={pharmacy.image || "https://via.placeholder.com/32"}
                                  alt={pharmacy.name}
                                  onError={(e) => (e.target.src = "https://via.placeholder.com/32")}
                                />
                              </div>
                              <div className="ml-3 min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 truncate" title={pharmacy.name}>
                                  {truncateText(pharmacy.name, 20)}
                                </div>
                                <div className="text-xs text-gray-500 truncate" title={`ID: ${pharmacy.vendorId}`}>
                                  ID: {truncateText(pharmacy.vendorId, 12)}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Location Column */}
                          <td className="px-3 py-3">
                            <div 
                              className="text-xs text-gray-600 break-words max-w-[120px] cursor-help" 
                              title={pharmacy.address}
                            >
                              {truncateText(pharmacy.address, 30)}
                            </div>
                          </td>
                          
                          {/* Vendor Column */}
                          <td className="px-3 py-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate" title={pharmacy.vendorName}>
                                {truncateText(pharmacy.vendorName, 15)}
                              </div>
                              <div className="text-xs text-gray-500 truncate" title={pharmacy.vendorEmail}>
                                {truncateText(pharmacy.vendorEmail, 20)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              pharmacy.status === "Active" 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : pharmacy.status === "Suspended" 
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}>
                              {pharmacy.status}
                            </span>
                          </td>
                          
                          {/* Revenue Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            {pharmacy.revenueByMonth ? (
                              <button
                                onClick={() => openRevenueModal(pharmacy)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                              >
                                <FiDollarSign className="mr-1 h-3 w-3" />
                                Revenue
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>

                          {/* Last Updated Column */}
                          <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                            {new Date(pharmacy.updatedAt).toLocaleDateString('en-IN')}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => navigate(`/pharmacy/${pharmacy._id}`)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-110"
                                title="View Details"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(pharmacy)}
                                className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-110"
                                title="Edit Pharmacy"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pharmacy._id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                title="Delete Pharmacy"
                              >
                                <FiTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                      <span className="font-semibold">
                        {Math.min(indexOfLastItem, filteredPharmacies.length)}
                      </span>{" "}
                      of <span className="font-semibold">{filteredPharmacies.length}</span> results
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <FiChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors duration-200 ${
                            currentPage === page
                              ? "z-10 bg-blue-600 border-blue-600 text-white shadow-md"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10 relative border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Pharmacy</h3>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-700">{editError}</div>
              </div>
            )}

            {editMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700">{editMessage}</div>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="Select">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={editForm.latitude}
                    onChange={handleEditChange}
                    required
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     {revenueModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10 relative border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Revenue Details - {revenueModal.name}
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {revenueModal?.revenueByMonth &&
        Object.keys(revenueModal.revenueByMonth).length > 0 ? (
          Object.entries(revenueModal.revenueByMonth).map(([month, data]) => {
            const selectedStatus = data.status || 'pending';
            const amountToShow = selectedStatus === 'paid' ? 0 : (data.amount || 0);

            return (
              <div
                key={month}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{month}</div>
                  <div className="text-xs text-gray-600 font-medium">
                    ₹{amountToShow.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      if (selectedStatus === 'paid' && e.target.value === 'paid') {
                        alert(`Payment for ${month} is already marked as 'paid'. No further updates allowed for this month.`);
                        return;
                      }
                      updatePaymentStatus(month, e.target.value, data.amount || 0);
                    }}
                    className={`text-xs font-medium rounded-lg border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      getStatusColor(selectedStatus)
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>

                  <button
                    onClick={() => {
                      if (selectedStatus === 'paid') {
                        alert(`Payment for ${month} is already marked as 'paid'. No further updates allowed for this month.`);
                        return;
                      }
                      updatePaymentStatus(month, selectedStatus, data.amount || 0);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No revenue data available
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => closeRevenueModal()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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