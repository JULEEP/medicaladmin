import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiEye, FiFilter, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    price: "",
    mrp: "",
    description: "",
    categoryName: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    pharmacy: ""
  });

  const navigate = useNavigate();
  const itemsPerPage = 5;

  const fetchMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://31.97.206.144:7021/api/pharmacy/allmedicine");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch medicines");

      setMedicines(data.medicines || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;

    try {
      const res = await fetch(`http://31.97.206.144:7021/api/pharmacy/deletemedicine/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      alert("Medicine deleted successfully!");
      fetchMedicines();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const openEditPopup = (med) => {
    setEditData({
      id: med.medicineId,
      name: med.name,
      price: med.price,
      mrp: med.mrp || "",
      description: med.description,
      categoryName: med.categoryName || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://31.97.206.144:7021/api/pharmacy/updatemedicine/${editData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editData.name,
            price: editData.price,
            mrp: editData.mrp,
            description: editData.description,
            categoryName: editData.categoryName,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      alert("Medicine updated successfully!");
      setIsEditOpen(false);
      fetchMedicines();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // Filter medicines based on filter criteria
  const filteredMedicines = medicines.filter(med => {
    const nameMatch = !filters.name ||
      med.name.toLowerCase().includes(filters.name.toLowerCase());
    const categoryMatch = !filters.category ||
      (med.categoryName && med.categoryName.toLowerCase().includes(filters.category.toLowerCase()));
    const minPriceMatch = !filters.minPrice ||
      (med.price && Number(med.price) >= Number(filters.minPrice));
    const maxPriceMatch = !filters.maxPrice ||
      (med.price && Number(med.price) <= Number(filters.maxPrice));
    const pharmacyMatch = !filters.pharmacy ||
      (med.pharmacy?.name && med.pharmacy.name.toLowerCase().includes(filters.pharmacy.toLowerCase()));

    return nameMatch && categoryMatch && minPriceMatch && maxPriceMatch && pharmacyMatch;
  });

  // Prepare data for CSV export
  const prepareCSVData = () => {
    const headers = [
      { label: "Medicine ID", key: "medicineId" },
      { label: "Name", key: "name" },
      { label: "Price (₹)", key: "price" },
      { label: "MRP (₹)", key: "mrp" },
      { label: "Category", key: "category" },
      { label: "Description", key: "description" },
      { label: "Pharmacy", key: "pharmacy" },
      { label: "Location", key: "address" },
      { label: "Image Count", key: "imageCount" }
    ];

    const data = filteredMedicines.map(med => ({
      medicineId: med.medicineId,
      name: med.name,
      price: med.price,
      mrp: med.mrp || "N/A",
      category: med.categoryName || "N/A",
      description: med.description || "N/A",
      pharmacy: med.pharmacy?.name || "N/A",
      location: med.pharmacy?.address || 'N/A',
      imageCount: med.images?.length || 0
    }));

    return { headers, data };
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(
    medicines
      .map(med => med.categoryName)
      .filter(cat => cat)
  )].sort();

  // Get unique pharmacies for filter dropdown
  const uniquePharmacies = [...new Set(
    medicines
      .map(med => med.pharmacy?.name)
      .filter(pharm => pharm)
  )].sort();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Medicines List</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            <FiFilter /> Filters
          </button>
          {filteredMedicines.length > 0 && (
            <CSVLink
              {...prepareCSVData()}
              filename="medicines-export.csv"
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-green-700 no-underline"
              style={{ textDecoration: "none" }}
            >
              <FiDownload /> Export CSV
            </CSVLink>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded shadow-md mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => {
                  setFilters({ ...filters, name: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Search by name"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters({ ...filters, category: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy</label>
              <select
                value={filters.pharmacy}
                onChange={(e) => {
                  setFilters({ ...filters, pharmacy: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">All Pharmacies</option>
                {uniquePharmacies.map((pharmacy, index) => (
                  <option key={index} value={pharmacy}>{pharmacy}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => {
                  setFilters({ ...filters, minPrice: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Minimum price"
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters({ ...filters, maxPrice: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Maximum price"
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </div>
        </div>
      )}

      {loading && <p>Loading medicines...</p>}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border rounded shadow bg-white">
            <table className="w-full table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Images</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">MRP</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Pharmacy Name</th>
                  <th className="p-3 text-left">Pharmacy Location</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((med, idx) => {
                    const discount = med.mrp && med.price ?
                      Math.round(((med.mrp - med.price) / med.mrp) * 100) : 0;

                    return (
                      <tr
                        key={med.medicineId}
                        className="border-b hover:bg-gray-50 align-top"
                      >
                        <td className="p-3">{indexOfFirstItem + idx + 1}</td>
                        <td className="p-3 font-semibold">{med.name}</td>
                        <td className="p-3">
                          {med.images && med.images.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {med.images.slice(0, 3).map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={med.name}
                                  className="w-16 h-16 rounded object-cover border"
                                  onError={(e) =>
                                  (e.target.src =
                                    "https://via.placeholder.com/80?text=No+Image")
                                  }
                                />
                              ))}
                              {med.images.length > 3 && (
                                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center border">
                                  +{med.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <img
                              src="https://via.placeholder.com/80?text=No+Image"
                              alt="No image"
                              className="w-16 h-16 rounded object-cover border"
                            />
                          )}
                        </td>
                        <td className="p-3 text-blue-700 font-bold">
                          ₹{med.price}
                        </td>
                        <td className="p-3">
                          {med.mrp ? (
                            <span>₹{med.mrp}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3">
                          {med.categoryName || (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3">{med.pharmacy?.name || (
                          <span className="text-gray-400">N/A</span>
                        )}</td>
                        <td className="p-3">
                          {med.pharmacy?.address || (
                            <span className="text-gray-400">N/A</span>
                          )}</td>
                        <td className="p-3 flex space-x-3 text-lg">
                          <FiEye
                            onClick={() => navigate(`/medicine/${med.medicineId}`)}
                            className="text-green-500 cursor-pointer hover:text-green-600"
                            title="View"
                          />
                          <FiEdit
                            onClick={() => openEditPopup(med)}
                            className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                            title="Edit"
                          />
                          <FiTrash
                            onClick={() => handleDelete(med.medicineId)}
                            className="text-red-500 cursor-pointer hover:text-red-600"
                            title="Delete"
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="p-4 text-center text-gray-500 font-medium"
                    >
                      {medicines.length === 0
                        ? "No medicines found."
                        : "No medicines match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-3 py-1 border rounded ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Popup */}
      {isEditOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Medicine</h2>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Name"
              className="w-full border p-2 mb-3 rounded"
            />
            <input
              type="number"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              placeholder="Price"
              className="w-full border p-2 mb-3 rounded"
              min="0"
            />
            <input
              type="number"
              value={editData.mrp}
              onChange={(e) => setEditData({ ...editData, mrp: e.target.value })}
              placeholder="MRP"
              className="w-full border p-2 mb-3 rounded"
              min="0"
            />
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="Description"
              className="w-full border p-2 mb-3 rounded"
              rows="3"
            ></textarea>
            <input
              type="text"
              value={editData.categoryName}
              onChange={(e) =>
                setEditData({ ...editData, categoryName: e.target.value })
              }
              placeholder="Category Name"
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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