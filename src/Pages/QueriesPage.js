import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FiTrash2,
  FiEdit3,
  FiSearch,
  FiDownload,
} from "react-icons/fi";

const QueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [type, setType] = useState("User");

  const [page, setPage] = useState(1);
  const limit = 8;

  // ✅ Fetch Queries
  const fetchQueries = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:7021/api/admin/allqueries"
      );
      setQueries(res.data);
    } catch (error) {
      console.error("Error fetching queries", error);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // ✅ TYPE FILTER
  const typeFiltered = useMemo(() => {
    return queries.filter((q) => {
      if (type === "User") return !q.riderId && !q.vendorId;
      if (type === "Rider") return q.riderId;
      if (type === "Vendor") return q.vendorId;
      return true;
    });
  }, [queries, type]);

  // ✅ SEARCH + STATUS FILTER
  const filteredQueries = useMemo(() => {
    return typeFiltered.filter((q) => {
      const matchesSearch =
        q.name?.toLowerCase().includes(search.toLowerCase()) ||
        q.email?.toLowerCase().includes(search.toLowerCase()) ||
        q.mobile?.includes(search) ||
        q.message?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [typeFiltered, search, statusFilter]);

  // ✅ PAGINATION
  const totalPages = Math.ceil(filteredQueries.length / limit);

  const paginatedQueries = filteredQueries.slice(
    (page - 1) * limit,
    page * limit
  );

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this query?")) return;

    try {
      await axios.delete(
        `http://31.97.206.144:7021/api/admin/deletequeries/${id}`
      );
      setQueries(queries.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Error deleting query", error);
    }
  };

  // ✅ UPDATE STATUS
  const handleUpdateStatus = async () => {
    try {
      const updatedAt = new Date().toISOString();

      await axios.put(
        `http://31.97.206.144:7021/api/admin/updatequeries/${selectedQuery._id}`,
        { status: newStatus, updatedAt }
      );

      setQueries(
        queries.map((q) =>
          q._id === selectedQuery._id
            ? { ...q, status: newStatus, updatedAt }
            : q
        )
      );

      setSelectedQuery(null);
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // ✅ CSV EXPORT
  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Message",
      "Status",
      "Created",
      "Updated",
    ];

    const rows = filteredQueries.map((q) => [
      q.name,
      q.email,
      q.mobile,
      q.message,
      q.status,
      new Date(q.createdAt).toLocaleString(),
      q.updatedAt
        ? new Date(q.updatedAt).toLocaleString()
        : "-",
    ]);

    let csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "queries.csv";
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Queries Management</h1>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <FiDownload /> Export
        </button>
      </div>

      {/* NAV TABS */}
      <div className="flex gap-3 mb-5">
        {["User", "Rider", "Vendor"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${type === t
              ? "bg-blue-600 text-white shadow"
              : "bg-white border hover:bg-blue-50"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center bg-white px-3 rounded-lg border w-80">
          <FiSearch />
          <input
            placeholder="Search queries..."
            className="p-2 w-full outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="p-2 border rounded-lg bg-white"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* DESKTOP / TABLET TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">S NO</th>
                <th className="p-3 text-left">Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Raised</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedQueries.map((q, index) => (
                <tr
                  key={q._id}
                  className="border-t hover:bg-blue-50 transition"
                >
                  <td className="p-3 ">{(page - 1) * limit + index + 1}</td>
                  <td className="p-3 font-semibold">{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.mobile}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${q.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : q.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  <td>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>

                  <td className="flex justify-center gap-3 p-3">
                    <FiEdit3
                      className="cursor-pointer text-blue-600 hover:scale-125"
                      onClick={() => {
                        setSelectedQuery(q);
                        setNewStatus(q.status);
                      }}
                    />
                    <FiTrash2
                      className="cursor-pointer text-red-600 hover:scale-125"
                      onClick={() => handleDelete(q._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARD VIEW */}
        <div className="md:hidden p-4 space-y-4">
          {paginatedQueries.map((q) => (
            <div
              key={q._id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{q.name}</h3>
                  <p className="text-gray-500 text-sm">{q.email}</p>
                  <p className="text-gray-500 text-sm">{q.mobile}</p>
                </div>

                <span
                  className={`px-2 py-1 rounded-full text-xs ${q.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : q.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {q.status}
                </span>
              </div>

              <p className="text-gray-600 mt-3 text-sm">
                {q.message}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Raised: {new Date(q.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-end gap-4 mt-3">
                <FiEdit3
                  className="text-blue-600 text-lg"
                  onClick={() => {
                    setSelectedQuery(q);
                    setNewStatus(q.status);
                  }}
                />
                <FiTrash2
                  className="text-red-600 text-lg"
                  onClick={() => handleDelete(q._id)}
                />
              </div>
            </div>
          ))}
        </div>

        {filteredQueries.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No queries found
          </div>
        )}
      </div>


      {/* PREMIUM PAGINATION */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">

        {/* Result Count */}
        <div className="text-gray-600 font-medium">
          Showing{" "}
          <span className="font-bold">
            {(page - 1) * limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold">
            {Math.min(page * limit, filteredQueries.length)}
          </span>{" "}
          of{" "}
          <span className="font-bold">
            {filteredQueries.length}
          </span>{" "}
          results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md">

          {/* PREVIOUS */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-blue-50 text-blue-600"
              }`}
          >
            ← Prev
          </button>

          {/* PAGE NUMBERS WITH ELLIPSIS */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;

            // show only nearby pages
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              Math.abs(pageNumber - page) <= 1
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-9 h-9 rounded-lg font-semibold transition ${page === pageNumber
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                    : "hover:bg-blue-50 text-gray-700"
                    }`}
                >
                  {pageNumber}
                </button>
              );
            }

            // Ellipsis
            if (
              pageNumber === page - 2 ||
              pageNumber === page + 2
            ) {
              return (
                <span key={pageNumber} className="px-1 text-gray-400">
                  ...
                </span>
              );
            }

            return null;
          })}

          {/* NEXT */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-blue-50 text-blue-600"
              }`}
          >
            Next →
          </button>
        </div>
      </div>


      {/* STATUS MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">
              Update Status
            </h2>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setSelectedQuery(null)}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:scale-105"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesPage;
