import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CreateRider() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(""); // ✅ Added field
  const [profileImage, setProfileImage] = useState(null);
  const [rideImages, setRideImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // profile image change
  const handleProfileImageChange = (e) => setProfileImage(e.target.files[0]);

  // multiple ride images change
  const handleRideImagesChange = (e) =>
    setRideImages([...rideImages, ...Array.from(e.target.files)]);

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pinCode", pinCode);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("deliveryCharge", deliveryCharge); // ✅ Added

      if (profileImage) formData.append("profileImage", profileImage);
      rideImages.forEach((img) => formData.append("rideImages", img));

      const res = await fetch("http://31.97.206.144:7021/api/admin/create-rider", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message || "Rider created successfully ✅");

      // Reset fields
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPinCode("");
      setLatitude("");
      setLongitude("");
      setDeliveryCharge(""); // ✅ Reset
      setProfileImage(null);
      setRideImages([]);

      // redirect to rider list page
      navigate("/riderlist");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Create Rider</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border">
        {/* Rider Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">State</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Pin Code</label>
            <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Latitude</label>
            <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Longitude</label>
            <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Delivery Charge (₹)</label>
            <input type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} min="0" step="0.01" required className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Upload Profile Image */}
        <div className="mb-4 mt-6">
          <label className="block mb-1 font-medium">Upload Profile Image</label>
          <label className="flex items-center p-2 border-2 border-dashed border-blue-400 rounded cursor-pointer hover:bg-blue-50 transition">
            <FaCloudUploadAlt className="text-xl mr-2 text-blue-600" /> Choose File
            <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
          </label>
          {profileImage && <p className="text-sm mt-2">{profileImage.name}</p>}
        </div>

        {/* Upload Ride Images */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload Ride Images (Vehicle, License, etc)</label>
          <label className="flex items-center p-2 border-2 border-dashed border-blue-400 rounded cursor-pointer hover:bg-blue-50 transition">
            <FaCloudUploadAlt className="text-xl mr-2 text-blue-600" /> Choose Files
            <input type="file" accept="image/*" multiple onChange={handleRideImagesChange} className="hidden" />
          </label>
          {rideImages.length > 0 && <p className="text-sm mt-2">{rideImages.length} file(s) selected</p>}
        </div>

        <div className="mt-6 text-right">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create Rider</button>
        </div>
      </form>
    </div>
  );
}
