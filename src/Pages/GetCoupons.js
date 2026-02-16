import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit3, FiTrash2 } from "react-icons/fi";

const GetCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newDiscountPercentage, setNewDiscountPercentage] = useState("");
  const [newExpirationDate, setNewExpirationDate] = useState("");

  // ⭐ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:7021/api/admin/getcoupons");
      setCoupons(res.data.coupons);
      setLoading(false);
    } catch {
      setMessage("Failed to fetch coupons");
      setMessageType("error");
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;

    await axios.delete(`http://31.97.206.144:7021/api/admin/deletecoupon/${id}`);
    setCoupons(coupons.filter((c) => c._id !== id));
    setMessage("Coupon deleted successfully");
    setMessageType("success");
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setNewCouponCode(coupon.couponCode);
    setNewDiscountPercentage(coupon.discountPercentage);
    setNewExpirationDate(coupon.expirationDate?.slice(0,10) || "");
  };

  const handleUpdateCoupon = async () => {
    const updatedCoupon = {
      couponCode: newCouponCode,
      discountPercentage: newDiscountPercentage,
      expirationDate: newExpirationDate,
    };

    await axios.put(
      `http://31.97.206.144:7021/api/admin/editcoupon/${selectedCoupon._id}`,
      updatedCoupon
    );

    setCoupons(coupons.map(c =>
      c._id === selectedCoupon._id ? { ...c, ...updatedCoupon } : c
    ));
    setSelectedCoupon(null);
  };

  // ⭐ Pagination Logic
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">

      <h1 className="text-3xl font-bold mb-8 text-gray-800">🎟 Coupon Management</h1>

      {message && (
        <div className={`mb-6 p-3 rounded-lg w-fit 
          ${messageType==="success"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="bg-white/80 backdrop-blur-xl border rounded-3xl shadow-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4 text-left">Coupon</th>
              <th className="p-4 text-left">Discount</th>
              <th className="p-4 text-left">Expiry</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-10">Loading...</td></tr>
            ) : currentCoupons.length > 0 ? (
              currentCoupons.map((coupon, i) => (
                <tr key={coupon._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">{startIndex + i + 1}</td>
                  <td className="p-4">{coupon.couponCode}</td>
                  <td className="p-4">{coupon.discountPercentage}%</td>
                  <td className="p-4">
                    {coupon.expirationDate
                      ? new Date(coupon.expirationDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <FiEdit3/>
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <FiTrash2/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center p-10">No coupons found</td></tr>
            )}
          </tbody>
        </table>

        {/* ⭐ Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-6 border-t">
            <button disabled={currentPage===1}
              onClick={()=>setCurrentPage(currentPage-1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40">
              Prev
            </button>

            {[...Array(totalPages)].map((_,i)=>(
              <button key={i}
                onClick={()=>setCurrentPage(i+1)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage===i+1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                }`}>
                {i+1}
              </button>
            ))}

            <button disabled={currentPage===totalPages}
              onClick={()=>setCurrentPage(currentPage+1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {selectedCoupon && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Edit Coupon</h3>

            <input className="w-full p-3 border rounded mb-3"
              value={newCouponCode}
              onChange={(e)=>setNewCouponCode(e.target.value)} />

            <input type="number" className="w-full p-3 border rounded mb-3"
              value={newDiscountPercentage}
              onChange={(e)=>setNewDiscountPercentage(e.target.value)} />

            <input type="date" className="w-full p-3 border rounded mb-4"
              value={newExpirationDate}
              onChange={(e)=>setNewExpirationDate(e.target.value)} />

            <div className="flex justify-end gap-3">
              <button onClick={()=>setSelectedCoupon(null)}
                className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleUpdateCoupon}
                className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GetCoupons;
