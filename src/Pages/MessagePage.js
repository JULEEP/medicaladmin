import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiEye } from "react-icons/fi";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // ✅ Fetch all messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/allmessages");
      setMessages(res.data || []);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Delete a message
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`http://31.97.206.144:7021/api/admin/deletemessages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      alert("Message deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete.");
    }
  };

  // ✅ Format date
  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleString(); // Full date-time format
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📩 All Messages</h2>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-blue-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 text-left">Vendor(s)</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Sent At</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {messages.length > 0 ? (
              messages.map((m) => (
                <tr
                  key={m._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">
                    {m.vendorIds && m.vendorIds.length > 0
                      ? m.vendorIds.map((v) => v.name || v.vendorName || "Unknown").join(", ")
                      : "Deleted Vendor(s)"}
                  </td>
                  <td className="p-3">{m.message || "No message content"}</td>
                  <td className="p-3">{formatDate(m.sentAt)}</td>
                  <td className="p-3 text-center space-x-3">
                    <button onClick={() => setSelectedMessage(m)}>
                      <FiEye className="inline-block text-green-600 hover:text-green-800" />
                    </button>
                    <button onClick={() => handleDelete(m._id)}>
                      <FiTrash2 className="inline-block text-red-600 hover:text-red-800" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="4">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     {/* ✅ Modal Preview */}
{selectedMessage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto shadow-md border border-gray-200 relative">
      <h3 className="text-lg font-bold mb-4">📩 Message Details</h3>

      <p className="mb-2">
        <strong>Vendors:</strong>{" "}
        {selectedMessage.vendorIds && selectedMessage.vendorIds.length > 0
          ? selectedMessage.vendorIds.map((v) => v.name || v.vendorName || "Unknown").join(", ")
          : "Deleted Vendor(s)"}
      </p>

      <p className="mb-2">
        <strong>Message:</strong> {selectedMessage.message || "-"}
      </p>

      <div className="mb-2">
        <strong>Sent At:</strong> {formatDate(selectedMessage.sentAt)}
      </div>

      <div className="text-right">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => setSelectedMessage(null)}
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
