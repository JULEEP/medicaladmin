import React, { useState, useEffect } from "react";
import {
  FaEye, FaEdit, FaCheckCircle, FaTimesCircle, FaMoneyBillWave,
  FaSearch, FaFilter, FaDownload, FaUser, FaEnvelope, FaPhone,
  FaIdCard, FaHistory, FaRupeeSign, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight, FaClock, FaCheck, FaSpinner,
  FaBan, FaBuilding, FaInfoCircle, FaCreditCard, FaKey, FaTimes,
  FaCog,
} from "react-icons/fa";

export default function AdminWithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({ withdrawalId: "", status: "", remarks: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [stats, setStats] = useState({ total: 0, requested: 0, approved: 0, rejected: 0, completed: 0, failed: 0, cancelled: 0 });

  useEffect(() => { fetchWithdrawals(); }, [currentPage]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.simcurarx.com/api/admin/allvendorwidrawal?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch withdrawal requests");
      setWithdrawals(data.withdrawals || []);
      calculateStats(data.withdrawals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (withdrawalData) => {
    const s = { total: withdrawalData.length, requested: 0, processing: 0, approved: 0, rejected: 0, completed: 0, failed: 0};
    withdrawalData.forEach(item => {
      const st = item.status?.toLowerCase() || "";
      if (s[st] !== undefined) s[st]++;
    });
    setStats(s);
    console.log("Calculated stats:", s);
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (statusFilter !== "all" && w.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (!searchTerm) return true;
    const sl = searchTerm.toLowerCase();
    return (
      w.transactionId?.toLowerCase().includes(sl) ||
      w.vendor?.vendorName?.toLowerCase().includes(sl) ||
      w.vendor?.vendorEmail?.toLowerCase().includes(sl) ||
      w.vendor?.vendorPhone?.includes(searchTerm) ||
      w.bankAccount?.accountHolderName?.toLowerCase().includes(sl) ||
      w.bankAccount?.bankName?.toLowerCase().includes(sl) ||
      w.bankAccount?.accountNumber?.includes(searchTerm) ||
      w.amount?.toString().includes(searchTerm)
    );
  });

  const filteredTotalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));
  const currentItems = filteredWithdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewWithdrawal = (w) => { setSelectedWithdrawal(w); setShowViewModal(true); };
  const handleUpdateStatus = (w) => {
    setStatusUpdateData({ withdrawalId: w._id, status: w.status, remarks: "" });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateData.status || !statusUpdateData.withdrawalId) { alert("Please select a status"); return; }
    if (!window.confirm(`Change status to "${statusUpdateData.status}"?`)) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`https://api.simcurarx.com/api/admin/updatewidh-status/${statusUpdateData.withdrawalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusUpdateData.status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status");
      alert("Status updated successfully!");
      setShowStatusModal(false);
      fetchWithdrawals();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefresh = () => { setSearchTerm(""); setStatusFilter("all"); fetchWithdrawals(); };

  const exportToCSV = () => {
    const headers = ["Transaction ID","Vendor Name","Vendor Email","Vendor Phone","Amount","Status","Bank Name","Account Holder","Account Number","IFSC Code","Request Date"];
    const rows = filteredWithdrawals.map(w => [
      w.transactionId || "N/A", w.vendor?.vendorName || "N/A", w.vendor?.vendorEmail || "N/A",
      w.vendor?.vendorPhone || "N/A", w.amount, w.status, w.bankAccount?.bankName || "N/A",
      w.bankAccount?.accountHolderName || "N/A", w.bankAccount?.accountNumber || "N/A",
      w.bankAccount?.ifscCode || "N/A", new Date(w.createdAt).toLocaleDateString(),
    ]);
    let csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach(r => { csv += r.map(c => `"${c}"`).join(",") + "\n"; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `withdrawals_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const statusConfig = {
    requested: { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <FaClock className="mr-1" />, btn: "bg-yellow-600" },
    approved:  { bg: "bg-green-100 text-green-800 border-green-200",   icon: <FaCheck className="mr-1" />, btn: "bg-green-600" },
    completed: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <FaCheckCircle className="mr-1" />, btn: "bg-emerald-600" },
    rejected:  { bg: "bg-red-100 text-red-800 border-red-200",         icon: <FaBan className="mr-1" />, btn: "bg-red-600" },
    failed:    { bg: "bg-red-100 text-red-800 border-red-200",         icon: <FaTimesCircle className="mr-1" />, btn: "bg-red-600" },
    cancelled: { bg: "bg-gray-100 text-gray-800 border-gray-200",      icon: <FaTimesCircle className="mr-1" />, btn: "bg-gray-600" },
  };
  const getStatusCfg = (status) => statusConfig[status?.toLowerCase()] || { bg: "bg-gray-100 text-gray-800 border-gray-200", icon: <FaInfoCircle className="mr-1" />, btn: "bg-gray-600" };

  const StatusBadge = ({ status }) => {
    const cfg = getStatusCfg(status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg}`}>
        {cfg.icon}{status}
      </span>
    );
  };

  // ── View Modal ──────────────────────────────────────────────────────────────
  const ViewModal = () => {
    if (!selectedWithdrawal) return null;
    const w = selectedWithdrawal;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b shrink-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaEye className="text-blue-600" /> Withdrawal Details
            </h3>
            <button onClick={() => setShowViewModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transaction Info */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <FaMoneyBillWave /> Transaction Information
                </h4>
                {[
                  ["Transaction ID", <span className="font-mono text-xs sm:text-sm break-all">{w.transactionId}</span>],
                  ["Amount", <span className="font-bold text-lg text-blue-600 flex items-center"><FaRupeeSign className="mr-1 text-sm" />{formatCurrency(w.amount)}</span>],
                  ["Status", <StatusBadge status={w.status} />],
                  ["Payment Method", <span className="capitalize">{w.paymentMethod?.replace("_", " ") || "Bank Transfer"}</span>],
                  ["Request Date", `${formatDate(w.createdAt)} at ${formatTime(w.createdAt)}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm shrink-0">{label}:</span>
                    <span className="text-sm font-medium text-right">{val}</span>
                  </div>
                ))}
              </div>

              {/* Vendor Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <FaUser /> Vendor Information
                </h4>
                {[
                  [FaUser, "Vendor Name", w.vendor?.vendorName],
                  [FaEnvelope, "Email", w.vendor?.vendorEmail],
                  [FaPhone, "Phone", w.vendor?.vendorPhone],
                  [FaIdCard, "Vendor ID", w.vendor?.vendorId],
                ].map(([Icon, label, val]) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium break-all">{val || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Details */}
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <FaCreditCard /> Bank Account Details
                </h4>
                {[
                  [FaUser, "Account Holder", w.bankAccount?.accountHolderName],
                  [FaBuilding, "Bank Name", w.bankAccount?.bankName],
                  [FaIdCard, "Account Number", w.bankAccount?.accountNumber],
                  [FaKey, "IFSC Code", w.bankAccount?.ifscCode],
                ].map(([Icon, label, val]) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-medium font-mono break-all">{val || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* History */}
              <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <FaHistory /> Transaction History
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-right">{formatDate(w.createdAt)} {formatTime(w.createdAt)}</span>
                </div>
                {w.updatedAt && w.updatedAt !== w.createdAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium text-right">{formatDate(w.updatedAt)} {formatTime(w.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 border-t shrink-0">
            <button onClick={() => { setShowViewModal(false); handleUpdateStatus(w); }}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              <FaEdit /> Update Status
            </button>
            <button onClick={() => setShowViewModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Status Modal ────────────────────────────────────────────────────────────
  const StatusUpdateModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaEdit className="text-blue-600" /> Update Status
          </h3>
          <button onClick={() => setShowStatusModal(false)} disabled={updatingStatus}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-40">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status *</label>
            <select
              value={statusUpdateData.status}
              onChange={(e) => setStatusUpdateData(p => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={updatingStatus}
            >
              <option value="">Select Status</option>
              {["Requested", "processing","approved","completed","rejected","failed"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded flex gap-3">
            <FaExclamationTriangle className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-yellow-700">
              Changing the status will notify the vendor. Please ensure the update is accurate.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-4 sm:p-6 border-t">
          <button onClick={() => setShowStatusModal(false)} disabled={updatingStatus}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleStatusUpdate} disabled={updatingStatus || !statusUpdateData.status}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium">
            {updatingStatus ? <><FaSpinner className="animate-spin" /> Updating…</> : <><FaCheck /> Update Status</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Stat Cards ──────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Total Requests", value: stats.total,                   color: "blue",   icon: FaMoneyBillWave },
    { label: "Requested",      value: stats.requested,               color: "yellow", icon: FaClock },
    { label: "Completed",      value: stats.completed,               color: "emerald",icon: FaCheckCircle },
    { label: "Rejected/Failed",value: stats.rejected + stats.failed, color: "red",    icon: FaBan },
  ];

  const colorMap = {
    blue:    { card: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",    text: "text-blue-600" },
    yellow:  { card: "bg-yellow-50",  icon: "bg-yellow-100 text-yellow-600",text: "text-yellow-600" },
    emerald: { card: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-600" },
    red:     { card: "bg-red-50",     icon: "bg-red-100 text-red-600",      text: "text-red-600" },
  };

  const filterButtons = [
    { key: "all",       label: "All",       count: stats.total,     icon: FaFilter,       active: "bg-blue-600 text-white" },
    { key: "requested", label: "Requested", count: stats.requested, icon: FaClock,        active: "bg-yellow-600 text-white" },
    { key: "processing", label: "Processing", count: stats.processing, icon: FaCog,          active: "bg-blue-600 text-white" },
    { key: "approved",  label: "Approved",  count: stats.approved,  icon: FaCheck,        active: "bg-green-600 text-white" },
    { key: "completed", label: "Completed", count: stats.completed, icon: FaCheckCircle,  active: "bg-emerald-600 text-white" },
    { key: "rejected",  label: "Rejected",  count: stats.rejected,  icon: FaBan,          active: "bg-red-600 text-white" },
    { key: "failed",    label: "Failed",    count: stats.failed,    icon: FaTimesCircle,  active: "bg-red-600 text-white" },
  ];

  const summaryAmounts = [
    { label: "Total Amount",     color: "blue",   filter: () => true },
    { label: "Completed",        color: "green",  filter: (w) => w.status?.toLowerCase() === "completed" },
    { label: "Requested",        color: "yellow", filter: (w) => w.status?.toLowerCase() === "requested" },
    { label: "Rejected/Failed",  color: "red",    filter: (w) => ["rejected","failed","cancelled"].includes(w.status?.toLowerCase()) },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {showViewModal && <ViewModal />}
      {showStatusModal && <StatusUpdateModal />}

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-blue-600" /> Withdrawal Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track vendor withdrawal requests</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleRefresh}
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <FaHistory /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={exportToCSV} disabled={filteredWithdrawals.length === 0}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <FaDownload /> <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Transaction ID, Vendor, Email, Bank…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Status Filter (scrollable on mobile) ── */}
        <div className="overflow-x-auto pb-1 mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {filterButtons.map(({ key, label, count, icon: Icon, active }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === key ? active : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                <Icon className="shrink-0" />
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading / Error / Content ── */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-gray-500 text-sm">Loading withdrawal requests…</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FaExclamationTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Unable to load data</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <FaHistory /> Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {statCards.map(({ label, value, color, icon: Icon }) => {
                const c = colorMap[color];
                return (
                  <div key={label} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-gray-500 text-xs sm:text-sm truncate">{label}</p>
                        <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
                      </div>
                      <div className={`${c.icon} p-2 sm:p-3 rounded-full shrink-0 ml-2`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <tr>
                      {["#","Trans ID","Vendor","Amount","Bank","Status","Date","Actions"].map(h => (
                        <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
                              <FaMoneyBillWave className="h-7 w-7 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                              {searchTerm || statusFilter !== "all" ? "No matching withdrawals" : "No withdrawal requests found"}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                              {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "No requests have been made yet"}
                            </p>
                            {(searchTerm || statusFilter !== "all") && (
                              <button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : currentItems.map((w, i) => (
                      <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                            …{w.transactionId?.slice(-8)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                              <FaUser className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                {w.vendor?.vendorName || "N/A"}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[100px] sm:max-w-[160px]">
                                {w.vendor?.vendorEmail || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-semibold text-blue-600">
                            ₹{w.amount?.toLocaleString() || "0"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 min-w-[110px]">
                          <div className="text-xs sm:text-sm font-medium truncate max-w-[100px]">
                            {w.bankAccount?.bankName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[100px]">
                            {w.bankAccount?.accountNumber || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={w.status} />
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {formatDate(w.createdAt)}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => handleViewWithdrawal(w)}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="View">
                              <FaEye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleUpdateStatus(w)}
                              className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors" title="Update Status">
                              <FaEdit className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredWithdrawals.length > 0 && filteredTotalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 order-2 sm:order-1">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length}
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <FaChevronLeft className="h-2.5 w-2.5" /> Prev
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg">
                      {currentPage} / {filteredTotalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(filteredTotalPages, p + 1))} disabled={currentPage === filteredTotalPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next <FaChevronRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {filteredWithdrawals.length > 0 && (
              <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">Summary</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Total Amount",    color: "blue",   filter: () => true },
                    { label: "Completed",       color: "green",  filter: (w) => w.status?.toLowerCase() === "completed" },
                    { label: "Requested",       color: "yellow", filter: (w) => w.status?.toLowerCase() === "requested" },
                    { label: "Rejected/Failed", color: "red",    filter: (w) => ["rejected","failed","cancelled"].includes(w.status?.toLowerCase()) },
                  ].map(({ label, color, filter }) => (
                    <div key={label} className={`p-3 sm:p-4 bg-${color}-50 rounded-lg`}>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
                      <p className={`text-base sm:text-xl font-bold text-${color}-600 break-words`}>
                        ₹{filteredWithdrawals.filter(filter).reduce((s, w) => s + (w.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}