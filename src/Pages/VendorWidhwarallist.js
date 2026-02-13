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
  FaKey
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
    processing: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    failed: 0
  });

  // Fetch all withdrawal requests
  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://31.97.206.144:7021/api/admin/allvendorwidrawal?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter === "all" ? "" : statusFilter}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch withdrawal requests");
      }

      setWithdrawals(data.withdrawals || []);
      setTotalPages(data.pagination?.pages || 1);
      
      // Calculate stats from data
      if (data.withdrawals) {
        calculateStats(data.withdrawals);
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (withdrawalData) => {
    const statsObj = {
      total: withdrawalData.length,
      requested: 0,
      processing: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      failed: 0
    };

    withdrawalData.forEach(item => {
      const status = item.status?.toLowerCase();
      if (statsObj.hasOwnProperty(status)) {
        statsObj[status]++;
      } else if (status === "pending") {
        statsObj.requested++;
      }
    });

    setStats(statsObj);
  };

  // Filter withdrawals based on search term
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
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

    const csvData = withdrawals.map(withdrawal => [
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
    
    alert("Data exported successfully!");
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
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "requested":
      case "pending":
        return <FaClock className="mr-1" />;
      case "processing":
        return <FaSpinner className="mr-1 animate-spin" />;
      case "approved":
        return <FaCheck className="mr-1" />;
      case "completed":
        return <FaCheckCircle className="mr-1" />;
      case "rejected":
      case "failed":
      case "cancelled":
        return <FaBan className="mr-1" />;
      default:
        return <FaInfoCircle className="mr-1" />;
    }
  };

  // Format account number - Show full number
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'N/A';
    // Show complete account number without masking
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
                <FaTimesCircle className="w-6 h-6" />
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
                        <p className="font-mono font-medium text-lg">{selectedWithdrawal.bankAccount?.ifscCode || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaInfoCircle className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Bank Account ID</p>
                        <p className="font-mono font-medium">{selectedWithdrawal.bankAccount?._id || 'N/A'}</p>
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
                onClick={() => handleUpdateStatus(selectedWithdrawal)}
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
                <FaTimesCircle className="w-6 h-6" />
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
                  <option value="requested">Requested</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
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
    <div className="flex space-x-2 overflow-x-auto pb-2">
      <button
        onClick={() => setStatusFilter("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${statusFilter === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        <FaFilter className="mr-1" />
        All ({stats.total})
      </button>
      <button
        onClick={() => setStatusFilter("requested")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${statusFilter === "requested" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        <FaClock className="mr-1" />
        Requested ({stats.requested})
      </button>
      <button
        onClick={() => setStatusFilter("processing")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${statusFilter === "processing" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        <FaSpinner className="mr-1" />
        Processing ({stats.processing})
      </button>
      <button
        onClick={() => setStatusFilter("approved")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${statusFilter === "approved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        <FaCheck className="mr-1" />
        Approved ({stats.approved})
      </button>
      <button
        onClick={() => setStatusFilter("completed")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${statusFilter === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
      >
        <FaCheckCircle className="mr-1" />
        Completed ({stats.completed})
      </button>
    </div>
  );

  // Pagination Component
  const Pagination = () => (
    <div className="flex justify-center items-center mt-6">
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 mx-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <FaChevronLeft className="mr-1" />
        Previous
      </button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-4 py-2 mx-1 text-sm font-medium rounded-lg ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 mx-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        Next
        <FaChevronRight className="ml-1" />
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
            
            <button
              onClick={exportToCSV}
              className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaDownload className="mr-2" />
              Export to CSV
            </button>
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
                placeholder="Search by Transaction ID, Vendor Name, Email, Phone, Bank Name, Account Number..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <StatusFilter />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow">
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
              
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-full">
                    <FaClock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Processing</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <FaSpinner className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow">
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
                            <FaMoneyBillWave className="w-full h-full" />
                          </div>
                          <p className="text-gray-500">No withdrawal requests found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchTerm ? "Try changing your search criteria" : "All withdrawal requests are processed"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-medium text-gray-900">
                              {withdrawal.transactionId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {withdrawal.vendor?.vendorName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {withdrawal.vendor?.vendorEmail || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {withdrawal.vendor?.vendorPhone || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900 flex items-center">
                              <FaRupeeSign className="mr-1" />
                              {formatCurrency(withdrawal.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {withdrawal.bankAccount?.bankName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {withdrawal.bankAccount?.accountHolderName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                                {formatAccountNumber(withdrawal.bankAccount?.accountNumber)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusBadgeClass(withdrawal.status)}`}>
                              {getStatusIcon(withdrawal.status)}
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(withdrawal.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(withdrawal.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewWithdrawal(withdrawal)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(withdrawal)}
                                className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-50 transition-colors"
                                title="Update Status"
                              >
                                <FaEdit />
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
              {filteredWithdrawals.length > 0 && totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Pagination />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount Requested</p>
                  <p className="text-xl font-bold text-blue-600 flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {formatCurrency(
                      withdrawals.reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Amount</p>
                  <p className="text-xl font-bold text-green-600 flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {formatCurrency(
                      withdrawals
                        .filter(item => item.status.toLowerCase() === 'completed')
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-xl font-bold text-yellow-600 flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {formatCurrency(
                      withdrawals
                        .filter(item => ['requested', 'pending', 'processing'].includes(item.status.toLowerCase()))
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Rejected/Failed Amount</p>
                  <p className="text-xl font-bold text-red-600 flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {formatCurrency(
                      withdrawals
                        .filter(item => ['rejected', 'failed', 'cancelled'].includes(item.status.toLowerCase()))
                        .reduce((sum, item) => sum + item.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}