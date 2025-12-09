import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PharmacyDetails() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPharmacy();
  }, [pharmacyId]);

  const fetchPharmacy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/singlepharmacy/${pharmacyId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pharmacy");

      setPharmacy(data.pharmacy);
      setMedicines(data.medicines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePharmacyCategories = async (categoryData, isEdit = false) => {
    try {
      const formData = new FormData();
      
      // Prepare categories array according to backend expectations
      let categoriesArray = [];
      
      if (isEdit && editingCategory) {
        // For edit: send only the edited category
        categoriesArray = [{
          _id: editingCategory._id,
          name: categoryData.name.trim(),
          image: categoryData.image instanceof File ? "" : categoryData.image // Keep existing image if not changed
        }];
      } else {
        // For add: send new category
        categoriesArray = [{
          name: categoryData.name.trim(),
          image: "" // Image will be uploaded separately
        }];
      }

      // Add categories as JSON string
      formData.append('categories', JSON.stringify(categoriesArray));
      
      // Add image file if provided
      if (categoryData.image instanceof File) {
        formData.append('categoryImages', categoryData.image);
      }

      const response = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${pharmacyId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      return data.pharmacy;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setError("Category name is required");
      return;
    }

    setUploading(true);
    try {
      const isEdit = !!editingCategory;
      const updatedPharmacy = await updatePharmacyCategories(categoryForm, isEdit);
      
      // Update local state
      setPharmacy(updatedPharmacy);
      
      setShowCategoryPopup(false);
      resetCategoryForm();
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      image: category.image // This will be a URL string initially
    });
    setShowCategoryPopup(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      // For deletion, we need to modify the backend to handle delete operations
      // Since your current backend doesn't support deletion, we'll need to update it
      // For now, let's implement a workaround by sending an empty update
      
      const formData = new FormData();
      // Send empty categories array to indicate no additions
      formData.append('categories', JSON.stringify([]));

      const response = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${pharmacyId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete failed");
      }

      // Since backend doesn't support deletion properly, refetch the data
      await fetchPharmacy();
    } catch (err) {
      setError(err.message);
    }
  };

  // Updated delete function that works with your backend structure
  const handleDeleteCategoryProper = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      // First, check if there are medicines in this category
      const medicinesInCategory = medicines.filter(med => 
        med.categoryId === categoryId || med.categoryName === pharmacy.categories.find(c => c._id === categoryId)?.name
      );

      if (medicinesInCategory.length > 0) {
        setError(`Cannot delete category. There are ${medicinesInCategory.length} medicines associated with it.`);
        return;
      }

      // Remove the category from local state first
      const updatedCategories = pharmacy.categories.filter(cat => cat._id !== categoryId);
      setPharmacy(prev => ({
        ...prev,
        categories: updatedCategories
      }));

      // Send update to backend with remaining categories
      const formData = new FormData();
      formData.append('categories', JSON.stringify(updatedCategories));

      const response = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/updatepharmacy/${pharmacyId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");

      // Update with backend response
      setPharmacy(data.pharmacy);
    } catch (err) {
      // Revert local state on error
      await fetchPharmacy();
      setError(err.message);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", image: "" });
    setEditingCategory(null);
  };

  const handlePopupClose = () => {
    setShowCategoryPopup(false);
    resetCategoryForm();
    setError(""); // Clear errors when closing popup
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm(prev => ({ ...prev, image: file }));
    }
  };

  const renderFileLink = (url) => {
    if (!url) return "N/A";
    const isPDF = url.endsWith(".pdf");
    return isPDF ? (
      <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View PDF</a>
    ) : (
      <img
        src={url}
        alt="Document"
        className="w-24 h-24 rounded object-cover border"
        onError={(e) =>
          (e.target.src = "https://via.placeholder.com/80?text=No+Image")
        }
      />
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format month for display (e.g., "2025-10" to "October 2025")
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p className="p-6">Loading pharmacy details...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!pharmacy) return <p className="p-6">No pharmacy found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      {/* ✅ Pharmacy Info */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Pharmacy Information</h2>
      </div>
      <table className="w-full mb-6 border">
        <tbody>
          <tr><td className="p-3 font-medium w-1/3">Name</td><td className="p-3">{pharmacy.name}</td></tr>
          <tr><td className="p-3 font-medium">Vendor Name</td><td className="p-3">{pharmacy.vendorName}</td></tr>
          <tr><td className="p-3 font-medium">Vendor Email</td><td className="p-3">{pharmacy.vendorEmail}</td></tr>
          <tr><td className="p-3 font-medium">Vendor Phone</td><td className="p-3">{pharmacy.vendorPhone}</td></tr>
          <tr><td className="p-3 font-medium">Vendor ID</td><td className="p-3">{pharmacy.vendorId}</td></tr>
          <tr><td className="p-3 font-medium">Password</td><td className="p-3">{pharmacy.password}</td></tr>
          <tr><td className="p-3 font-medium">Status</td><td className="p-3">{pharmacy.status}</td></tr>
          <tr><td className="p-3 font-medium">Address</td><td className="p-3">{pharmacy.address}</td></tr>
          <tr><td className="p-3 font-medium">Coordinates</td><td className="p-3">{pharmacy.latitude}, {pharmacy.longitude}</td></tr>
          <tr>
            <td className="p-3 font-medium">Pharmacy Image</td>
            <td className="p-3">
              <img
                src={pharmacy.image}
                alt={pharmacy.name}
                className="w-32 h-32 rounded object-cover"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/80?text=No+Image")
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ✅ Document Section */}
      <h2 className="text-xl font-semibold mb-2">Documents</h2>
      <table className="w-full mb-6 border">
        <tbody>
          <tr><td className="p-3 font-medium w-1/3">Aadhar Number</td><td className="p-3">{pharmacy.aadhar || "N/A"}</td></tr>
          <tr><td className="p-3 font-medium">Aadhar File</td><td className="p-3">{renderFileLink(pharmacy.aadharFile)}</td></tr>
          <tr><td className="p-3 font-medium">PAN Card Number</td><td className="p-3">{pharmacy.panCard || "N/A"}</td></tr>
          <tr><td className="p-3 font-medium">PAN Card File</td><td className="p-3">{renderFileLink(pharmacy.panCardFile)}</td></tr>
          <tr><td className="p-3 font-medium">License Number</td><td className="p-3">{pharmacy.license || "N/A"}</td></tr>
          <tr><td className="p-3 font-medium">License File</td><td className="p-3">{renderFileLink(pharmacy.licenseFile)}</td></tr>
        </tbody>
      </table>

      {/* ✅ Bank Details Section */}
      <h2 className="text-xl font-semibold mb-2">Bank Details</h2>
      {pharmacy.bankDetails && pharmacy.bankDetails.length > 0 ? (
        <table className="w-full mb-6 border">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Account Holder</th>
              <th className="p-3 text-left">Account Number</th>
              <th className="p-3 text-left">Bank Name</th>
              <th className="p-3 text-left">IFSC Code</th>
              <th className="p-3 text-left">Branch Name</th>
            </tr>
          </thead>
          <tbody>
            {pharmacy.bankDetails.map((bank, index) => (
              <tr key={bank._id || index} className="hover:bg-gray-100">
                <td className="p-3">{bank.accountHolderName}</td>
                <td className="p-3">{bank.accountNumber}</td>
                <td className="p-3">{bank.bankName}</td>
                <td className="p-3">{bank.ifscCode}</td>
                <td className="p-3">{bank.branchName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mb-6">No bank details found.</p>
      )}

      {/* ✅ Categories Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={() => setShowCategoryPopup(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {pharmacy.categories && pharmacy.categories.length > 0 ? (
        <table className="w-full mb-6 border">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Category Name</th>
              <th className="p-3 text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {pharmacy.categories.map((cat, index) => (
              <tr key={cat._id || index} className="hover:bg-gray-100">
                <td className="p-3">{cat.name}</td>
                <td className="p-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/80?text=No+Image")
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mb-6">No categories found.</p>
      )}

      {/* ✅ Medicines */}
      <h2 className="text-xl font-semibold mb-4">Medicines</h2>
      {medicines.length > 0 ? (
        <table className="w-full mb-6 border">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Price (₹)</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, index) => (
              <tr key={med._id} className="hover:bg-gray-100">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{med.name}</td>
                <td className="p-3">
                  <img
                    src={med.images?.[0]}
                    alt={med.name}
                    className="w-16 h-16 rounded object-cover"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/80?text=No+Image")
                    }
                  />
                </td>
                <td className="p-3">{med.price}</td>
                <td className="p-3">{med.categoryName || "Uncategorized"}</td>
                <td className="p-3">{med.description || "No description"}</td>
                <td className="p-3">{new Date(med.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mb-6">No medicines found.</p>
      )}

      {/* ✅ Payment History Section */}
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      {pharmacy.paymentHistory && pharmacy.paymentHistory.length > 0 ? (
        <div className="mb-6">
          <table className="w-full border">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Amount (₹)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {pharmacy.paymentHistory.map((payment, index) => (
                <tr key={payment._id} className="hover:bg-gray-100">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{formatMonth(payment.month)}</td>
                  <td className="p-3">₹{payment.amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(payment.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Summary Statistics */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800">Total Paid</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{pharmacy.paymentHistory
                  .filter(p => p.status === 'paid')
                  .reduce((sum, p) => sum + p.amount, 0)}
              </p>
              <p className="text-sm text-green-600">
                {pharmacy.paymentHistory.filter(p => p.status === 'paid').length} payments
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800">Total Payments</h3>
              <p className="text-2xl font-bold text-blue-600">
                {pharmacy.paymentHistory.length}
              </p>
              <p className="text-sm text-blue-600">all transactions</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Latest Payment</h3>
              <p className="text-lg font-bold text-gray-700">
                {pharmacy.paymentHistory.length > 0 ? formatMonth(pharmacy.paymentHistory[pharmacy.paymentHistory.length - 1].month) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {pharmacy.paymentHistory.length > 0 ? pharmacy.paymentHistory[pharmacy.paymentHistory.length - 1].status : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">No payment history found</p>
          <p className="text-gray-400 text-sm mt-2">Payment records will appear here once transactions are processed</p>
        </div>
      )}

      {/* ✅ Category Popup */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handlePopupClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image {!editingCategory && '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required={!editingCategory} // Required only for new categories
                />
                {categoryForm.image && typeof categoryForm.image === 'string' && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current image:</p>
                    <img
                      src={categoryForm.image}
                      alt="Preview"
                      className="mt-1 w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
                {categoryForm.image instanceof File && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected file: {categoryForm.image.name}
                  </div>
                )}
                {editingCategory && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current image
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePopupClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : (editingCategory ? "Update" : "Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}