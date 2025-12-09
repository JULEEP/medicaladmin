import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SingleOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);

  // ✅ CALCULATE FINAL AMOUNT WITH ALL CHARGES
  const calculateFinalAmount = (order) => {
    if (!order) return 0;
    
    const subtotal = order.totalAmount || 0;
    const deliveryCharge = order.deliveryCharge || 0;
    const platformCharge = order.platformCharge || 0;
    const discountAmount = order.discountAmount || 0;
    
    // ✅ FINAL AMOUNT = Subtotal + Delivery + Platform - Discount
    const finalAmount = subtotal + deliveryCharge + platformCharge - discountAmount;
    
    return Math.max(0, finalAmount); // Ensure non-negative amount
  };

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://31.97.206.144:7021/api/admin/singleorder/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch order");
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const generatePDF = () => {
    if (!order) return;

    const finalAmount = calculateFinalAmount(order);

    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 13px;
              color: #333;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .header-table td {
              vertical-align: top;
              padding: 5px;
            }
            .company-logo {
              height: 60px;
            }
            h1 {
              font-size: 18px;
              margin: 0 0 8px 0;
              color: #2c3e50;
            }
            h2 {
              font-size: 15px;
              margin: 20px 0 8px 0;
              color: #2c3e50;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background: #f2f2f2;
            }
            .thankyou {
              margin-top: 30px;
              text-align: center;
              font-style: italic;
              color: #555;
            }
            .amount-breakdown {
              margin-top: 20px;
              width: 100%;
            }
            .amount-breakdown td {
              padding: 4px 0;
              border: none;
            }
            .amount-breakdown .total-row {
              border-top: 1px solid #ccc;
              font-weight: bold;
              padding-top: 8px;
            }
            @media print {
              body { background: white; padding: 0; }
              th { background: #e0e0e0 !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>

          <!-- Company + Invoice Info -->
          <table class="header-table">
            <tr>
              <td style="width:60%">
                <img src="/logo.jpg" alt="Company Logo" class="company-logo"/><br/>
                <h1>Tax Invoice</h1>
                <strong>CLYNIX LIMITED</strong><br/>
                Address: 1-31, Chhediga dibbalu, Indrapalem, Kakinada.<br/>
                State: Andhra Pradesh<br/>
                Email ID: order@clynix.com
              </td>
              <td style="width:40%; text-align:right;">
                <strong>PAN:</strong> KKHNDXXXXX<br/>
                <strong>CIN:</strong> QW4321ddXXXXXXX<br/>
                <strong>GSTIN:</strong> 38ABLDGJ3XXXXXXX<br/>
                <strong>Invoice No:</strong> ${order._id}<br/>
                <strong>Invoice Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br/>
                <strong>Current Status:</strong> ${order.status || "Pending"}
              </td>
            </tr>
          </table>

          <!-- Customer Details -->
          <h2>Customer Details</h2>
          <p>
            <strong>Name:</strong> ${order.userId?.name || "N/A"}<br/>
            <strong>Mobile:</strong> ${order.userId?.mobile || "N/A"}<br/>
            <strong>Email:</strong> ${order.userId?.email || "N/A"}<br/>
            <strong>Delivery Address:</strong> ${[
              order.deliveryAddress?.house,
              order.deliveryAddress?.street,
              order.deliveryAddress?.city,
              order.deliveryAddress?.state + ' - ' + order.deliveryAddress?.pincode,
              order.deliveryAddress?.country
            ].filter(Boolean).join(", ")}
          </p>

          <!-- Service Details -->
          <h2>Service Details</h2>
          <p>
            <strong>HSN Code:</strong> 999799<br/>
            <strong>Supply Description:</strong> Other Services N.E.C
          </p>

          <!-- Ordered Medicines -->
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Medicine</th>
                <th>Pharmacy</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                order.orderItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.medicineId?.name || "N/A"}</td>
                    <td>${item.medicineId?.pharmacyId?.name || "N/A"}</td>
                    <td>₹${item.medicineId?.price?.toFixed(2) || '0.00'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>₹${((item.medicineId?.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>

          <!-- Amount Breakdown -->
          <h2 style="text-align:right">Payment Info</h2>
          <div style="text-align:right">
            <table class="amount-breakdown">
              <tr>
                <td style="text-align:right;">Subtotal:</td>
                <td style="text-align:right; width:100px;">₹${(order.totalAmount || 0).toFixed(2)}</td>
              </tr>
              ${order.deliveryCharge ? `
              <tr>
                <td style="text-align:right;">Delivery Charge:</td>
                <td style="text-align:right;">₹${(order.deliveryCharge || 0).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.platformCharge ? `
              <tr>
                <td style="text-align:right;">Platform Charge:</td>
                <td style="text-align:right;">₹${(order.platformCharge || 0).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${order.discountAmount ? `
              <tr>
                <td style="text-align:right;">Discount:</td>
                <td style="text-align:right;">-₹${(order.discountAmount || 0).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td style="text-align:right;"><strong>Final Amount:</strong></td>
                <td style="text-align:right;"><strong>₹${finalAmount.toFixed(2)}</strong></td>
              </tr>
            </table>
            <p style="text-align:right; margin-top:10px;">
              <strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}<br/>
              <strong>Payment Status:</strong> ${order.paymentStatus || "N/A"}<br/>
              ${order.transactionId ? `<strong>Transaction ID:</strong> ${order.transactionId}<br/>` : ''}
              <strong>Notes:</strong> ${order.notes || "No notes"}
            </p>
          </div>

          <p class="thankyou">Thank you for your order!</p>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const newWindow = window.open("", "_blank");
    newWindow.document.open();
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();
  };

  if (loading) return <div className="p-6">Loading order details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-6">No order found.</div>;

  const finalAmount = calculateFinalAmount(order);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:underline">
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <button onClick={generatePDF} className="flex items-center text-green-600 hover:underline">
          <FiDownload className="mr-1" /> Download Invoice
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      {/* Customer Info */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Customer Info</h2>
        <div className="flex items-center gap-3">
          {order.userId?.profileImage && (
            <img src={order.userId.profileImage} alt="User" className="w-12 h-12 rounded-full object-cover" />
          )}
          <div>
            <div className="font-bold">{order.userId?.name}</div>
            <div className="text-sm text-gray-600">{order.userId?.mobile}</div>
            <div className="text-sm text-gray-600">{order.userId?.email}</div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Delivery Address</h2>
        <p>
          {order.deliveryAddress?.house}, {order.deliveryAddress?.street},<br />
          {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}, {order.deliveryAddress?.country}
        </p>
      </div>

      {/* Rider Details */}
      {order.assignedRider && (
        <div className="mb-6 border-b pb-4">
          <h2 className="font-semibold text-lg mb-2">Assigned Rider</h2>
          <div className="flex items-center gap-3">
            {order.assignedRider.profileImage && (
              <img src={order.assignedRider.profileImage} alt="Rider" className="w-12 h-12 rounded-full object-cover" />
            )}
            <div>
              <div className="font-bold">{order.assignedRider.name}</div>
              <div className="text-sm text-gray-600">Phone: {order.assignedRider.phone}</div>
              <div className="text-sm text-gray-600">Email: {order.assignedRider.email}</div>
              <div className="text-sm text-gray-600">Location: {order.assignedRider.latitude}, {order.assignedRider.longitude}</div>
              <div className="text-sm text-gray-600">Status: {order.assignedRiderStatus}</div>
            </div>
          </div>
        </div>
      )}

      {/* Medicines */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Ordered Medicines</h2>
        {order.orderItems?.map((item, idx) => (
          <div key={idx} className="border p-3 rounded mb-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{item.medicineId?.name}</div>
                <div className="text-sm text-gray-600">
                  ₹{item.medicineId?.price} × {item.quantity}
                </div>
                {item.medicineId?.description && (
                  <div className="text-xs text-gray-500">{item.medicineId.description}</div>
                )}
                {item.medicineId?.pharmacyId && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.medicineId.pharmacyId.name} —{" "}
                    {item.medicineId.pharmacyId.location?.coordinates?.join(", ")}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {item.medicineId?.images?.map((img, i) => (
                  <img key={i} src={img} alt="med" className="w-12 h-12 object-cover rounded border" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Info */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Payment & Charges</h2>
        <div className="space-y-2">
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          {order.transactionId && <p><strong>Transaction ID:</strong> {order.transactionId}</p>}
          {order.deliveryCharge && <p><strong>Delivery Charge:</strong> ₹{order.deliveryCharge}</p>}
          {order.platformCharge && <p><strong>Platform Charge:</strong> ₹{order.platformCharge}</p>}
          {order.discountAmount > 0 && <p><strong>Discount Amount:</strong> ₹{order.discountAmount}</p>}
          {order.couponCode && <p><strong>Coupon Code:</strong> {order.couponCode}</p>}
          {order.codAmountReceived > 0 && <p><strong>COD Amount Received:</strong> ₹{order.codAmountReceived}</p>}
          <p><strong>Notes:</strong> {order.notes || "No notes"}</p>
          {order.voiceNoteUrl && (
            <div className="mt-2">
              <strong>Voice Note:</strong>
              <audio controls src={order.voiceNoteUrl} className="mt-1" />
            </div>
          )}
        </div>
      </div>

      {/* Order Information */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Current Status:</strong> {order.status}</p>
            <p><strong>Pharmacy Response:</strong> {order.pharmacyResponse}</p>
            <p><strong>Prescription Order:</strong> {order.isPrescriptionOrder ? "Yes" : "No"}</p>
          </div>
          <div>
            <p><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
            <p><strong>Reordered:</strong> {order.isReordered ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>

      {/* Delivery Proof */}
      {order.deliveryProof?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Delivery Proof</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {order.deliveryProof.map((proof, idx) => (
              <div
                key={idx}
                className="border rounded overflow-hidden shadow-sm cursor-pointer hover:shadow-md"
                onClick={() => setSelectedProof(proof)}
              >
                <img
                  src={proof.imageUrl}
                  alt={`Delivery Proof ${idx + 1}`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 text-xs text-gray-600">
                  Uploaded At: {new Date(proof.uploadedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before Pickup Proof */}
      {order.beforePickupProof?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Before Pickup Proof</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {order.beforePickupProof.map((proof, idx) => (
              <div
                key={idx}
                className="border rounded overflow-hidden shadow-sm cursor-pointer hover:shadow-md"
                onClick={() => setSelectedProof(proof)}
              >
                <img
                  src={proof.imageUrl}
                  alt={`Before Pickup Proof ${idx + 1}`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 text-xs text-gray-600">
                  Uploaded At: {new Date(proof.uploadedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Delivery Proof Image */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-0">
          <div className="bg-white p-4 rounded-lg w-[90%] max-w-md shadow-lg relative border">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg"
              onClick={() => setSelectedProof(null)}
            >
              ✕
            </button>

            <img
              src={selectedProof.imageUrl}
              alt="Delivery Proof Full"
              className="w-full h-auto rounded object-contain"
            />

            <div className="mt-2 text-xs text-center text-gray-600">
              Uploaded At: {new Date(selectedProof.uploadedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="mb-6 border-b pb-4">
        <h2 className="font-semibold text-lg mb-2">Status Timeline</h2>
        {order.statusTimeline?.map((status, i) => (
          <div key={i} className="text-sm mb-2">
            <span className="font-bold">{status.status}</span> - {status.message}
            <div className="text-gray-500">{new Date(status.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* ✅ UPDATED SUMMARY WITH CALCULATED FINAL AMOUNT */}
      <div className="mt-6 border-t pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
          </div>
          {order.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Delivery Charge:</span>
              <span>+ ₹{(order.deliveryCharge || 0).toFixed(2)}</span>
            </div>
          )}
          {order.platformCharge > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Platform Charge:</span>
              <span>+ ₹{(order.platformCharge || 0).toFixed(2)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Discount:</span>
              <span>- ₹{(order.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Final Amount:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}