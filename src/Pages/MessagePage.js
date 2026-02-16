import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEye, FiSearch } from "react-icons/fi";

const API = "http://31.97.206.144:7021/api/admin";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // FETCH
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/allmessages`);
      setMessages(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    await axios.delete(`${API}/deletemessages/${id}`);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  // SEARCH FILTER
  const filteredMessages = messages.filter((m) =>
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredMessages.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          📩 Vendor Messages
        </h2>

        {/* SEARCH */}
        <div className="flex items-center bg-white shadow px-4 py-2 rounded-xl border">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            placeholder="Search message..."
            className="outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr>
              <th className="p-4">S.No</th>
              <th className="p-4 text-left">Vendors</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Sent At</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-10">
                  Loading messages...
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((m, index) => (
                <tr key={m._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {startIndex + index + 1}
                  </td>

                  <td className="p-4">
                    {m.vendorIds?.length > 0
                      ? m.vendorIds.map(v => v.name || v.vendorName).join(", ")
                      : "Deleted Vendor"}
                  </td>

                  <td className="p-4 max-w-[300px] truncate">
                    {m.message}
                  </td>

                  <td className="p-4">{formatDate(m.sentAt)}</td>

                  <td className="p-4 text-center space-x-3">
                    <button onClick={() => setSelectedMessage(m)}>
                      <FiEye className="text-green-600 hover:text-green-800" />
                    </button>
                    <button onClick={() => handleDelete(m._id)}>
                      <FiTrash2 className="text-red-600 hover:text-red-800" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-10 text-gray-500">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-5">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">📩 Message Details</h3>

            <p className="mb-3">
              <strong>Vendors:</strong>{" "}
              {selectedMessage.vendorIds?.map(v => v.name || v.vendorName).join(", ")}
            </p>

            <p className="mb-3">
              <strong>Message:</strong> {selectedMessage.message}
            </p>

            <p className="mb-5">
              <strong>Sent At:</strong> {formatDate(selectedMessage.sentAt)}
            </p>

            <div className="text-right">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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

export default MessagesPage;
