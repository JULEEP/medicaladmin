import React, { useEffect, useState } from "react";
import { FiEye, FiEdit, FiTrash, FiDownload, FiFilter, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../Images/logo.png";

export default function AllOrders() {
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

    // Fetch all orders
    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://31.97.206.144:7021/api/admin/getallorders");
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

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
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            const res = await fetch(`http://31.97.206.144:7021/api/admin/deleteorder/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");
            alert("Order deleted successfully!");
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
            const invoiceElement = document.createElement("div");
            invoiceElement.style.position = "absolute";
            invoiceElement.style.left = "-9999px";
            invoiceElement.innerHTML = generateInvoiceHTML(order);
            document.body.appendChild(invoiceElement);

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
            pdf.save(`invoice-${order._id}.pdf`);

            document.body.removeChild(invoiceElement);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate invoice. Please try again.");
        } finally {
            setGeneratingInvoice(false);
        }
    };

    // Generate invoice HTML
    const generateInvoiceHTML = (order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const totalAmount = order.orderItems?.reduce(
            (sum, item) => sum + (item.medicineId?.price || 0) * (item.quantity || 1),
            0
        );

        return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logo}" alt="Company Logo" style="height: 60px; margin-bottom: 8px;" />
            <h2 style="margin: 5px 0; color:#333;">Invoice</h2>
        </div>

        <!-- Company Info -->
        <table style="width:100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px;">
            <tr>
                <td style="width:50%; vertical-align:top; text-align:left;">
                    <div style="margin-bottom: 8px;">
                        <img src="${logo}" alt="Company Logo" style="height:60px;" />
                    </div>
                    <div>
                        <strong>CLYNIX LIMITED</strong><br/>
                        Address: 1-31, Chhediga dibbalu, Indrapalem, Kakinada.<br/>
                        State: Andhra Pradesh<br/>
                        Email ID: order@clynix.com
                    </div>
                </td>
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
            GSTIN: US5XXXXXX<br/>
            Delivery Address: ${order.deliveryAddress?.house || ""}, ${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.city || ""}, ${order.deliveryAddress?.state || ""} - ${order.deliveryAddress?.pincode || ""}<br/>
            Place of Supply: ${order.deliveryAddress?.state || "Andhra Pradesh (37)"}
        </div>

        <!-- Service Details -->
        <div style="border:1px solid #ccc; padding:10px; margin-bottom:15px; font-size:14px;">
            <strong>Service Details</strong><br/>
            HSN Code: 999799<br/>
            Supply Description: Other Services N.E.C
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
                                ${item.medicineId?.name || "Unknown Medicine"}
                            </td>
                            <td style="border:1px solid #ccc; padding:8px;">${itemTotal.toFixed(2)}</td>
                            <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                            <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                            <td style="border:1px solid #ccc; padding:8px;">${itemTotal.toFixed(2)}</td>
                        </tr>`;
                }).join("")}
                <tr style="font-weight:bold;">
                    <td colspan="2" style="border:1px solid #ccc; padding:8px; text-align:right;">Total</td>
                    <td style="border:1px solid #ccc; padding:8px;">${totalAmount.toFixed(2)}</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">0.00</td>
                    <td style="border:1px solid #ccc; padding:8px;">${totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

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
            { label: "Total Price", key: "totalPrice" },
            { label: "Status", key: "status" },
            { label: "Date", key: "date" },
            { label: "State", key: "state" }
        ];

        const data = filteredOrders.map(order => ({
            _id: order._id,
            userName: order.userId?.name || "N/A",
            userMobile: order.userId?.mobile || "N/A",
            medicines: order.orderItems?.map(item =>
                `${item.medicineId?.name} (Qty: ${item.quantity})`
            ).join(", "),
            totalPrice: order.totalAmount || 0,
            status: order.status || "Pending",
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
        // State filter
        const stateMatch = !filterState ||
            (order.deliveryAddress?.state &&
                order.deliveryAddress.state.toLowerCase().includes(filterState.toLowerCase()));
        
        // Status filter
        const statusMatch = !filterStatus ||
            (order.status &&
                order.status.toLowerCase().includes(filterStatus.toLowerCase()));
        
        // Date filter
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

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-blue-800">All Orders</h1>

            {/* Filters and Export Button */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                    >
                        <FiFilter /> Filters
                    </button>
                    {(filterState || filterStatus || filterDateType) && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {filteredOrders.length > 0 && (
                    <CSVLink
                        {...prepareCSVData()}
                        filename="orders-export.csv"
                        className="px-3 py-1.5 bg-blue-900 text-white rounded hover:bg-blue-900 no-underline text-sm flex items-center"
                    >
                        <FiDownload className="mr-1" />
                        Export CSV
                    </CSVLink>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white p-3 rounded shadow-md mb-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* State Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
                            <select
                                value={filterState}
                                onChange={(e) => {
                                    setFilterState(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="">All States</option>
                                {uniqueStates.map((state, index) => (
                                    <option key={index} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="">All Statuses</option>
                                {uniqueStatuses.map((status, index) => (
                                    <option key={index} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter Type</label>
                            <select
                                value={filterDateType}
                                onChange={(e) => handleDateTypeChange(e.target.value)}
                                className="w-full p-1.5 border rounded text-sm"
                            >
                                <option value="">No Date Filter</option>
                                <option value="day">Specific Date</option>
                                <option value="month">By Month</option>
                                <option value="year">By Year</option>
                            </select>
                        </div>

                        {/* Specific Date Filter */}
                        {filterDateType === "day" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full p-1.5 border rounded text-sm"
                                />
                            </div>
                        )}

                        {/* Month Filter */}
                        {filterDateType === "month" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                                <input
                                    type="month"
                                    value={filterMonth}
                                    onChange={(e) => {
                                        setFilterMonth(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full p-1.5 border rounded text-sm"
                                />
                            </div>
                        )}

                        {/* Year Filter */}
                        {filterDateType === "year" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
                                <select
                                    value={filterYear}
                                    onChange={(e) => {
                                        setFilterYear(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full p-1.5 border rounded text-sm"
                                >
                                    <option value="">Select Year</option>
                                    {uniqueYears.map((year, index) => (
                                        <option key={index} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                        Showing {filteredOrders.length} of {orders.length} orders
                        {(filterDateType === "day" && filterDate) && ` • Date: ${filterDate}`}
                        {(filterDateType === "month" && filterMonth) && ` • Month: ${filterMonth}`}
                        {(filterDateType === "year" && filterYear) && ` • Year: ${filterYear}`}
                    </div>
                </div>
            )}

            {loading && <p className="text-center py-4">Loading orders...</p>}
            {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="overflow-x-auto border rounded shadow bg-white">
                        <table className="w-full table-auto">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="p-2 text-left text-sm">#</th>
                                    <th className="p-2 text-left text-sm">User</th>
                                    <th className="p-2 text-left text-sm">Medicines</th>
                                    <th className="p-2 text-left text-sm">Total Price</th>
                                    <th className="p-2 text-left text-sm">Status</th>
                                    <th className="p-2 text-left text-sm">Date</th>
                                    <th className="p-2 text-left text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((order, idx) => (
                                        <tr key={order._id} className="border-b hover:bg-gray-50 align-top">
                                            <td className="p-2 text-sm">{indexOfFirstItem + idx + 1}</td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-1">
                                                    {order.userId?.profileImage && (
                                                        <img
                                                            src={order.userId.profileImage}
                                                            alt={order.userId.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                            onError={(e) =>
                                                                (e.target.src = "https://via.placeholder.com/32?text=No+Img")
                                                            }
                                                        />
                                                    )}
                                                    <div className="text-sm">
                                                        <div className="font-medium">{order.userId?.name || "N/A"}</div>
                                                        <div className="text-xs text-gray-500">{order.userId?.mobile || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 text-sm">
                                                {order.orderItems?.map((item, i) => (
                                                    <div key={i} className="mb-1 border-b pb-1 last:border-b-0">
                                                        <div className="font-medium">{item.medicineId?.name}</div>
                                                        <div className="text-xs text-gray-600">
                                                            Qty: {item.quantity} • ₹{item.medicineId?.price || 0}
                                                        </div>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="p-2 font-medium text-blue-700 text-sm">
                                                ₹{order.totalAmount || 0}
                                            </td>
                                            <td className="p-2">
                                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'Confirmed' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="p-2 text-xs">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                <br />
                                                <span className="text-gray-500">
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </span>
                                            </td>
                                            <td className="p-2 flex space-x-2 text-base">
                                                <FiEye
                                                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                    className="text-green-500 cursor-pointer hover:text-green-600"
                                                    title="View"
                                                />
                                                <FiEdit
                                                    onClick={() => openEditModal(order)}
                                                    className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                                                    title="Edit Status"
                                                />
                                                <FiTrash
                                                    onClick={() => handleDelete(order._id)}
                                                    className="text-red-500 cursor-pointer hover:text-red-600"
                                                    title="Delete"
                                                />
                                                <FiDownload
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    className="text-blue-500 cursor-pointer hover:text-blue-600"
                                                    title="Download Invoice"
                                                    disabled={generatingInvoice}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-3 text-center text-gray-500 text-sm">
                                            No orders found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4 space-x-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className={`px-3 py-1.5 rounded flex items-center text-sm ${currentPage === 1
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                <FiChevronLeft className="mr-1" /> Prev
                            </button>

                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className={`px-3 py-1.5 rounded flex items-center text-sm ${currentPage === totalPages || totalPages === 0
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                Next <FiChevronRight className="ml-1" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Status Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-5 rounded-lg w-90 shadow-lg border border-gray-200">
                        <h2 className="text-lg font-bold mb-3">Update Order Status</h2>

                        <label className="block mb-1 font-medium text-sm">Status</label>
                        <select
                            value={statusForm.status}
                            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                            className="border p-1.5 rounded w-full mb-3 text-sm"
                        >
                            <option value="">Select status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <label className="block mb-1 font-medium text-sm">Message</label>
                        <textarea
                            value={statusForm.message}
                            onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
                            className="border p-1.5 rounded w-full mb-3 text-sm"
                            placeholder="Enter status update message for the user"
                            rows="3"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-3 py-1.5 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}