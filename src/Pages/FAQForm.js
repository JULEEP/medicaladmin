import React, { useState, useEffect } from "react";
import axios from "axios";
import { RiDeleteBin6Line } from "react-icons/ri"; // Importing the delete icon

const FAQForm = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("rider"); // Default to 'rider'
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch FAQs from backend on component mount
  const fetchFAQs = async () => {
    try {
      const response = await axios.get("http://31.97.206.144:7021/api/admin/allfaq");
      setFaqList(response.data.faqs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setErrorMessage("Failed to load FAQs.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://31.97.206.144:7021/api/admin/createfaq", {
        question,
        answer,
        date,
        type,  // Send the selected type to the backend
      });

      if (response.status === 201) {
        setSuccessMessage("FAQ added successfully!");
        setErrorMessage("");
        setQuestion("");
        setAnswer("");
        setDate("");
        setType("rider"); // Reset type to 'rider' after form submission
        fetchFAQs(); // 🔁 Refresh the list after creation
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      setSuccessMessage("");
      setErrorMessage(
        error.response?.data?.message || "Failed to add FAQ. Try again."
      );
    }
  };

  // ✅ Handle FAQ Deletion
 const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this FAQ?");
  if (!confirmDelete) return; // If cancelled, do nothing

  try {
    const response = await axios.delete(`http://31.97.206.144:7021/api/admin/deletefaq/${id}`);
    if (response.status === 200) {
      setSuccessMessage("FAQ deleted successfully!");
      setErrorMessage("");
      fetchFAQs(); // Refresh the list after deletion
    }
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    setSuccessMessage("");
    setErrorMessage(error.response?.data?.message || "Failed to delete FAQ.");
  }
};


  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Create FAQ</h2>

      {/* ✅ Success or Error Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* ✅ FAQ Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            Question
          </label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter your FAQ question"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
            Answer
          </label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            placeholder="Enter the answer to the question"
            rows="6"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            required
          />
        </div>

        {/* ✅ Type Selection */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            FAQ Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
            required
          >
            <option value="rider">Rider</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save FAQ
          </button>
        </div>
      </form>

      {/* ✅ FAQ List Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All FAQs</h3>

        {loading ? (
          <p className="text-gray-600">Loading FAQs...</p>
        ) : faqList.length === 0 ? (
          <p className="text-gray-600">No FAQs available.</p>
        ) : (
          <ul className="space-y-4">
            {faqList.map((faq) => (
              <li key={faq._id} className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{faq.question}</p>
                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                    <p className="text-sm text-gray-400 mt-1">Date: {new Date(faq.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-400 mt-1">Type: {faq.type}</p> {/* Display type */}
                  </div>
                  {/* ✅ Delete Button */}
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FAQForm;
