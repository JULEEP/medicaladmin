import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEdit3, FiX } from "react-icons/fi";
import { FaCloudUploadAlt } from "react-icons/fa";

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [images, setImages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  // ✅ Fetch all banners
  const fetchBanners = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/getallbanners");
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error("Error fetching banners", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ✅ Handle file change
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ✅ Create banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      await axios.post(
        "http://31.97.206.144:7021/api/admin/createplan",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImages([]);
      fetchBanners();
      alert("Banner created successfully!");
    } catch (error) {
      console.error("Error creating banner", error);
      alert("Error creating banner");
    }
  };

  // ✅ Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      await axios.put(
        `http://31.97.206.144:7021/api/admin/updatebanner/${editId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImages([]);
      setEditId(null);
      setIsEditOpen(false);
      fetchBanners();
      alert("Banner updated successfully!");
    } catch (error) {
      console.error("Error updating banner", error);
      alert("Error updating banner");
    }
  };

  // ✅ Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    
    try {
      await axios.delete(
        `http://31.97.206.144:7021/api/admin/deletebanner/${id}`
      );
      fetchBanners();
      alert("Banner deleted successfully!");
    } catch (error) {
      console.error("Error deleting banner", error);
      alert("Error deleting banner");
    }
  };

  // ✅ Open edit popup
  const openEditPopup = (banner) => {
    setEditId(banner._id);
    setSelectedBanner(banner);
    setIsEditOpen(true);
  };

  // ✅ Close edit popup
  const closeEditPopup = () => {
    setEditId(null);
    setSelectedBanner(null);
    setImages([]);
    setIsEditOpen(false);
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Upload Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Upload New Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom File Upload */}
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <FaCloudUploadAlt className="text-5xl text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max 5MB)</p>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Selected files:</p>
              <ul className="text-sm text-gray-600">
                {images.map((img, index) => (
                  <li key={index}>{img.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded w-full hover:bg-blue-700 transition"
          >
            Upload Banner
          </button>
        </form>
      </div>

      {/* Right: Banner Table */}
      <div className="bg-white shadow-lg rounded-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">All Banners</h2>
        {banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No banners found. Upload your first banner!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 border">Preview</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b._id} className="text-center hover:bg-gray-50">
                    <td className="p-2 border">
                      <img
                        src={b.images[0]}
                        alt="banner"
                        className="h-16 w-32 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditPopup(b)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Update Banner</h3>
              <button
                onClick={closeEditPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Banner:</h4>
              <img
                src={selectedBanner?.images[0]}
                alt="Current banner"
                className="h-32 w-full object-cover rounded border"
              />
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex flex-col items-center justify-center w-full">
                <label
                  htmlFor="edit-file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <FaCloudUploadAlt className="text-3xl text-blue-600 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload new banner image
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max 5MB)</p>
                  <input
                    id="edit-file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">New files to upload:</p>
                  <ul className="text-sm text-gray-600">
                    {images.map((img, index) => (
                      <li key={index}>{img.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditPopup}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;