import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash,
  FiEye,
  FiX,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiSettings
} from "react-icons/fi";
import { CSVLink } from "react-csv";
import axios from "axios";

export default function RiderList() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    search: "", 
    city: "", 
    status: "",
    drivingLicenseStatus: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBaseFareModal, setShowBaseFareModal] = useState(false);
  const [baseFare, setBaseFare] = useState("");
  const [baseFareLoading, setBaseFareLoading] = useState(false);
  const [currentBaseFare, setCurrentBaseFare] = useState(0);

  const itemsPerPage = 5;

  // Fetch Riders API
  useEffect(() => {
    fetchRiders();
    fetchCurrentBaseFare();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://31.97.206.144:7021/api/admin/allriders");
      setRiders(res.data.riders || []);
    } catch (err) {
      console.error("Error fetching riders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBaseFare = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/base-fare/current");
      setCurrentBaseFare(res.data.baseFare);
      setBaseFare(res.data.baseFare.toString());
    } catch (err) {
      console.error("Error fetching base fare:", err);
      setCurrentBaseFare(0); // Default fallback
      setBaseFare("0");
    }
  };

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
      const updatedRes = await axios.get("http://31.97.206.144:7021/api/admin/allriders");
      setRiders(updatedRes.data.riders || []);
    } catch (err) {
      console.error("Error updating rider:", err);
      alert("Error updating rider!");
    }
  };

  // Set Base Fare for All Riders
  const handleSetBaseFare = async (e) => {
    e.preventDefault();
    
    if (!baseFare || parseFloat(baseFare) < 0) {
      alert("Please enter a valid base fare amount");
      return;
    }

    setBaseFareLoading(true);
    try {
      const res = await axios.post(
        "http://31.97.206.144:7021/api/admin/base-fare/set-all",
        { baseFare: parseFloat(baseFare) }
      );

      if (res.data.success) {
        alert(res.data.message);
        setShowBaseFareModal(false);
        setCurrentBaseFare(parseFloat(baseFare));
        // Refresh riders to show updated base fares
        await fetchRiders();
      }
    } catch (err) {
      console.error("Error setting base fare:", err);
      alert(err.response?.data?.message || "Error setting base fare");
    } finally {
      setBaseFareLoading(false);
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
    
    const statusMatch = filters.status === "" || 
      rider.status?.toLowerCase() === filters.status.toLowerCase();
    
    const drivingLicenseStatusMatch = filters.drivingLicenseStatus === "" || 
      rider.drivingLicenseStatus?.toLowerCase() === filters.drivingLicenseStatus.toLowerCase();
    
    return searchMatch && cityMatch && statusMatch && drivingLicenseStatusMatch;
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
      { label: "Base Fare (₹)", key: "baseFare" },
      { label: "Status", key: "status" },
      { label: "Driving License Status", key: "drivingLicenseStatus" },
    ],
    data: filteredRiders,
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ search: "", city: "", status: "", drivingLicenseStatus: "" });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online": return "bg-green-100 text-green-700";
      case "busy": return "bg-yellow-100 text-yellow-700";
      case "offline": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get driving license status badge color
  const getDrivingLicenseStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ✅ Header with Search & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone or city..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded pl-10 pr-3 py-2 w-full"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Base Fare Button */}
          <button
            onClick={() => setShowBaseFareModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            <FiDollarSign /> Base Fare
          </button>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            <FiFilter /> Filters
          </button>

          {/* Export Button */}
          <CSVLink
            {...csvData}
            filename="riders_list.csv"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Current Base Fare Display */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSettings className="text-blue-600" />
            <span className="text-blue-800 font-medium">
              Current Base Fare: <strong>₹{currentBaseFare}</strong>
            </span>
          </div>
          <span className="text-sm text-blue-600">
            Applied to {riders.length} riders
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded mb-4 border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Advanced Filters</h3>
            <button 
              onClick={resetFilters}
              className="text-blue-600 text-sm hover:underline"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1 text-sm">City</label>
              <input
                type="text"
                placeholder="Filter by city..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Driving License Status</label>
              <select
                value={filters.drivingLicenseStatus}
                onChange={(e) => setFilters({ ...filters, drivingLicenseStatus: e.target.value })}
                className="border rounded px-3 py-2 w-full"
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

      {/* Results Count */}
      <div className="mb-2 text-sm text-gray-600">
        Showing {currentItems.length} of {filteredRiders.length} riders
        {(filters.search || filters.city || filters.status || filters.drivingLicenseStatus) && 
          ` (filtered from ${riders.length} total riders)`}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-4">Loading riders...</p>
      ) : (
        <div className="overflow-x-auto rounded border shadow bg-white">
          <table className="w-full table-auto">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Password</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">Base Fare (₹)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">License Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((rider, index) => (
                  <tr
                    key={rider._id}
                    className="border-b hover:bg-gray-50 align-top"
                  >
                    <td className="p-3">{indexOfFirst + index + 1}</td>
                    <td className="p-3">
                      {rider.profileImage ? (
                        <img
                          src={rider.profileImage}
                          alt={rider.name}
                          className="w-12 h-12 rounded-full object-cover border"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : null}
                    </td>
                    <td className="p-3 font-semibold">{rider.name}</td>
                    <td className="p-3">{rider.email}</td>
                    <td className="p-3">{rider.password}</td>
                    <td className="p-3">{rider.phone}</td>
                    <td className="p-3">{rider.city}</td>
                    <td className="p-3">
                      <span className="font-semibold text-green-700">
                        ₹{rider.baseFare || currentBaseFare}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeColor(rider.status)}`}
                      >
                        {rider.status || "N/A"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getDrivingLicenseStatusBadgeColor(rider.drivingLicenseStatus)}`}
                      >
                        {rider.drivingLicenseStatus || "Null"}
                      </span>
                    </td>
                    <td className="p-3 flex space-x-3 text-lg">
                      <FiEye
                        className="text-green-500 cursor-pointer hover:text-green-600"
                        title="View"
                        onClick={() => {
                          setSelectedRider(rider);
                          setIsViewModal(true);
                        }}
                      />
                      <FiEdit
                        className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                        title="Edit"
                        onClick={() => {
                          setSelectedRider(rider);
                          setIsEditModal(true);
                        }}
                      />
                      <FiTrash
                        className="text-red-500 cursor-pointer hover:text-red-600"
                        title="Delete"
                        onClick={() => handleDelete(rider._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center p-4 text-gray-500 font-medium"
                  >
                    No riders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredRiders.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Base Fare Modal */}
      {showBaseFareModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setShowBaseFareModal(false)}
            >
              <FiX size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold">Set Base Fare</h2>
              <p className="text-sm text-gray-600 mt-1">
                This will update base fare for all {riders.length} riders
              </p>
            </div>

            <form onSubmit={handleSetBaseFare}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Base Fare Amount (₹)
                </label>
                <input
                  type="number"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter base fare amount"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current base fare: <strong>₹{currentBaseFare}</strong>
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This action will update the base fare for <strong>all {riders.length} riders</strong> in the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBaseFareModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={baseFareLoading}
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {baseFareLoading ? "Updating..." : `Update All Riders`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rider View Modal */}
      {isViewModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setIsViewModal(false)}
            >
              <FiX size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <img
                src={selectedRider.profileImage || "/default-avatar.png"}
                alt={selectedRider.name}
                className="w-24 h-24 rounded-full mx-auto border shadow"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <h2 className="text-xl font-bold mt-2">{selectedRider.name}</h2>
              <p className="text-sm text-gray-500">Rider ID: {selectedRider._id}</p>
            </div>

            {/* Personal Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">📌 Personal Info</h3>
              <p><strong>Email:</strong> {selectedRider.email}</p>
              <p><strong>Phone:</strong> {selectedRider.phone}</p>
              <p><strong>Base Fare:</strong> ₹{selectedRider.baseFare || currentBaseFare}</p>
              {selectedRider.latitude && selectedRider.longitude && (
                <p><strong>Coordinates:</strong> {selectedRider.latitude}, {selectedRider.longitude}</p>
              )}
            </div>

            {/* Ride Details */}
            {selectedRider.rideImages?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">🏍️ Ride Images</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedRider.rideImages.map((img, i) => (
                    <img key={i} src={img} alt={`Ride-${i}`} className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}

         {/* Driving License */}
{selectedRider.drivingLicense && (
  <div className="mb-4">
    <h3 className="text-lg font-semibold border-b pb-1 mb-2">🚗 Driving License</h3>

    {/* Driving License Status */}
    <p>
      <strong>Status:</strong>{" "}
      <span
        className={`inline-block px-2 py-1 text-xs rounded font-medium ${
          selectedRider.drivingLicenseStatus === "Approved"
            ? "bg-green-100 text-green-700"
            : selectedRider.drivingLicenseStatus === "Rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {selectedRider.drivingLicenseStatus || "N/A"}
      </span>
    </p>

    {/* License Display */}
    {selectedRider.drivingLicense.endsWith(".pdf") ? (
      <a
        href={selectedRider.drivingLicense}
        download
        className="text-blue-600 underline hover:text-blue-800 mt-2 inline-block"
      >
        Download Driving License (PDF)
      </a>
    ) : (
      <img
        src={selectedRider.drivingLicense}
        alt="Driving License"
        className="w-40 h-auto mt-2 cursor-pointer rounded border"
        onClick={() => window.open(selectedRider.drivingLicense, "_blank")}
      />
    )}
  </div>
)}


            {/* Bank Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">🏦 Bank Details</h3>
              {selectedRider.accountDetails?.length > 0 ? (
                selectedRider.accountDetails.map((account, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded mb-2 border">
                    <p><strong>Account Holder:</strong> {account.accountHolderName}</p>
                    <p><strong>Account Number:</strong> {account.accountNumber}</p>
                    <p><strong>IFSC:</strong> {account.ifscCode}</p>
                    <p><strong>Bank Name:</strong> {account.bankName}</p>
                    <p><strong>UPI ID:</strong> {account.upiId || "N/A"}</p>
                    <p><strong>Added At:</strong> {new Date(account.addedAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No bank details added</p>
              )}
            </div>

            {/* Wallet & Orders Stats */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">📊 Wallet & Order Stats</h3>
              <p><strong>Wallet Balance:</strong> ₹{selectedRider.wallet || 0}</p>
              <p><strong>Total Orders Assigned:</strong> {selectedRider.totalOrdersAssigned || 0}</p>
              <p><strong>Total Orders Completed:</strong> {selectedRider.totalOrdersCompleted || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setIsEditModal(false)}
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Edit Rider</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={selectedRider.name || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={selectedRider.email || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, email: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider email"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  value={selectedRider.phone || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, phone: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider phone"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block mb-1 font-medium">City</label>
                <input
                  type="text"
                  value={selectedRider.city || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, city: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider city"
                />
              </div>

              {/* Base Fare */}
              <div>
                <label className="block mb-1 font-medium">Base Fare (₹)</label>
                <input
                  type="number"
                  value={selectedRider.baseFare || currentBaseFare}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, baseFare: parseFloat(e.target.value) })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Enter base fare"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={selectedRider.status || ""}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, status: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Driving License Status */}
              <div>
                <label className="block mb-1 font-medium">Driving License Status</label>
                <select
                  value={selectedRider.drivingLicenseStatus || "null"}
                  onChange={(e) =>
                    setSelectedRider({ ...selectedRider, drivingLicenseStatus: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Submit button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
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