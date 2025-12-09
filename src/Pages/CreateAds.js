import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateAds = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("link", link);
      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post("http://31.97.206.144:7021/api/admin/create-ads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);

      // ✅ Redirect after short delay
      setTimeout(() => {
        navigate("/adslist");
      }, 1000);

      setTitle("");
      setImage(null);
      setLink("");
    } catch (error) {
      console.error("Create Ad Error:", error);
      setMessage(
        error.response?.data?.message || "Failed to create ad. Try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Ad</h2>

        {message && (
          <p
            className={`mb-4 p-3 rounded-lg text-center ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title + Link Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Ad Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter ad title"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Ad Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Ad Image
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <FiUploadCloud className="text-4xl text-blue-500 mb-2" />
              <span className="text-gray-600">
                {image ? image.name : "Click to upload ad image"}
              </span>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
                required
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg shadow-md text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Ad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAds;
