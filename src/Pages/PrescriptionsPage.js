import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEye } from "react-icons/fi";

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:7021/api/admin/alluploadprescription"
      );
      setPrescriptions(res.data.prescriptions || []);
      setTotal(res.data.prescriptions.length || 0)
    } catch (error) {
      console.error("Error fetching prescriptions", error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prescription?")) return;
    try {
      await axios.delete(
        `http://31.97.206.144:7021/api/admin/deleteprescription/${id}`
      );
      const updated = prescriptions.filter((p) => p._id !== id);
      setPrescriptions(updated);

      // Reset to previous page if last item of last page is deleted
      if ((currentPage - 1) * pageSize >= updated.length && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      alert("Deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete.");
    }
  };

  const totalPages = Math.ceil(prescriptions.length / pageSize);
  const paginatedData = prescriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📄 All Received Prescriptions ({total})
      </h2>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-blue-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 text-left">S NO</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Uploaded At</th>
              <th className="p-3 text-left">Prescription File</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((p, index) => (
                <tr
                  key={p._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{(currentPage - 1)*pageSize + index + 1}</td>
                  <td className="p-3">{p.userId?.name || "Deleted User"}</td>
                  <td className="p-3">{p.notes || "-"}</td>
                  <td className="p-3">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 max-w-xs break-words">
                    <a
                      href={p.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open File
                    </a>
                  </td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-center space-x-3">
                    <button onClick={() => setSelectedPrescription(p)}>
                      <FiEye className="inline-block text-green-600 hover:text-green-800" />
                    </button>
                    <button onClick={() => handleDelete(p._id)}>
                      <FiTrash2 className="inline-block text-red-600 hover:text-red-800" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="6">
                  No prescriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
      {prescriptions.length > pageSize && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ Preview Modal */}
     {selectedPrescription && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-20">
    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative pointer-events-auto">
      <h3 className="text-lg font-bold mb-4">📋 Prescription Details</h3>

      <p className="mb-2">
        <strong>User:</strong>{" "}
        {selectedPrescription.userId?.name || "Deleted User"}
      </p>
      <p className="mb-2">
        <strong>Notes:</strong> {selectedPrescription.notes || "-"}
      </p>

      <div className="mb-2">
        <strong>Prescription URL:</strong>{" "}
        <a
          href={selectedPrescription.prescriptionUrl}
          className="text-blue-600 underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {selectedPrescription.prescriptionUrl}
        </a>
      </div>

      <div className="mb-2">
        <strong>Status:</strong> {selectedPrescription.status}
      </div>

      <div className="my-4">
        {selectedPrescription.prescriptionUrl.endsWith(".pdf") ? (
          <>
            <iframe
              src={selectedPrescription.prescriptionUrl}
              title="PDF Preview"
              className="w-full h-64 border rounded mb-2"
            />
            <div className="flex gap-4">
              <a
                href={selectedPrescription.prescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
              >
                Open PDF
              </a>
              <a
                href={selectedPrescription.prescriptionUrl}
                download
                className="text-sm px-3 py-1 bg-green-600 text-white rounded"
              >
                Download PDF
              </a>
            </div>
          </>
        ) : (
          <>
            <img
              src={selectedPrescription.prescriptionUrl}
              alt="Prescription"
              className="w-full h-auto max-h-64 object-contain border rounded mb-2"
            />
            <div className="flex gap-4">
              <a
                href={selectedPrescription.prescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
              >
                Open Image
              </a>
              <a
                href={selectedPrescription.prescriptionUrl}
                download
                className="text-sm px-3 py-1 bg-green-600 text-white rounded"
              >
                Download Image
              </a>
            </div>
          </>
        )}
      </div>

      <div className="text-right mt-4">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => setSelectedPrescription(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PrescriptionsPage;
