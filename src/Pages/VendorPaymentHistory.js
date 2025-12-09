import React, { useState, useEffect } from 'react';
import { FiEye, FiUser, FiPhone, FiCalendar, FiDollarSign, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

const VendorPaymentHistory = () => {
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const itemsPerPage = 8;

    // Fetch payment history data
    const fetchPaymentHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://31.97.206.144:7021/api/pharmacy/paymenthistory');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch payment history');
            }

            if (data.success) {
                setPaymentData(data.paymentHistories || []);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching payment history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    // Filter data based on search and filter
    const filteredData = paymentData.filter(vendor => {
        const matchesSearch = 
            vendor.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = !filterStatus || 
            (filterStatus === 'hasPayments' && vendor.totalPayments > 0) ||
            (filterStatus === 'noPayments' && vendor.totalPayments === 0);

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Open payment details modal
    const openPaymentModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowPaymentModal(true);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading payment history...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error: </strong> {error}
                    <button 
                        onClick={fetchPaymentHistory}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendor Payment History</h1>
                <p className="text-gray-600">Track and manage all vendor payment records</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiUser className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Total Vendors</p>
                            <p className="text-xl font-bold text-gray-800">{paymentData.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FiDollarSign className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Active Payments</p>
                            <p className="text-xl font-bold text-gray-800">
                                {paymentData.filter(v => v.totalPayments > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <FiCalendar className="text-yellow-600 text-xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">No Payments</p>
                            <p className="text-xl font-bold text-gray-800">
                                {paymentData.filter(v => v.totalPayments === 0).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FiDollarSign className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <p className="text-xl font-bold text-gray-800">
                                {paymentData.reduce((sum, vendor) => sum + vendor.totalPayments, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by pharmacy name, vendor name, or ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">All Vendors</option>
                            <option value="hasPayments">With Payments</option>
                            <option value="noPayments">No Payments</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pharmacy Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registration Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((vendor, index) => (
                                    <tr key={vendor.pharmacyId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <FiUser className="text-green-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {vendor.vendorName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {vendor.vendorId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {vendor.pharmacyName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Pharmacy ID: {vendor.pharmacyId.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    vendor.totalPayments > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {vendor.totalPayments > 0 ? 'Active Payments' : 'No Payments'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {vendor.totalPayments} transaction(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(vendor.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openPaymentModal(vendor)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                            >
                                                <FiEye className="mr-1" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="text-gray-500">
                                            <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <p className="text-lg font-medium">No vendors found</p>
                                            <p className="mt-1">Try adjusting your search or filter criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(indexOfLastItem, filteredData.length)}
                                </span> of{' '}
                                <span className="font-medium">{filteredData.length}</span> results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <FiChevronLeft className="mr-1" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Next
                                    <FiChevronRight className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Details Modal */}
            {showPaymentModal && selectedVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Payment Details - {selectedVendor.pharmacyName}
                                </h3>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                                Vendor: {selectedVendor.vendorName} (ID: {selectedVendor.vendorId})
                            </p>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-4">
                            {selectedVendor.totalPayments > 0 && Array.isArray(selectedVendor.paymentHistory) ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <FiDollarSign className="text-green-600 mr-2" />
                                            <span className="text-green-800 font-medium">
                                                {selectedVendor.totalPayments} payment record(s) found
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {selectedVendor.paymentHistory.map((payment, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Month</label>
                                                    <p className="mt-1 text-sm text-gray-900">{payment.month}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                                    <p className="mt-1">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            payment.status === 'paid' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : payment.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Amount</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {formatDate(payment.date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FiDollarSign className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h4>
                                    <p className="text-gray-600">
                                        This vendor doesn't have any payment records yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPaymentHistory;