import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import axios from "axios";

const AdsList = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://31.97.206.144:7021/api/admin/allads");
      setAds(res.data.ads || []);
    } catch (error) {
      console.error("Fetch Ads Error:", error);
      setMessage("Failed to fetch ads. Try again!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // ✅ Delete Ad
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      await axios.delete(`http://31.97.206.144:7021/api/admin/deleteads/${id}`);
      setMessage("Ad deleted successfully!");
      setAds(ads.filter((ad) => ad._id !== id));
    } catch (error) {
      console.error("Delete Ad Error:", error);
      setMessage("Failed to delete ad. Try again!");
    }
  };

  // ✅ Update Ad (just example: only title update)
  const handleUpdate = async (id) => {
    const newTitle = prompt("Enter new title:");
    if (!newTitle) return;

    try {
      await axios.put(`http://31.97.206.144:7021/api/admin/updateads/${id}`, {
        title: newTitle,
      });

      setMessage("Ad updated successfully!");
      setAds(
        ads.map((ad) =>
          ad._id === id ? { ...ad, title: newTitle } : ad
        )
      );
    } catch (error) {
      console.error("Update Ad Error:", error);
      setMessage("Failed to update ad. Try again!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Ads</h2>

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

      {loading ? (
        <p className="text-center text-gray-600">Loading ads...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full table-auto">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Link</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length > 0 ? (
                ads.map((ad) => (
                  <tr
                    key={ad._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-24 h-24 object-cover rounded-lg shadow"
                      />
                    </td>
                    <td className="p-3 font-semibold text-gray-800">
                      {ad.title}
                    </td>
                    <td className="p-3">
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                      >
                        Visit Link
                      </a>
                    </td>
                    <td className="p-3 flex gap-3 justify-center">
                      <button
                        onClick={() => handleUpdate(ad._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                      >
                        <FiEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                      >
                        <FiTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-6 text-gray-600"
                  >
                    No ads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdsList;
