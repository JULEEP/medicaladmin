import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash,
  FiEye,
  FiX,
  FiSearch,
  FiFilter,
  FiWifi,
  FiUserCheck
} from "react-icons/fi";
import { CSVLink } from "react-csv";
import axios from "axios";

export default function OnlineRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    search: "", 
    city: "", 
    drivingLicenseStatus: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 5;

  // Fetch Online Riders API
  useEffect(() => {
    const fetchOnlineRiders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://31.97.206.144:7021/api/admin/onlineriders");
        setRiders(res.data.riders || []);
      } catch (err) {
        console.error("Error fetching online riders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOnlineRiders();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rider?")) {
      try {
        const res = await axios.delete(
          `http://31.97.206.144:7021/api/admin/delete-rider/${id}`
        );
        console.log("Delete Success:", res.data);
        setRiders((prev) => prev.filter((r) => r._id !== id));
      } catch (err) {
        console.error("Error deleting rider:", err);
        alert("Error deleting rider!");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://31.97.206.144:7021/api/admin/update-rider/${selectedRider._id}`,
        selectedRider
      );
      console.log("Update Success:", res.data);
      alert("Rider updated successfully!");
      setIsEditModal(false);
      // Refresh the list after update
      const updatedRes = await axios.get("http://31.97.206.144:7021/api/admin/onlineriders");
      setRiders(updatedRes.data.riders || []);
    } catch (err) {
      console.error("Error updating rider:", err);
      alert("Error updating rider!");
    }
  };

  // Filtering function
  const filteredRiders = riders.filter((rider) => {
    const searchMatch = filters.search === "" || 
      (rider.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
       rider.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
       rider.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
       rider.city?.toLowerCase().includes(filters.search.toLowerCase()));
    
    const cityMatch = filters.city === "" || 
      rider.city?.toLowerCase().includes(filters.city.toLowerCase());
    
    const drivingLicenseStatusMatch = filters.drivingLicenseStatus === "" || 
      rider.drivingLicenseStatus?.toLowerCase() === filters.drivingLicenseStatus.toLowerCase();
    
    return searchMatch && cityMatch && drivingLicenseStatusMatch;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredRiders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);

  const csvData = {
    headers: [
      { label: "Rider ID", key: "_id" },
      { label: "Name", key: "name" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "City", key: "city" },
      { label: "Status", key: "status" },
      { label: "Delivery Charge", key: "deliveryCharge" },
      { label: "Driving License Status", key: "drivingLicenseStatus" },
      { label: "Total Orders Assigned", key: "totalOrdersAssigned" },
      { label: "Total Orders Completed", key: "totalOrdersCompleted" },
      { label: "Wallet Balance", key: "wallet" },
    ],
    data: filteredRiders,
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ search: "", city: "", drivingLicenseStatus: "" });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online": return "bg-green-100 text-green-700 border border-green-300";
      case "busy": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "offline": return "bg-red-100 text-red-700 border border-red-300";
      default: return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  // Get driving license status badge color
  const getDrivingLicenseStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-700 border border-green-300";
      case "rejected": return "bg-red-100 text-red-700 border border-red-300";
      case "pending": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  // Calculate completion rate
  const getCompletionRate = (assigned, completed) => {
    if (!assigned || assigned === 0) return "0%";
    return `${Math.round((completed / assigned) * 100)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ✅ Header with Stats & Actions */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiWifi className="animate-pulse" />
              Online Riders
            </h1>
            <p className="text-green-100 mt-1">
              Active riders currently available for deliveries
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
            <div className="text-center">
              <div className="text-2xl font-bold">{riders.length}</div>
              <div className="text-green-100 text-sm">Active Riders</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Search & Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search online riders by name, email, phone or city..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
          >
            <FiFilter /> Filters
          </button>

          {/* Export Button */}
          <CSVLink
            {...csvData}
            filename="online_riders.csv"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* ✅ Advanced Filters */}
      {showFilters && (
        <div className="bg-green-50 p-4 rounded mb-4 border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-green-800 flex items-center gap-2">
              <FiFilter /> Advanced Filters
            </h3>
            <button 
              onClick={resetFilters}
              className="text-green-600 text-sm hover:underline font-medium"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm text-green-700">City</label>
              <input
                type="text"
                placeholder="Filter by city..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="border border-green-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm text-green-700">Driving License Status</label>
              <select
                value={filters.drivingLicenseStatus}
                onChange={(e) => setFilters({ ...filters, drivingLicenseStatus: e.target.value })}
                className="border border-green-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All License Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Results Count */}
      <div className="mb-2 text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-200">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Showing <strong>{currentItems.length}</strong> of <strong>{filteredRiders.length}</strong> online riders
          </span>
          {(filters.search || filters.city || filters.drivingLicenseStatus) && (
            <span className="text-green-600">
              (filtered from <strong>{riders.length}</strong> total online riders)
            </span>
          )}
        </div>
      </div>

      {/* ✅ Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-green-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            Loading online riders...
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-green-200 shadow bg-white">
          <table className="w-full table-auto">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Rider Details</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">Delivery Charge</th>
                <th className="p-3 text-left">Order Stats</th>
                <th className="p-3 text-left">Wallet</th>
                <th className="p-3 text-left">License Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((rider, index) => (
                  <tr
                    key={rider._id}
                    className="border-b hover:bg-green-50 transition-colors"
                  >
                    <td className="p-3 font-medium text-gray-600">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="p-3">
                      {rider.profileImage ? (
                        <img
                          src={rider.profileImage}
                          alt={rider.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-300 shadow-sm"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                          <FiUserCheck className="text-green-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{rider.name}</div>
                      <div className="text-sm text-gray-600">{rider.email}</div>
                      <div className="text-sm text-gray-600">{rider.phone}</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(rider.status)}`}>
                          <FiWifi className="inline mr-1" size={10} />
                          {rider.status || "Online"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{rider.city || "N/A"}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-green-700">₹{rider.deliveryCharge || 0}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Assigned:</span>
                          <span className="font-semibold">{rider.totalOrdersAssigned || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-semibold text-green-600">{rider.totalOrdersCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-semibold text-blue-600">
                            {getCompletionRate(rider.totalOrdersAssigned, rider.totalOrdersCompleted)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-purple-700">₹{rider.wallet || 0}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDrivingLicenseStatusBadgeColor(rider.drivingLicenseStatus)}`}
                      >
                        {rider.drivingLicenseStatus || "Null"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-3 text-lg">
                        <FiEye
                          className="text-green-500 cursor-pointer hover:text-green-600 transition-colors"
                          title="View Details"
                          onClick={() => {
                            setSelectedRider(rider);
                            setIsViewModal(true);
                          }}
                        />
                        <FiEdit
                          className="text-yellow-500 cursor-pointer hover:text-yellow-600 transition-colors"
                          title="Edit Rider"
                          onClick={() => {
                            setSelectedRider(rider);
                            setIsEditModal(true);
                          }}
                        />
                        <FiTrash
                          className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                          title="Delete Rider"
                          onClick={() => handleDelete(rider._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center p-8 text-gray-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FiWifi className="text-gray-400 text-3xl" />
                      <div>No online riders match your filters.</div>
                      {filters.search || filters.city || filters.drivingLicenseStatus ? (
                        <button
                          onClick={resetFilters}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Clear filters to see all online riders
                        </button>
                      ) : (
                        <div className="text-sm text-gray-400">All riders are currently offline</div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Pagination */}
      {filteredRiders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-600">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded border transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-green-600 border-green-300 hover:bg-green-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded border transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-green-600 border-green-300 hover:bg-green-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ✅ Rider View Modal */}
      {isViewModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition-colors"
              onClick={() => setIsViewModal(false)}
            >
              <FiX size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <img
                src={selectedRider.profileImage || "/default-avatar.png"}
                alt={selectedRider.name}
                className="w-24 h-24 rounded-full mx-auto border-2 border-green-300 shadow"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <h2 className="text-xl font-bold mt-2 text-gray-800">{selectedRider.name}</h2>
              <p className="text-sm text-gray-500">Rider ID: {selectedRider._id}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedRider.status)}`}>
                  <FiWifi className="inline mr-1" />
                  {selectedRider.status || "Online"}
                </span>
              </div>
            </div>

            {/* Personal Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800 flex items-center gap-2">
                📌 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><strong>Email:</strong> {selectedRider.email}</div>
                <div><strong>Phone:</strong> {selectedRider.phone}</div>
                <div><strong>Address:</strong> {selectedRider.address || "N/A"}</div>
                <div><strong>City:</strong> {selectedRider.city || "N/A"}</div>
                <div><strong>State:</strong> {selectedRider.state || "N/A"}</div>
                <div><strong>Pin Code:</strong> {selectedRider.pinCode || "N/A"}</div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800 flex items-center gap-2">
                📊 Order Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{selectedRider.totalOrdersAssigned || 0}</div>
                  <div className="text-sm text-blue-600">Total Assigned</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{selectedRider.totalOrdersCompleted || 0}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">₹{selectedRider.wallet || 0}</div>
                  <div className="text-sm text-purple-600">Wallet Balance</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">₹{selectedRider.deliveryCharge || 0}</div>
                  <div className="text-sm text-orange-600">Delivery Charge</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-600">
                  Completion Rate: <strong>{getCompletionRate(selectedRider.totalOrdersAssigned, selectedRider.totalOrdersCompleted)}</strong>
                </span>
              </div>
            </div>

            {/* Ride Images */}
            {selectedRider.rideImages?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800 flex items-center gap-2">
                  🏍️ Ride Images
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedRider.rideImages.map((img, i) => (
                    <img key={i} src={img} alt={`Ride-${i}`} className="w-20 h-20 object-cover rounded border shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                  ))}
                </div>
              </div>
            )}

            {/* Driving License */}
            {selectedRider.drivingLicense && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800 flex items-center gap-2">
                  🚗 Driving License
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDrivingLicenseStatusBadgeColor(selectedRider.drivingLicenseStatus)}`}>
                    {selectedRider.drivingLicenseStatus || "Null"}
                  </span>
                  {selectedRider.drivingLicense.endsWith('.pdf') ? (
                    <a
                      href={selectedRider.drivingLicense}
                      download
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                    >
                      Download Driving License (PDF)
                    </a>
                  ) : (
                    <img
                      src={selectedRider.drivingLicense}
                      alt="Driving License"
                      className="w-32 h-auto cursor-pointer rounded border shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => window.open(selectedRider.drivingLicense, '_blank')}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-800 flex items-center gap-2">
                🏦 Bank Details
              </h3>
              {selectedRider.accountDetails?.length > 0 ? (
                selectedRider.accountDetails.map((account, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p><strong>Account Holder:</strong> {account.accountHolderName}</p>
                      <p><strong>Account Number:</strong> {account.accountNumber}</p>
                      <p><strong>IFSC:</strong> {account.ifscCode}</p>
                      <p><strong>Bank Name:</strong> {account.bankName}</p>
                      <p><strong>UPI ID:</strong> {account.upiId || "N/A"}</p>
                      <p><strong>Added At:</strong> {new Date(account.addedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No bank details added</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {isEditModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition-colors"
              onClick={() => setIsEditModal(false)}
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <FiEdit />
              Edit Online Rider
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={selectedRider.name || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, name: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rider name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={selectedRider.email || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, email: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rider email"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={selectedRider.phone || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, phone: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rider phone"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={selectedRider.city || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, city: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rider city"
                />
              </div>

              {/* Delivery Charge */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Delivery Charge</label>
                <input
                  type="number"
                  value={selectedRider.deliveryCharge || 0}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, deliveryCharge: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter delivery charge"
                  min={0}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Status</label>
                <select
                  value={selectedRider.status || "online"}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, status: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Driving License Status */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Driving License Status</label>
                <select
                  value={selectedRider.drivingLicenseStatus || "Pending"}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, drivingLicenseStatus: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Submit button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FiEdit />
                  Update Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}