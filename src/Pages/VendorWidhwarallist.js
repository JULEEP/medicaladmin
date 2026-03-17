import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaHistory,
  FaRupeeSign,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCheck,
  FaSpinner,
  FaBan,
  FaBuilding,
  FaInfoCircle,
  FaCreditCard,
  FaKey,
} from "react-icons/fa";

export default function AdminWithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  
  // Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    withdrawalId: "",
    status: "",
    remarks: ""
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  });

  // Fetch all withdrawal requests
  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://31.97.206.144:7021/api/admin/allvendorwidrawal?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch withdrawal requests");
      }

      setWithdrawals(data.withdrawals || []);
      setTotalPages(data.pagination?.pages || 1);
      
      // Calculate stats from data
      calculateStats(data.withdrawals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (withdrawalData) => {
    const statsObj = {
      total: withdrawalData.length,
      requested: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };

    withdrawalData.forEach(item => {
      const status = item.status?.toLowerCase() || '';
      if (status === 'requested') statsObj.requested++;
      else if (status === 'approved') statsObj.approved++;
      else if (status === 'rejected') statsObj.rejected++;
      else if (status === 'completed') statsObj.completed++;
      else if (status === 'failed') statsObj.failed++;
      else if (status === 'cancelled') statsObj.cancelled++;
    });

    setStats(statsObj);
  };

  // Filter withdrawals based on search term AND status
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    // Status filter
    if (statusFilter !== "all") {
      const statusMatch = withdrawal.status?.toLowerCase() === statusFilter.toLowerCase();
      if (!statusMatch) return false;
    }
    
    // Search filter
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      withdrawal.transactionId?.toLowerCase().includes(searchLower) ||
      withdrawal.vendor?.vendorName?.toLowerCase().includes(searchLower) ||
      withdrawal.vendor?.vendorEmail?.toLowerCase().includes(searchLower) ||
      withdrawal.vendor?.vendorPhone?.includes(searchTerm) ||
      withdrawal.bankAccount?.accountHolderName?.toLowerCase().includes(searchLower) ||
      withdrawal.bankAccount?.bankName?.toLowerCase().includes(searchLower) ||
      withdrawal.bankAccount?.accountNumber?.includes(searchTerm) ||
      withdrawal.amount?.toString().includes(searchTerm)
    );
  });

  // Pagination for filtered results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWithdrawals.slice(indexOfFirstItem, indexOfLastItem);
  const filteredTotalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // View withdrawal details
  const handleViewWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowViewModal(true);
  };

  // Open status update modal
  const handleUpdateStatus = (withdrawal) => {
    setStatusUpdateData({
      withdrawalId: withdrawal._id,
      status: withdrawal.status,
      remarks: ""
    });
    setShowStatusModal(true);
  };

  // Update withdrawal status
  const handleStatusUpdate = async () => {
    if (!statusUpdateData.status || !statusUpdateData.withdrawalId) {
      alert("Please select a status");
      return;
    }

    if (!window.confirm(`Are you sure you want to change status to "${statusUpdateData.status}"?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `http://31.97.206.144:7021/api/admin/updatewidh-status/${statusUpdateData.withdrawalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: statusUpdateData.status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      alert("Status updated successfully!");
      setShowStatusModal(false);
      fetchWithdrawals(); // Refresh the list
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchWithdrawals();
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Transaction ID",
      "Vendor Name",
      "Vendor Email",
      "Vendor Phone",
      "Amount",
      "Status",
      "Bank Name",
      "Account Holder",
      "Account Number",
      "IFSC Code",
      "Request Date"
    ];

    const csvData = filteredWithdrawals.map(withdrawal => [
      withdrawal.transactionId || "N/A",
      withdrawal.vendor?.vendorName || "N/A",
      withdrawal.vendor?.vendorEmail || "N/A",
      withdrawal.vendor?.vendorPhone || "N/A",
      withdrawal.amount,
      withdrawal.status,
      withdrawal.bankAccount?.bankName || "N/A",
      withdrawal.bankAccount?.accountHolderName || "N/A",
      withdrawal.bankAccount?.accountNumber || "N/A",
      withdrawal.bankAccount?.ifscCode || "N/A",
      new Date(withdrawal.createdAt).toLocaleDateString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvData.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "requested":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "requested":
        return <FaClock className="mr-1" />;
      case "approved":
        return <FaCheck className="mr-1" />;
      case "completed":
        return <FaCheckCircle className="mr-1" />;
      case "rejected":
      case "failed":
        return <FaBan className="mr-1" />;
      case "cancelled":
        return <FaTimesCircle className="mr-1" />;
      default:
        return <FaInfoCircle className="mr-1" />;
    }
  };

  // Format account number
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'N/A';
    return accountNumber;
  };

  // View Modal Component
  const ViewModal = () => {
    if (!selectedWithdrawal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaEye className="mr-2 text-blue-600" />
                Withdrawal Details
              </h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Transaction Details */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaMoneyBillWave className="mr-2" />
                    Transaction Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono font-medium">
                        {selectedWithdrawal.transactionId}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-xl text-blue-600 flex items-center">
                        <FaRupeeSign className="mr-1" />
                        {formatCurrency(selectedWithdrawal.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusBadgeClass(selectedWithdrawal.status)}`}>
                        {getStatusIcon(selectedWithdrawal.status)}
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {selectedWithdrawal.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Request Date:</span>
                      <span className="font-medium">
                        {formatDate(selectedWithdrawal.createdAt)} at {formatTime(selectedWithdrawal.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vendor Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2" />
                    Vendor Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Vendor Name</p>
                        <p className="font-medium">{selectedWithdrawal.vendor?.vendorName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedWithdrawal.vendor?.vendorEmail || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedWithdrawal.vendor?.vendorPhone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaIdCard className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Vendor ID</p>
                        <p className="font-mono font-medium">{selectedWithdrawal.vendor?.vendorId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Bank Details */}
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaCreditCard className="mr-2" />
                    Bank Account Details
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Account Holder</p>
                        <p className="font-medium">{selectedWithdrawal.bankAccount?.accountHolderName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaBuilding className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <p className="font-medium">{selectedWithdrawal.bankAccount?.bankName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaIdCard className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-mono font-medium text-lg">
                          {formatAccountNumber(selectedWithdrawal.bankAccount?.accountNumber)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaKey className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">IFSC Code</p>
                        <p className="font-mono font-medium">{selectedWithdrawal.bankAccount?.ifscCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <FaHistory className="mr-2" />
                    Transaction History
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {formatDate(selectedWithdrawal.createdAt)} {formatTime(selectedWithdrawal.createdAt)}
                      </span>
                    </div>
                    
                    {selectedWithdrawal.updatedAt && selectedWithdrawal.updatedAt !== selectedWithdrawal.createdAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {formatDate(selectedWithdrawal.updatedAt)} {formatTime(selectedWithdrawal.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleUpdateStatus(selectedWithdrawal);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaEdit className="mr-2" />
                Update Status
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Status Update Modal Component
  const StatusUpdateModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaEdit className="mr-2 text-blue-600" />
                Update Withdrawal Status
              </h3>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={updatingStatus}
              >
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Status *
                </label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={updatingStatus}
                >
                  <option value="">Select Status</option>
                  <option value="Requested">Requested</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex">
                  <FaExclamationTriangle className="text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700">
                      Changing the status will notify the vendor. Please ensure the status update is accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || !statusUpdateData.status}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updatingStatus ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Status Filter Component
  const StatusFilter = () => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setStatusFilter("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "all" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaFilter className="mr-1" />
        All ({stats.total})
      </button>
      <button
        onClick={() => setStatusFilter("requested")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "requested" 
            ? "bg-yellow-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaClock className="mr-1" />
        Requested ({stats.requested})
      </button>
      <button
        onClick={() => setStatusFilter("approved")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "approved" 
            ? "bg-green-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaCheck className="mr-1" />
        Approved ({stats.approved})
      </button>
      <button
        onClick={() => setStatusFilter("completed")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "completed" 
            ? "bg-emerald-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaCheckCircle className="mr-1" />
        Completed ({stats.completed})
      </button>
      <button
        onClick={() => setStatusFilter("rejected")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "rejected" 
            ? "bg-red-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaBan className="mr-1" />
        Rejected ({stats.rejected})
      </button>
      <button
        onClick={() => setStatusFilter("failed")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "failed" 
            ? "bg-red-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaTimesCircle className="mr-1" />
        Failed ({stats.failed})
      </button>
      <button
        onClick={() => setStatusFilter("cancelled")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
          statusFilter === "cancelled" 
            ? "bg-gray-600 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <FaTimesCircle className="mr-1" />
        Cancelled ({stats.cancelled})
      </button>
    </div>
  );

  // Pagination Component
  const Pagination = () => (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <FaChevronLeft className="mr-1 h-3 w-3" />
        Previous
      </button>
      
      <span className="px-4 py-2 text-sm text-gray-700">
        Page {currentPage} of {filteredTotalPages}
      </span>
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(filteredTotalPages, prev + 1))}
        disabled={currentPage === filteredTotalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        Next
        <FaChevronRight className="ml-1 h-3 w-3" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showViewModal && <ViewModal />}
      {showStatusModal && <StatusUpdateModal />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaMoneyBillWave className="mr-3 text-blue-600" />
                Withdrawal Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and track vendor withdrawal requests</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaHistory className="mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredWithdrawals.length === 0}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by Transaction ID, Vendor Name, Email, Phone, Bank Details..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <StatusFilter />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-500">Loading withdrawal requests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaHistory className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <FaMoneyBillWave className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Requested</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-full">
                    <FaClock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-full">
                    <FaCheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Rejected/Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected + stats.failed}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-full">
                    <FaBan className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Trans ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Bank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                              <FaMoneyBillWave className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                              {searchTerm || statusFilter !== "all" 
                                ? "No matching withdrawals found" 
                                : "No withdrawal requests found"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "No withdrawal requests have been made yet"}
                            </p>
                            {(searchTerm || statusFilter !== "all") && (
                              <button
                                onClick={() => {
                                  setSearchTerm("");
                                  setStatusFilter("all");
                                }}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((withdrawal, index) => (
                        <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {withdrawal.transactionId?.slice(-8)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaUser className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {withdrawal.vendor?.vendorName || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {withdrawal.vendor?.vendorEmail || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-blue-600">
                              ₹{withdrawal.amount?.toLocaleString() || "0"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium">{withdrawal.bankAccount?.bankName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">
                                {withdrawal.bankAccount?.accountNumber || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border items-center ${getStatusBadgeClass(withdrawal.status)}`}>
                              {getStatusIcon(withdrawal.status)}
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-500">
                              {formatDate(withdrawal.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewWithdrawal(withdrawal)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                title="View Details"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(withdrawal)}
                                className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                                title="Update Status"
                              >
                                <FaEdit className="h-4 w-4" />
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
              {filteredWithdrawals.length > 0 && filteredTotalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <Pagination />
                </div>
              )}
            </div>

            {/* Summary */}
            {filteredWithdrawals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{filteredWithdrawals.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{filteredWithdrawals
                        .filter(item => item.status?.toLowerCase() === 'completed')
                        .reduce((sum, item) => sum + (item.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Requested</p>
                    <p className="text-xl font-bold text-yellow-600">
                      ₹{filteredWithdrawals
                        .filter(item => item.status?.toLowerCase() === 'requested')
                        .reduce((sum, item) => sum + (item.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rejected/Failed</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹{filteredWithdrawals
                        .filter(item => ['rejected', 'failed', 'cancelled'].includes(item.status?.toLowerCase()))
                        .reduce((sum, item) => sum + (item.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}