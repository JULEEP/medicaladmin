import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash,
  FiEye,
  FiX,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiSettings,
  FiMapPin,
  FiTrendingUp,
  FiTruck,
  FiCheckCircle,
  FiClock
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
  const [baseDistanceKm, setBaseDistanceKm] = useState("");
  const [additionalChargePerKm, setAdditionalChargePerKm] = useState("");
  const [baseFareLoading, setBaseFareLoading] = useState(false);
  const [currentBaseFare, setCurrentBaseFare] = useState({
    baseFare: 0,
    baseDistanceKm: 0,
    additionalChargePerKm: 0
  });

  const itemsPerPage = 5;

  useEffect(() => {
    fetchRiders();
    fetchCurrentBaseFare();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.simcurarx.com/api/admin/allriders");
      setRiders(res.data.riders || []);
    } catch (err) {
      console.error("Error fetching riders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBaseFare = async () => {
    try {
      const res = await axios.get("https://api.simcurarx.com/api/admin/base-fare/current");
      if (res.data.success && res.data.configuration) {
        setCurrentBaseFare({
          baseFare: res.data.configuration.baseFare || 0,
          baseDistanceKm: res.data.configuration.baseDistanceKm || 0,
          additionalChargePerKm: res.data.configuration.additionalChargePerKm || 0
        });
        setBaseFare(res.data.configuration.baseFare?.toString() || "0");
        setBaseDistanceKm(res.data.configuration.baseDistanceKm?.toString() || "0");
        setAdditionalChargePerKm(res.data.configuration.additionalChargePerKm?.toString() || "0");
      }
    } catch (err) {
      console.error("Error fetching base fare:", err);
      setCurrentBaseFare({
        baseFare: 0,
        baseDistanceKm: 0,
        additionalChargePerKm: 0
      });
      setBaseFare("0");
      setBaseDistanceKm("0");
      setAdditionalChargePerKm("0");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rider?")) {
      try {
        const res = await axios.delete(
          `https://api.simcurarx.com/api/admin/delete-rider/${id}`
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
        `https://api.simcurarx.com/api/admin/update-rider/${selectedRider._id}`,
        selectedRider
      );
      console.log("Update Success:", res.data);
      alert("Rider updated successfully!");
      setIsEditModal(false);
      const updatedRes = await axios.get("https://api.simcurarx.com/api/admin/allriders");
      setRiders(updatedRes.data.riders || []);
    } catch (err) {
      console.error("Error updating rider:", err);
      alert("Error updating rider!");
    }
  };

  const handleSetBaseFare = async (e) => {
    e.preventDefault();
    
    if (!baseFare || parseFloat(baseFare) < 0) {
      alert("Please enter a valid base fare amount");
      return;
    }
    if (!baseDistanceKm || parseFloat(baseDistanceKm) < 0) {
      alert("Please enter a valid base distance");
      return;
    }
    if (!additionalChargePerKm || parseFloat(additionalChargePerKm) < 0) {
      alert("Please enter a valid additional charge per km");
      return;
    }
    
    setBaseFareLoading(true);
    try {
      const res = await axios.post(
        "https://api.simcurarx.com/api/admin/base-fare/set-all",
        { 
          baseFare: parseFloat(baseFare),
          baseDistanceKm: parseFloat(baseDistanceKm),
          additionalChargePerKm: parseFloat(additionalChargePerKm)
        }
      );
      if (res.data.success) {
        alert(res.data.message);
        setShowBaseFareModal(false);
        setCurrentBaseFare({
          baseFare: parseFloat(baseFare),
          baseDistanceKm: parseFloat(baseDistanceKm),
          additionalChargePerKm: parseFloat(additionalChargePerKm)
        });
        await fetchRiders();
      }
    } catch (err) {
      console.error("Error setting base fare:", err);
      alert(err.response?.data?.message || "Error setting base fare");
    } finally {
      setBaseFareLoading(false);
    }
  };

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
      { label: "Base Distance (km)", key: "baseDistanceKm" },
      { label: "Additional Charge (₹/km)", key: "additionalChargePerKm" },
      { label: "Status", key: "status" },
      { label: "Driving License Status", key: "drivingLicenseStatus" },
    ],
    data: filteredRiders,
  };

  const resetFilters = () => {
    setFilters({ search: "", city: "", status: "", drivingLicenseStatus: "" });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online": return "bg-green-100 text-green-700";
      case "busy": return "bg-yellow-100 text-yellow-700";
      case "offline": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDrivingLicenseStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-4">
      {/* Header with Search & Export */}
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

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setShowBaseFareModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm sm:text-base"
          >
            <FiDollarSign className="text-sm sm:text-base" /> Fare Settings
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm sm:text-base"
          >
            <FiFilter /> Filters
          </button>
          <CSVLink
            {...csvData}
            filename="riders_list.csv"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center text-sm sm:text-base"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* Current Base Fare Display */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FiSettings className="text-blue-600" />
            <span className="text-blue-800 font-medium text-sm sm:text-base">
              Current Fare Settings:
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              <strong className="text-purple-600">Base Fare:</strong> ₹{currentBaseFare.baseFare}
            </span>
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              <strong className="text-blue-600">Base Distance:</strong> {currentBaseFare.baseDistanceKm} km
            </span>
            <span className="bg-white px-3 py-1 rounded-full shadow-sm">
              <strong className="text-orange-600">Additional Charge:</strong> ₹{currentBaseFare.additionalChargePerKm}/km
            </span>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <thead className="bg-blue-600 text-white text-sm sm:text-base">
              <tr>
                <th className="p-2 sm:p-3 text-left">#</th>
                <th className="p-2 sm:p-3 text-left hidden xs:table-cell">Profile</th>
                <th className="p-2 sm:p-3 text-left">Name</th>
                <th className="p-2 sm:p-3 text-left">Email</th>
                <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Password</th>
                <th className="p-2 sm:p-3 text-left">Phone</th>
                <th className="p-2 sm:p-3 text-left hidden md:table-cell">City</th>
                <th className="p-2 sm:p-3 text-left">Base Fare (₹)</th>
                <th className="p-2 sm:p-3 text-left">Status</th>
                <th className="p-2 sm:p-3 text-left hidden lg:table-cell">License Status</th>
                <th className="p-2 sm:p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentItems.length > 0 ? (
                currentItems.map((rider, index) => (
                  <tr key={rider._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-3">{indexOfFirst + index + 1}</td>
                    <td className="p-2 sm:p-3 hidden xs:table-cell">
                      {rider.profileImage && (
                        <img
                          src={rider.profileImage}
                          alt={rider.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </td>
                    <td className="p-2 sm:p-3 font-semibold truncate max-w-[120px]">{rider.name}</td>
                    <td className="p-2 sm:p-3 truncate max-w-[150px]">{rider.email}</td>
                    <td className="p-2 sm:p-3 hidden sm:table-cell truncate max-w-[100px]">{rider.password}</td>
                    <td className="p-2 sm:p-3 truncate max-w-[120px]">{rider.phone}</td>
                    <td className="p-2 sm:p-3 hidden md:table-cell truncate max-w-[100px]">{rider.city}</td>
                    <td className="p-2 sm:p-3">
                      <span className="font-semibold text-green-700">
                        ₹{rider.baseFare || currentBaseFare.baseFare}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(rider.status)}`}>
                        {rider.status || "N/A"}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDrivingLicenseStatusBadgeColor(rider.drivingLicenseStatus)}`}>
                        {rider.drivingLicenseStatus || "Null"}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="flex space-x-2 text-lg">
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500 font-medium">
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
              className={`px-3 py-1 rounded border text-sm ${
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
              className={`px-3 py-1 rounded border text-sm ${
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
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-md relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setShowBaseFareModal(false)}
            >
              <FiX size={24} />
            </button>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold">Set Fare Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                This will update fare settings for all {riders.length} riders
              </p>
            </div>
            <form onSubmit={handleSetBaseFare}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  <FiDollarSign className="inline mr-1" /> Base Fare Amount (₹)
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
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  <FiMapPin className="inline mr-1" /> Base Distance (km)
                </label>
                <input
                  type="number"
                  value={baseDistanceKm}
                  onChange={(e) => setBaseDistanceKm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter base distance in km"
                  min="0"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Distance covered in base fare
                </p>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  <FiTrendingUp className="inline mr-1" /> Additional Charge per km (₹)
                </label>
                <input
                  type="number"
                  value={additionalChargePerKm}
                  onChange={(e) => setAdditionalChargePerKm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter additional charge per km"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Charge for each km beyond base distance
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
                      Current Settings:
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Base Fare: ₹{currentBaseFare.baseFare} | 
                      Base Distance: {currentBaseFare.baseDistanceKm} km | 
                      Extra Charge: ₹{currentBaseFare.additionalChargePerKm}/km
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      This will update fare settings for <strong>all {riders.length} riders</strong> in the system.
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

      {/* Rider View Modal - Updated with all fields */}
      {isViewModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setIsViewModal(false)}
            >
              <FiX size={24} />
            </button>
            
            {/* Profile Header */}
            <div className="text-center mb-4">
              <img
                src={selectedRider.profileImage || "/default-avatar.png"}
                alt={selectedRider.name}
                className="w-24 h-24 rounded-full mx-auto border shadow max-w-full"
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
              />
              <h2 className="text-xl font-bold mt-2">{selectedRider.name}</h2>
              <p className="text-sm text-gray-500">Rider ID: {selectedRider._id}</p>
            </div>

            {/* Personal Info */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">📌 Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p><strong>Email:</strong> {selectedRider.email}</p>
                <p><strong>Phone:</strong> {selectedRider.phone}</p>
                <p><strong>Address:</strong> {selectedRider.address || "N/A"}</p>
                <p><strong>City:</strong> {selectedRider.city || "N/A"}</p>
                <p><strong>State:</strong> {selectedRider.state || "N/A"}</p>
                <p><strong>Pin Code:</strong> {selectedRider.pinCode || "N/A"}</p>
                {selectedRider.latitude && selectedRider.longitude && (
                  <p><strong>Coordinates:</strong> {selectedRider.latitude}, {selectedRider.longitude}</p>
                )}
              </div>
            </div>

            {/* Fare Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">💰 Fare Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">Base Fare</p>
                  <p className="text-xl font-bold text-purple-700">₹{selectedRider.baseFare || currentBaseFare.baseFare}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Base Distance</p>
                  <p className="text-xl font-bold text-blue-700">{selectedRider.baseDistanceKm || currentBaseFare.baseDistanceKm} km</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600">Additional Charge</p>
                  <p className="text-xl font-bold text-orange-700">₹{selectedRider.additionalChargePerKm || currentBaseFare.additionalChargePerKm}/km</p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">📊 Status Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Rider Status</p>
                  <span className={`inline-block px-3 py-1 mt-1 rounded text-sm font-medium ${getStatusBadgeColor(selectedRider.status)}`}>
                    {selectedRider.status || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">License Status</p>
                  <span className={`inline-block px-3 py-1 mt-1 rounded text-sm font-medium ${getDrivingLicenseStatusBadgeColor(selectedRider.drivingLicenseStatus)}`}>
                    {selectedRider.drivingLicenseStatus || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ride Images */}
            {selectedRider.rideImages?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">🏍️ Ride Images</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedRider.rideImages.map((img, i) => (
                    <img key={i} src={img} alt={`Ride-${i}`} className="w-20 h-20 object-cover rounded border cursor-pointer" onClick={() => window.open(img, "_blank")} />
                  ))}
                </div>
              </div>
            )}

            {/* Driving License */}
            {selectedRider.drivingLicense && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">🚗 Driving License</h3>
                {selectedRider.drivingLicense.endsWith(".pdf") ? (
                  <a href={selectedRider.drivingLicense} download className="text-blue-600 underline hover:text-blue-800 mt-2 inline-block">
                    Download Driving License (PDF)
                  </a>
                ) : (
                  <img
                    src={selectedRider.drivingLicense}
                    alt="Driving License"
                    className="w-40 h-auto mt-2 cursor-pointer rounded border max-w-full"
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

            {/* Wallet & Order Stats */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">📊 Wallet & Order Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Wallet Balance</p>
                  <p className="text-xl font-bold text-green-700">₹{selectedRider.wallet || 0}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Orders Assigned</p>
                  <p className="text-xl font-bold text-blue-700">{selectedRider.totalOrdersAssigned || 0}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600">Orders Completed</p>
                  <p className="text-xl font-bold text-purple-700">{selectedRider.totalOrdersCompleted || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModal && selectedRider && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[90%] sm:max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              onClick={() => setIsEditModal(false)}
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Rider</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={selectedRider.name || ""}
                  onChange={(e) => setSelectedRider({ ...selectedRider, name: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={selectedRider.email || ""}
                  onChange={(e) => setSelectedRider({ ...selectedRider, email: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider email"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  value={selectedRider.phone || ""}
                  onChange={(e) => setSelectedRider({ ...selectedRider, phone: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider phone"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">City</label>
                <input
                  type="text"
                  value={selectedRider.city || ""}
                  onChange={(e) => setSelectedRider({ ...selectedRider, city: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter rider city"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Base Fare (₹)</label>
                <input
                  type="number"
                  value={selectedRider.baseFare || currentBaseFare.baseFare}
                  onChange={(e) => setSelectedRider({ ...selectedRider, baseFare: parseFloat(e.target.value) })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter base fare"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Base Distance (km)</label>
                <input
                  type="number"
                  value={selectedRider.baseDistanceKm || currentBaseFare.baseDistanceKm}
                  onChange={(e) => setSelectedRider({ ...selectedRider, baseDistanceKm: parseFloat(e.target.value) })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter base distance"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Additional Charge per km (₹)</label>
                <input
                  type="number"
                  value={selectedRider.additionalChargePerKm || currentBaseFare.additionalChargePerKm}
                  onChange={(e) => setSelectedRider({ ...selectedRider, additionalChargePerKm: parseFloat(e.target.value) })}
                  className="border p-2 rounded w-full"
                  placeholder="Enter additional charge"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={selectedRider.status || ""}
                  onChange={(e) => setSelectedRider({ ...selectedRider, status: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Driving License Status</label>
                <select
                  value={selectedRider.drivingLicenseStatus || "Pending"}
                  onChange={(e) => setSelectedRider({ ...selectedRider, drivingLicenseStatus: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
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