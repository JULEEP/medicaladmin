import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CreateMedicine() {
  const [pharmacyId, setPharmacyId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [categories, setCategories] = useState([]);

  // For Category Popup
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", image: null });
  const [uploading, setUploading] = useState(false);

  // New loading state for medicine creation
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch pharmacies for dropdown
  useEffect(() => {
    fetch("http://31.97.206.144:7021/api/pharmacy/getallpjarmacy")
      .then((res) => res.json())
      .then((data) => setPharmacies(data?.pharmacies || []))
      .catch(() => setError("Failed to load pharmacies"));
  }, []);

  // Update categories when pharmacy changes
  useEffect(() => {
    if (pharmacyId) {
      const selectedPharmacy = pharmacies.find((p) => p._id === pharmacyId);
      setCategories(selectedPharmacy?.categories || []);
    } else {
      setCategories([]);
    }
    setCategoryName(""); // reset category when pharmacy changes
  }, [pharmacyId, pharmacies]);

  // Medicine Image Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // only one image
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Category Popup Handlers
  const openCategoryPopup = () => {
    setCategoryForm({ name: "", image: null });
    setShowCategoryPopup(true);
    setError("");
    setMessage("");
  };
  const handlePopupClose = () => {
    if (!uploading) setShowCategoryPopup(false);
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm((prev) => ({ ...prev, image: file }));
    }
  };

  // API call to update categories of the selected pharmacy
  const updatePharmacyCategories = async (categoryData) => {
    try {
      const formData = new FormData();

      const categoriesArray = [
        {
          name: categoryData.name.trim(),
          image: "", // Image will be uploaded separately
        },
      ];

      formData.append("categories", JSON.stringify(categoriesArray));

      if (categoryData.image instanceof File) {
        formData.append("categoryImages", categoryData.image);
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

  // Submit handler for category popup form
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!categoryForm.image) {
      setError("Category image is required");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const updatedPharmacy = await updatePharmacyCategories(categoryForm);
      // Update local categories state with new categories from updated pharmacy
      setCategories(updatedPharmacy.categories || []);
      setCategoryName(categoryForm.name.trim());
      setShowCategoryPopup(false);
      setMessage("Category added successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Medicine form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setMessage("");
    setError("");

    // Validate that MRP is not less than price
    if (mrp && parseFloat(mrp) < parseFloat(price)) {
      setError("MRP cannot be less than selling price");
      return;
    }

    setIsLoading(true); // Set loading state when submission starts

    const formData = new FormData();
    formData.append("pharmacyId", pharmacyId);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("mrp", mrp);
    formData.append("description", description);
    formData.append("categoryName", categoryName);
    if (image) formData.append("images", image);

    try {
      const res = await fetch(
        "http://31.97.206.144:7021/api/pharmacy/create-medicine",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);
      alert("Medicine created successfully. Click OK to continue.");

      // Reset form
      setName("");
      setPrice("");
      setMrp("");
      setDescription("");
      setCategoryName("");
      setImage(null);
      setImagePreview(null);
      setPharmacyId("");
      setCategories([]);

      navigate("/medicinelist");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Reset loading state whether success or error
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Create Medicine</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow border"
      >
        {/* Pharmacy Select */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Pharmacy</label>
          <select
            value={pharmacyId}
            onChange={(e) => setPharmacyId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Pharmacy --</option>
            {pharmacies.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Select */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Category</label>
          <select
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={!categories.length}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Always show Add Category button */}
          {pharmacyId && (
            <div className="mt-2">
              <button
                type="button"
                onClick={openCategoryPopup}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Add Category
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Medicine Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Price & MRP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="any"
              min="0"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">MRP (₹)</label>
            <input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              step="any"
              min="0"
              className="w-full p-2 border rounded"
            />
            {mrp && price && parseFloat(mrp) > parseFloat(price) && (
              <p className="text-sm text-green-600 mt-1">
                Discount: {Math.round(((mrp - price) / mrp) * 100)}% off
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Upload Image */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload Image</label>
          <label className="flex items-center p-2 border-2 border-dashed border-blue-400 rounded cursor-pointer hover:bg-blue-50 transition">
            <FaCloudUploadAlt className="text-xl mr-2 text-blue-600" />
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {imagePreview && (
            <div className="mt-3 flex items-center space-x-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="text-red-600 hover:text-red-800 flex items-center"
              >
                <FaTrash className="mr-1" /> Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            type="submit"
            disabled={isLoading} // Disable button when loading
            className={`px-6 py-2 rounded ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {isLoading ? "Creating..." : "Create Medicine"}
          </button>
        </div>
      </form>

      {/* Category Popup */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Category</h3>
              <button
                onClick={handlePopupClose}
                className="text-gray-500 hover:text-gray-700"
                disabled={uploading}
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
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter category name"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  disabled={uploading}
                />
                {categoryForm.image instanceof File && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected file: {categoryForm.image.name}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePopupClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}