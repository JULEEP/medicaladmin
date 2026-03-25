import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FiTrash2, FiEye, FiSearch, FiX, FiDownload, 
  FiChevronLeft, FiChevronRight, FiInbox, FiRefreshCw,
  FiUser, FiMail, FiCalendar, FiFileText, FiAlertCircle
} from "react-icons/fi";

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 5;
  const [total, setTotal] = useState(0);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "http://31.97.206.144:7021/api/admin/alluploadprescription"
      );
      const data = res.data.prescriptions || [];
      setPrescriptions(data);
      setFilteredPrescriptions(data);
      setTotal(data.length);
    } catch (error) {
      console.error("Error fetching prescriptions", error);
      setError("Failed to load prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Search filter effect
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPrescriptions(prescriptions);
    } else {
      const filtered = prescriptions.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (p.userId?.name?.toLowerCase() || '').includes(searchLower) ||
          (p.userId?.email?.toLowerCase() || '').includes(searchLower) ||
          (p.notes?.toLowerCase() || '').includes(searchLower) ||
          (p.status?.toLowerCase() || '').includes(searchLower) ||
          (p._id?.toLowerCase() || '').includes(searchLower)
        );
      });
      setFilteredPrescriptions(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, prescriptions]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await axios.delete(
        `http://31.97.206.144:7021/api/admin/deleteprescription/${id}`
      );
      
      // Update both states
      const updatedPrescriptions = prescriptions.filter((p) => p._id !== id);
      setPrescriptions(updatedPrescriptions);
      
      // Filtered will update automatically via useEffect
      
      // Reset to previous page if last item of last page is deleted
      if ((currentPage - 1) * pageSize >= updatedPrescriptions.length && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      alert("Prescription deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete prescription.");
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    fetchPrescriptions();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const totalPages = Math.ceil(filteredPrescriptions.length / pageSize);
  const paginatedData = filteredPrescriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-500">Loading prescriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <FiAlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load prescriptions</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiFileText className="mr-2 text-blue-600" />
                Prescription Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all uploaded prescriptions
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                <FiFileText className="mr-1 h-4 w-4" />
                Total: {filteredPrescriptions.length} prescriptions
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Refresh"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user name, email, notes, status, ID..."
                className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((p, index) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {p.userId?.name || "Deleted User"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.userId?.email ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMail className="h-3 w-3 mr-1 text-gray-400" />
                            {p.userId.email}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No email</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {p.notes || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={p.prescriptionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100"
                        >
                          <FiEye className="mr-1 h-3 w-3" />
                          View File
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(p.status)}`}>
                          {p.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="h-3 w-3 mr-1 text-gray-400" />
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPrescription(p)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <FiInbox className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                          {searchTerm ? "No matching prescriptions found" : "No prescriptions found"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm 
                            ? `No results match "${searchTerm}"` 
                            : "No prescriptions have been uploaded yet"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={clearSearch}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <FiX className="mr-2 h-4 w-4" />
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPrescriptions.length > pageSize && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FiChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next
                    <FiChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FiFileText className="mr-2 text-blue-600" />
                    Prescription Details
                  </h3>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiUser className="mr-1" />
                      User Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{selectedPrescription.userId?.name || "Deleted User"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{selectedPrescription.userId?.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiFileText className="mr-1" />
                      Prescription Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500">Notes</p>
                        <p className="font-medium">{selectedPrescription.notes || "No notes"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedPrescription.status)}`}>
                          {selectedPrescription.status || "Pending"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Uploaded</p>
                        <p className="font-medium">{formatDate(selectedPrescription.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(selectedPrescription.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiEye className="mr-1" />
                      File Preview
                    </h4>
                    
                    {selectedPrescription.prescriptionUrl?.endsWith(".pdf") ? (
                      <>
                        <iframe
                          src={selectedPrescription.prescriptionUrl}
                          title="PDF Preview"
                          className="w-full h-64 border rounded-lg mb-3"
                        />
                        <div className="flex space-x-3">
                          <a
                            href={selectedPrescription.prescriptionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center"
                          >
                            Open PDF
                          </a>
                          <a
                            href={selectedPrescription.prescriptionUrl}
                            download
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 text-center flex items-center justify-center"
                          >
                            <FiDownload className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={selectedPrescription.prescriptionUrl}
                          alt="Prescription"
                          className="w-full h-auto max-h-64 object-contain border rounded-lg mb-3"
                        />
                        <div className="flex space-x-3">
                          <a
                            href={selectedPrescription.prescriptionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center"
                          >
                            Open Image
                          </a>
                          <a
                            href={selectedPrescription.prescriptionUrl}
                            download
                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 text-center flex items-center justify-center"
                          >
                            <FiDownload className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedPrescription(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionsPage;