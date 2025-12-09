import React, { useEffect, useState } from "react";
import { FiEye, FiDownload, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";

export default function AllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 5;

  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://31.97.206.144:7021/api/admin/getallpayments");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch payments");

      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Prepare data for CSV export
  const prepareCSVData = () => {
    const headers = [
      { label: "Payment ID", key: "_id" },
      { label: "User Name", key: "userName" },
      { label: "User Mobile", key: "userMobile" },
      { label: "Amount", key: "totalAmount" },
      { label: "Payment Method", key: "paymentMethod" },
      { label: "Status", key: "status" },
      { label: "Date", key: "date" },
    ];

    const data = filteredPayments.map((p) => ({
      _id: p._id,
      userName: p.userId?.name || "N/A",
      userMobile: p.userId?.mobile || "N/A",
      totalAmount: p.totalAmount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      date: new Date(p.createdAt).toLocaleString(),
    }));

    return { headers, data };
  };

  // Filter payments by method and status
  const filteredPayments = payments.filter((p) => {
    const methodMatch =
      !filterMethod ||
      (p.paymentMethod &&
        p.paymentMethod.toLowerCase().includes(filterMethod.toLowerCase()));
    const statusMatch =
      !filterStatus ||
      (p.status && p.status.toLowerCase().includes(filterStatus.toLowerCase()));
    return methodMatch && statusMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Unique filters
  const uniqueMethods = [...new Set(payments.map((p) => p.paymentMethod))].sort();
  const uniqueStatuses = [...new Set(payments.map((p) => p.status))].sort();

  // Generate Invoice using HTML and CSS - Print Method
  const generateInvoice = (payment) => {
    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Invoice - ${payment._id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #2874f0;
            border-radius: 10px;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2874f0;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2874f0;
            margin: 0;
            font-size: 28px;
          }
          .company-info {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .detail-section h3 {
            color: #2874f0;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .detail-item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: bold;
            color: #555;
          }
          .detail-value {
            color: #333;
          }
          .amount-highlight {
            background: #2874f0;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .payment-table th {
            background: #2874f0;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .payment-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          .payment-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
            font-style: italic;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-confirmed { background: #d4edda; color: #155724; }
          .status-delivered { background: #d1ecf1; color: #0c5460; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .status-shipped { background: #fff3cd; color: #856404; }
          
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-container { border: none; box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>PAYMENT INVOICE</h1>
          </div>
          
         <div class="invoice-details">
  <div class="detail-section">
    <h3>Invoice Information</h3>
    <div class="detail-item">
      <span class="detail-label">Invoice ID:</span>
      <span class="detail-value">${payment._id || "N/A"}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Date:</span>
      <span class="detail-value">${new Date(payment.createdAt).toLocaleString()}</span>
    </div>
  </div>

  <div class="detail-section">
    <h3>Customer Information</h3>
    <div class="detail-item">
      <span class="detail-label">Name:</span>
      <span class="detail-value">${payment.userId?.name || "N/A"}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Mobile:</span>
      <span class="detail-value">${payment.userId?.mobile || "N/A"}</span>
    </div>
  </div>
</div>
          
          <div class="amount-highlight">
            Total Amount: ₹${payment.totalAmount || "0"}
          </div>
          
          <table class="payment-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Payment Method</strong></td>
                <td>${payment.paymentMethod || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Payment Status</strong></td>
                <td>
                  <span class="status-badge status-${payment.status?.toLowerCase() || 'confirmed'}">
                    ${payment.status || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Transaction Date</strong></td>
                <td>${new Date(payment.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Invoice Generated</strong></td>
                <td>${new Date().toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for your payment! This is computer generated invoice.</p>
            <p>For any queries, contact: support@company.com</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2874f0; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Invoice
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close Window
          </button>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Auto print after window loads
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">All Payments</h1>

      {/* Filters + Export */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
        >
          <FiFilter /> Filters
        </button>

        {filteredPayments.length > 0 && (
          <CSVLink
            {...prepareCSVData()}
            filename="payments-export.csv"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Payment Method
              </label>
              <select
                value={filterMethod}
                onChange={(e) => {
                  setFilterMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-1.5 border rounded text-sm"
              >
                <option value="">All Methods</option>
                {uniqueMethods.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
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
                className="w-full p-1.5 border rounded text-sm"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      )}

      {loading && <p className="text-center py-4">Loading payments...</p>}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border rounded shadow bg-white">
            <table className="w-full table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 text-left text-sm">#</th>
                  <th className="p-2 text-left text-sm">User</th>
                  <th className="p-2 text-left text-sm">Amount</th>
                  <th className="p-2 text-left text-sm">Method</th>
                  <th className="p-2 text-left text-sm">Status</th>
                  <th className="p-2 text-left text-sm">Date</th>
                  <th className="p-2 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((p, idx) => (
                    <tr
                      key={p._id}
                      className="border-b hover:bg-gray-50 align-top"
                    >
                      <td className="p-2 text-sm">{indexOfFirstItem + idx + 1}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {p.userId?.profileImage && (
                            <img
                              src={p.userId.profileImage}
                              alt={p.userId.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/32?text=No+Img")
                              }
                            />
                          )}
                          <div className="text-sm">
                            <div className="font-medium">
                              {p.userId?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.userId?.mobile || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 font-medium text-blue-700 text-sm">
                        ₹{p.totalAmount}
                      </td>
                      <td className="p-2 text-sm">{p.paymentMethod}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs ${
                            p.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : p.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : p.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : p.status === "Confirmed"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2 text-xs">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <FiDownload
                          onClick={() => generateInvoice(p)}
                          className="text-blue-500 cursor-pointer hover:text-blue-600 text-lg"
                          title="Download Receipt"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-3 text-center text-gray-500 text-sm"
                    >
                      No payments found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-3 py-1.5 rounded flex items-center text-sm ${
                  currentPage === 1
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
                className={`px-3 py-1.5 rounded flex items-center text-sm ${
                  currentPage === totalPages || totalPages === 0
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
    </div>
  );
}