import React, { useEffect, useState } from "react";
import { 
  FiEye, FiEdit, FiTrash, FiDownload, FiFilter, 
  FiChevronLeft, FiChevronRight, FiX, FiCalendar,
  FiInbox, FiRefreshCw, FiPackage, FiUser,
  FiDollarSign, FiClock, FiMapPin
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../Images/logo.png"

export default function PrescriptionOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusForm, setStatusForm] = useState({ status: "", message: "" });
    const [filterState, setFilterState] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDateType, setFilterDateType] = useState(""); // "day", "month", "year"
    const [filterDate, setFilterDate] = useState(""); // For specific date
    const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM format
    const [filterYear, setFilterYear] = useState(""); // YYYY format
    const [showFilters, setShowFilters] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 5;

    // Fetch all prescription orders
    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://31.97.206.144:7021/api/admin/prescription-orders");
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to fetch prescription orders");

            setOrders(Array.isArray(data.orders) ? data.orders : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Delete order
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this prescription order?")) return;
        try {
            const res = await fetch(`http://31.97.206.144:7021/api/admin/deleteorder/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");
            alert("Prescription order deleted successfully!");
            fetchOrders();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    };

    // Open status edit modal
    const openEditModal = (order) => {
        setSelectedOrder(order);
        setStatusForm({
            status: order.status || "",
            message: "",
        });
        setShowEditModal(true);
    };

    // Update order status
   const handleStatusUpdate = async () => {
        if (!statusForm.status || !statusForm.message) {
            alert("Please fill both status and message.");
            return;
        }
        try {
            const res = await fetch(
                `http://31.97.206.144:7021/api/admin/ordersstatus/${selectedOrder.userId._id}/${selectedOrder._id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(statusForm),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            alert("Order status updated successfully!");
            setShowEditModal(false);
            fetchOrders();
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    };

    // Date filtering functions
    const filterOrdersByDate = (order) => {
        const orderDate = new Date(order.createdAt);
        
        if (filterDateType === "day" && filterDate) {
            const filterDateObj = new Date(filterDate);
            return (
                orderDate.getDate() === filterDateObj.getDate() &&
                orderDate.getMonth() === filterDateObj.getMonth() &&
                orderDate.getFullYear() === filterDateObj.getFullYear()
            );
        }
        
        if (filterDateType === "month" && filterMonth) {
            const [year, month] = filterMonth.split('-');
            return (
                orderDate.getFullYear() === parseInt(year) &&
                orderDate.getMonth() === parseInt(month) - 1
            );
        }
        
        if (filterDateType === "year" && filterYear) {
            return orderDate.getFullYear() === parseInt(filterYear);
        }
        
        return true;
    };

    // Generate and download invoice as PDF
    const handleDownloadInvoice = async (order) => {
        setGeneratingInvoice(true);
        try {
            // Create a hidden div with invoice content
            const invoiceElement = document.createElement("div");
            invoiceElement.style.position = "absolute";
            invoiceElement.style.left = "-9999px";
            invoiceElement.innerHTML = generateInvoiceHTML(order);
            document.body.appendChild(invoiceElement);

            // Convert to canvas then to PDF
            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`prescription-invoice-${order._id}.pdf`);

            // Clean up
            document.body.removeChild(invoiceElement);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate invoice. Please try again.");
        } finally {
            setGeneratingInvoice(false);
        }
    };

    // Generate invoice HTML (same layout as screenshot)
    const generateInvoiceHTML = (order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const totalAmount = order.totalAmount || 0;

        return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logo}" alt="Company Logo" style="height: 60px; margin-bottom: 8px;" />
            <h2 style="margin: 5px 0; color:#333;">Prescription Invoice</h2>
        </div>

      <!-- Company Info -->
<table style="width:100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px;">
  <tr>
    <!-- Left Side with Logo + Company Details -->
    <td style="width:50%; vertical-align:top; text-align:left;">
      <!-- ✅ Company Logo -->
      <div style="margin-bottom: 8px;">
        <img src="${logo}" alt="Company Logo" style="height:60px;" />
      </div>

      <!-- ✅ Company Details -->
      <div>
        <strong>CLYNIX LIMITED</strong><br/>
        Address: 1-31, Chhediga dibbalu, Indrapalem, Kakinada.<br/>
        State: Andhra Pradesh<br/>
        Email ID: order@clynix.com
      </div>
    </td>

    <!-- Right Side with Tax/Invoice Info -->
    <td style="width:50%; vertical-align:top; text-align:right;">
      <div>
        PAN: KKHNDXXXXX<br/>
        CIN: QW4321ddXXXXXXX<br/>
        GSTIN: 38ABLDGJ3XXXXXXX<br/>
        <strong>Invoice No:</strong> ${order._id}<br/>
        <strong>Invoice Date:</strong> ${orderDate}
      </div>
    </td>
  </tr>
</table>

        <!-- Customer Details -->
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:15px; font-size:14px;">
            <strong>Customer Details</strong><br/>
            Name: ${order.userId?.name || "N/A"}<br/>
            Mobile: ${order.userId?.mobile || "N/A"}<br/>
            GSTIN: US5XXXXXX<br/>
            Delivery Address: ${order.deliveryAddress?.house || ""}, ${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.city || ""}, ${order.deliveryAddress?.state || ""} - ${order.deliveryAddress?.pincode || ""}<br/>
            Place of Supply: ${order.deliveryAddress?.state || "Andhra Pradesh (37)"}
        </div>

        <!-- Service Details -->
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:15px; font-size:14px;">
            <strong>Service Details</strong><br/>
            HSN Code: 999799<br/>
            Supply Description: Prescription Medicine Services
        </div>

        <!-- Order Items Table -->
        <table style="width:100%; border-collapse: collapse; font-size:14px; margin-bottom:15px;">
            <thead>
                <tr style="background:#f0f0f0;">
                    <th style="border:1px solid #ccc; padding:8px;">Sr.No</th>
                    <th style="border:1px solid #ccc; padding:8px;">Particulars</th>
                    <th style="border:1px solid #ccc; padding:8px;">Taxable Amount</th>
                    <th style="border:1px solid #ccc; padding:8px;">CGST</th>
                    <th style="border:1px solid #ccc; padding:8px;">SGST</th>
                    <th style="border:1px solid #ccc; padding:8px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems?.map((item, idx) => {
            const itemTotal = (item.medicineId?.price || 0) * (item.quantity || 1);
            return `
                    <tr>
                        <td style="border:1px solid #ccc; padding:8px;">${idx + 1}</td>
                        <td style="border:1px solid #ccc; padding:8px;">
                            Order ID: ${order._id}<br/>
                            Order Date: ${orderDate}<br/>
                            ${item.name || item.medicineId?.name || "Unknown Medicine"}<br/>
                            Quantity: ${item.quantity || 1}
                        </td>
                        <td style="border:1px solid #ccc; padding:8px;">${itemTotal.toFixed(2)}</td>
                        <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                        <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                        <td style="border:1px solid #ccc; padding:8px;">${itemTotal.toFixed(2)}</td>
                    </tr>`;
        }).join("")}
                
                <!-- Additional Charges -->
                <tr>
                    <td colspan="2" style="border:1px solid #ccc; padding:8px;">Subtotal</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.subtotal?.toFixed(2) || totalAmount.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.subtotal?.toFixed(2) || totalAmount.toFixed(2)}</td>
                </tr>
                ${order.deliveryCharge ? `
                <tr>
                    <td colspan="2" style="border:1px solid #ccc; padding:8px;">Delivery Charge</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.deliveryCharge.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.deliveryCharge.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${order.platformCharge ? `
                <tr>
                    <td colspan="2" style="border:1px solid #ccc; padding:8px;">Platform Charge</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.platformCharge.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">${order.platformCharge.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${order.discountAmount ? `
                <tr>
                    <td colspan="2" style="border:1px solid #ccc; padding:8px;">Discount</td>
                    <td style="border:1px solid #ccc; padding:8px;">-${order.discountAmount.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">-${order.discountAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
                
                <tr style="font-weight:bold;">
                    <td colspan="2" style="border:1px solid #ccc; padding:8px; text-align:right;">Total</td>
                    <td style="border:1px solid #ccc; padding:8px;">${totalAmount.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">${totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Additional Information -->
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:15px; font-size:14px;">
            <strong>Additional Information</strong><br/>
            Payment Method: ${order.paymentMethod || "Cash on Delivery"}<br/>
            Payment Status: ${order.paymentStatus || "Pending"}<br/>
            Order Type: Prescription Order<br/>
            Notes: ${order.notes || "No additional notes"}
        </div>

        <!-- Footer -->
        <div style="margin-top:30px; text-align:right; font-size:14px;">
            <p>For CLYNIX Team</p>
            <p><strong>Authorised Signatory</strong></p>
        </div>

        <div style="margin-top:20px; font-size:12px; color:#555; border-top:1px solid #ccc; padding-top:10px; text-align:center;">
            Communication Address: My First Office, 8th Floor, Laxmi Square, Isukathota, Visakhapatnam, Andhra Pradesh 530022
        </div>
    </div>
    `;
    };

    // Prepare data for CSV export
    const prepareCSVData = () => {
        const headers = [
            { label: "Order ID", key: "_id" },
            { label: "User Name", key: "userName" },
            { label: "User Mobile", key: "userMobile" },
            { label: "Medicines", key: "medicines" },
            { label: "Total Amount", key: "totalAmount" },
            { label: "Subtotal", key: "subtotal" },
            { label: "Delivery Charge", key: "deliveryCharge" },
            { label: "Platform Charge", key: "platformCharge" },
            { label: "Status", key: "status" },
            { label: "Payment Method", key: "paymentMethod" },
            { label: "Payment Status", key: "paymentStatus" },
            { label: "Date", key: "date" },
            { label: "State", key: "state" }
        ];

        const data = filteredOrders.map(order => ({
            _id: order._id,
            userName: order.userId?.name || "N/A",
            userMobile: order.userId?.mobile || "N/A",
            medicines: order.orderItems?.map(item =>
                `${item.name || item.medicineId?.name} (Qty: ${item.quantity})`
            ).join(", "),
            totalAmount: order.totalAmount || 0,
            subtotal: order.subtotal || 0,
            deliveryCharge: order.deliveryCharge || 0,
            platformCharge: order.platformCharge || 0,
            status: order.status || "Pending",
            paymentMethod: order.paymentMethod || "N/A",
            paymentStatus: order.paymentStatus || "Pending",
            date: new Date(order.createdAt).toLocaleString(),
            state: order.deliveryAddress?.state || "N/A"
        }));

        return { headers, data };
    };

    // Get unique years from orders
    const getUniqueYears = () => {
        const years = orders.map(order => new Date(order.createdAt).getFullYear());
        return [...new Set(years)].sort((a, b) => b - a);
    };

    // Filter orders by state, status, and date
    const filteredOrders = orders.filter(order => {
        const stateMatch = !filterState ||
            (order.deliveryAddress?.state &&
                order.deliveryAddress.state.toLowerCase().includes(filterState.toLowerCase()));
        const statusMatch = !filterStatus ||
            (order.status &&
                order.status.toLowerCase().includes(filterStatus.toLowerCase()));
        const dateMatch = filterOrdersByDate(order);
        
        return stateMatch && statusMatch && dateMatch;
    });

    // Reset date filters when date type changes
    const handleDateTypeChange = (type) => {
        setFilterDateType(type);
        setFilterDate("");
        setFilterMonth("");
        setFilterYear("");
        setCurrentPage(1);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilterState("");
        setFilterStatus("");
        setFilterDateType("");
        setFilterDate("");
        setFilterMonth("");
        setFilterYear("");
        setCurrentPage(1);
    };

    // Refresh function
    const handleRefresh = () => {
        clearAllFilters();
        fetchOrders();
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Get unique states for filter dropdown
    const uniqueStates = [...new Set(
        orders
            .map(order => order.deliveryAddress?.state)
            .filter(state => state)
    )].sort();

    // Get unique statuses for filter dropdown
    const uniqueStatuses = [...new Set(
        orders
            .map(order => order.status)
            .filter(status => status)
    )].sort();

    const uniqueYears = getUniqueYears();

    // Status badge color function
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'confirmed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FiPackage className="mr-2 text-blue-600" />
                                Prescription Orders
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage and track all prescription orders
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <FiRefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters and Export Button */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        showFilters 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <FiFilter className="mr-2 h-4 w-4" />
                                    Filters
                                    {[filterState, filterStatus, filterDateType].filter(Boolean).length > 0 && (
                                        <span className="ml-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                            {[filterState, filterStatus, filterDateType].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                                
                                {(filterState || filterStatus || filterDateType) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                                    >
                                        <FiX className="mr-2 h-4 w-4" />
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {filteredOrders.length > 0 && (
                                <CSVLink
                                    {...prepareCSVData()}
                                    filename={`prescription-orders-${new Date().toISOString().split('T')[0]}.csv`}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                >
                                    <FiDownload className="mr-2 h-4 w-4" />
                                    Export CSV
                                </CSVLink>
                            )}
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* State Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Filter by State
                                        </label>
                                        <select
                                            value={filterState}
                                            onChange={(e) => {
                                                setFilterState(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All States</option>
                                            {uniqueStates.map((state, index) => (
                                                <option key={index} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Filter by Status
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Statuses</option>
                                            {uniqueStatuses.map((status, index) => (
                                                <option key={index} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date Filter
                                        </label>
                                        <select
                                            value={filterDateType}
                                            onChange={(e) => handleDateTypeChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">No Date Filter</option>
                                            <option value="day">Specific Date</option>
                                            <option value="month">By Month</option>
                                            <option value="year">By Year</option>
                                        </select>
                                    </div>

                                    {/* Specific Date Filter */}
                                    {filterDateType === "day" && (
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Date
                                            </label>
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => {
                                                    setFilterDate(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    {/* Month Filter */}
                                    {filterDateType === "month" && (
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Month
                                            </label>
                                            <input
                                                type="month"
                                                value={filterMonth}
                                                onChange={(e) => {
                                                    setFilterMonth(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    {/* Year Filter */}
                                    {filterDateType === "year" && (
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Year
                                            </label>
                                            <select
                                                value={filterYear}
                                                onChange={(e) => {
                                                    setFilterYear(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Year</option>
                                                {uniqueYears.map((year, index) => (
                                                    <option key={index} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        Showing {filteredOrders.length} of {orders.length} prescription orders
                                        {(filterDateType === "day" && filterDate) && ` • Date: ${filterDate}`}
                                        {(filterDateType === "month" && filterMonth) && ` • Month: ${filterMonth}`}
                                        {(filterDateType === "year" && filterYear) && ` • Year: ${filterYear}`}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="mt-3 text-sm text-gray-500">Loading prescription orders...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <FiPackage className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load orders</h3>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                           
                        </div>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">S NO</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Medicines</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-12">
                                                <div className="text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                                        <FiInbox className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-base font-medium text-gray-900 mb-1">
                                                        {filterState || filterStatus || filterDateType
                                                            ? "No matching orders found"
                                                            : "No prescription orders found"
                                                        }
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {filterState || filterStatus || filterDateType
                                                            ? "Try adjusting your filters"
                                                            : "There are no prescription orders in the system yet"
                                                        }
                                                    </p>
                                                    {(filterState || filterStatus || filterDateType) && (
                                                        <button
                                                            onClick={clearAllFilters}
                                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                        >
                                                            <FiX className="mr-2 h-4 w-4" />
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((order, idx) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {indexOfFirstItem + idx + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {order._id?.slice(-8)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        {order.userId?.profileImage ? (
                                                            <img
                                                                src={order.userId.profileImage}
                                                                alt={order.userId.name}
                                                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                                                onError={(e) => (e.target.src = "https://via.placeholder.com/32")}
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                                <FiUser className="h-4 w-4 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.userId?.name || "N/A"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {order.userId?.mobile || "N/A"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="max-w-xs">
                                                        {order.orderItems?.map((item, i) => (
                                                            <div key={i} className="text-xs mb-1 pb-1 border-b border-gray-100 last:border-b-0">
                                                                <span className="font-medium">
                                                                    {item.name || item.medicineId?.name || "Unknown Medicine"}
                                                                </span>
                                                                <span className="text-gray-500 ml-1">
                                                                    (Qty: {item.quantity || 1})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-semibold text-blue-600">
                                                        ₹{order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                                        {order.status || "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FiCalendar className="h-3 w-3 mr-1 text-gray-400" />
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(order)}
                                                            className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                                                            title="Edit Status"
                                                        >
                                                            <FiEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(order._id)}
                                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FiTrash className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(order)}
                                                            disabled={generatingInvoice}
                                                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                                                            title="Download Invoice"
                                                        >
                                                            <FiDownload className="h-4 w-4" />
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
                        {filteredOrders.length > 0 && totalPages > 1 && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiChevronLeft className="h-4 w-4" />
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
                                                    key={i}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 border rounded-md text-sm ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Status Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-500 bg-opacity-75">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                                Order ID: <span className="font-mono font-medium">{selectedOrder._id?.slice(-8)}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    value={statusForm.message}
                                    onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter status update message for the user"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}