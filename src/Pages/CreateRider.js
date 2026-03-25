import React, { useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ─── Validators ───────────────────────────────────────────────────────────────

const VALIDATORS = {
  name: (v) => {
    if (!v.trim()) return "Name is required.";
    if (!/^[a-zA-Z\s.'-]{2,80}$/.test(v.trim()))
      return "Enter a valid name (letters, spaces, . ' - only, 2–80 chars).";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Enter a valid email address.";
    return "";
  },
  phone: (v) => {
    if (!v.trim()) return "Phone is required.";
    if (!/^[6-9]\d{9}$/.test(v.replace(/\s/g, "")))
      return "Enter a valid 10-digit Indian mobile number.";
    return "";
  },
  address: (v) => {
    if (!v.trim()) return "Address is required.";
    if (v.trim().length < 10) return "Address seems too short (min 10 chars).";
    if (v.trim().length > 300) return "Address must be under 300 characters.";
    return "";
  },
  city: (v) => {
    if (!v.trim()) return "City is required.";
    if (!/^[a-zA-Z\s'-]{2,60}$/.test(v.trim()))
      return "Enter a valid city name (letters only, 2–60 chars).";
    return "";
  },
  state: (v) => {
    if (!v.trim()) return "State is required.";
    if (!/^[a-zA-Z\s'-]{2,60}$/.test(v.trim()))
      return "Enter a valid state name (letters only, 2–60 chars).";
    return "";
  },
  pinCode: (v) => {
    if (!v.trim()) return "Pin code is required.";
    if (!/^[1-9]\d{5}$/.test(v.trim()))
      return "Enter a valid 6-digit Indian pin code.";
    return "";
  },
  latitude: (v) => {
    if (v === "" || v === null || v === undefined) return "Latitude is required.";
    const n = parseFloat(v);
    if (isNaN(n)) return "Latitude must be a number.";
    if (n < -90 || n > 90) return "Latitude must be between -90 and 90.";
    return "";
  },
  longitude: (v) => {
    if (v === "" || v === null || v === undefined) return "Longitude is required.";
    const n = parseFloat(v);
    if (isNaN(n)) return "Longitude must be a number.";
    if (n < -180 || n > 180) return "Longitude must be between -180 and 180.";
    return "";
  },
  deliveryCharge: (v) => {
    if (v === "" || v === null || v === undefined) return "Delivery charge is required.";
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) return "Enter a valid non-negative delivery charge.";
    if (n > 10000) return "Delivery charge seems unusually high (max ₹10,000).";
    return "";
  },
};

const MAX_FILE_MB = 5;
const validateFile = (file, allowedTypes) => {
  if (!file) return "";
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_MB}MB.`;
  if (allowedTypes && !allowedTypes.some((t) => file.type.startsWith(t)))
    return `Invalid file type. Allowed: ${allowedTypes.join(", ")}.`;
  return "";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({ label, error, touched, children, className = "" }) => (
  <div className={className}>
    <label className="block mb-1 text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {touched && error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
        <FaExclamationCircle className="shrink-0" /> {error}
      </p>
    )}
    {touched && !error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-green-600">
        <FaCheckCircle className="shrink-0" /> Looks good
      </p>
    )}
  </div>
);

const inputCls = (error, touched) =>
  `w-full p-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
    touched && error
      ? "border-red-400 bg-red-50 focus:ring-red-300"
      : touched && !error
      ? "border-green-400 bg-green-50 focus:ring-green-300"
      : "border-gray-300 focus:ring-blue-300"
  }`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateRider() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    name: "", email: "", phone: "", address: "",
    city: "", state: "", pinCode: "",
    latitude: "", longitude: "", deliveryCharge: "",
  });

  const [touched, setTouched] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageError, setProfileImageError] = useState("");
  const [rideImages, setRideImages] = useState([]);
  const [rideImagesError, setRideImagesError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (field, value) =>
    setFields((f) => ({ ...f, [field]: value }));

  const handleBlur = (field) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const getError = (field) => VALIDATORS[field]?.(fields[field]) || "";

  const isFormValid = () =>
    Object.keys(VALIDATORS).every((k) => !getError(k)) &&
    !profileImageError &&
    !rideImagesError;

  // Profile image
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file, ["image/"]);
    setProfileImageError(err);
    setProfileImage(err ? null : file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImageError("");
  };

  // Ride images — validate each file, deduplicate by name+size
  const handleRideImagesChange = (e) => {
    const incoming = Array.from(e.target.files);
    const errors = incoming.map((f) => validateFile(f, ["image/"])).filter(Boolean);
    if (errors.length) {
      setRideImagesError(errors[0]);
      return;
    }
    setRideImagesError("");
    setRideImages((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = incoming.filter((f) => !existing.has(`${f.name}-${f.size}`));
      const combined = [...prev, ...fresh];
      if (combined.length > 10) {
        setRideImagesError("Maximum 10 ride images allowed.");
        return prev;
      }
      return combined;
    });
  };

  const removeRideImage = (index) => {
    setRideImages((imgs) => imgs.filter((_, i) => i !== index));
    setRideImagesError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const allTouched = Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!isFormValid()) {
      setError("Please fix the errors above before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (isLoading) return;
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      if (profileImage) formData.append("profileImage", profileImage);
      rideImages.forEach((img) => formData.append("rideImages", img));

      const res = await fetch("http://31.97.206.144:7021/api/admin/create-rider", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message || "Rider created successfully");
      navigate("/riderlist");
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadBtnCls = (hasError) =>
    `flex items-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-lg cursor-pointer text-sm transition-colors ${
      hasError
        ? "border-red-400 bg-red-50 text-red-600"
        : "border-blue-400 text-blue-600 hover:bg-blue-50"
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-700">Create Rider</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 text-sm">
          <FaExclamationCircle className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg mb-6 text-sm">
          <FaCheckCircle className="mt-0.5 shrink-0" /> <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Personal Info ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">🧑 Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name *" error={getError("name")} touched={touched.name}>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="e.g. Ravi Kumar"
                className={inputCls(getError("name"), touched.name)}
              />
            </Field>

            <Field label="Email *" error={getError("email")} touched={touched.email}>
              <input
                type="email"
                value={fields.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="e.g. ravi@example.com"
                className={inputCls(getError("email"), touched.email)}
              />
            </Field>

            <Field label="Phone *" error={getError("phone")} touched={touched.phone}>
              <input
                type="tel"
                value={fields.phone}
                onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => handleBlur("phone")}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className={inputCls(getError("phone"), touched.phone)}
              />
            </Field>

            <Field label="Delivery Charge (₹) *" error={getError("deliveryCharge")} touched={touched.deliveryCharge}>
              <input
                type="number"
                value={fields.deliveryCharge}
                onChange={(e) => handleChange("deliveryCharge", e.target.value)}
                onBlur={() => handleBlur("deliveryCharge")}
                placeholder="e.g. 50"
                min="0"
                step="0.01"
                className={inputCls(getError("deliveryCharge"), touched.deliveryCharge)}
              />
            </Field>
          </div>
        </section>

        {/* ── Address ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">📍 Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Address *" error={getError("address")} touched={touched.address} className="md:col-span-2">
              <textarea
                value={fields.address}
                onChange={(e) => handleChange("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                placeholder="Full street address"
                rows={2}
                className={inputCls(getError("address"), touched.address)}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{fields.address.length}/300</p>
            </Field>

            <Field label="City *" error={getError("city")} touched={touched.city}>
              <input
                type="text"
                value={fields.city}
                onChange={(e) => handleChange("city", e.target.value)}
                onBlur={() => handleBlur("city")}
                placeholder="e.g. Hyderabad"
                className={inputCls(getError("city"), touched.city)}
              />
            </Field>

            <Field label="State *" error={getError("state")} touched={touched.state}>
              <input
                type="text"
                value={fields.state}
                onChange={(e) => handleChange("state", e.target.value)}
                onBlur={() => handleBlur("state")}
                placeholder="e.g. Telangana"
                className={inputCls(getError("state"), touched.state)}
              />
            </Field>

            <Field label="Pin Code *" error={getError("pinCode")} touched={touched.pinCode}>
              <input
                type="text"
                value={fields.pinCode}
                onChange={(e) => handleChange("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => handleBlur("pinCode")}
                placeholder="e.g. 500001"
                maxLength={6}
                className={inputCls(getError("pinCode"), touched.pinCode)}
              />
            </Field>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">🗺️ Location Coordinates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Latitude *" error={getError("latitude")} touched={touched.latitude}>
              <input
                type="number"
                value={fields.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                onBlur={() => handleBlur("latitude")}
                step="any"
                placeholder="e.g. 17.385044"
                className={inputCls(getError("latitude"), touched.latitude)}
              />
            </Field>

            <Field label="Longitude *" error={getError("longitude")} touched={touched.longitude}>
              <input
                type="number"
                value={fields.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                onBlur={() => handleBlur("longitude")}
                step="any"
                placeholder="e.g. 78.486671"
                className={inputCls(getError("longitude"), touched.longitude)}
              />
            </Field>
          </div>
        </section>

        {/* ── Images ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">🖼️ Images</h3>

          {/* Profile Image */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Profile Image (max 5MB)
            </label>
            <label className={uploadBtnCls(!!profileImageError)}>
              <FaCloudUploadAlt className="text-lg shrink-0" />
              <span className="truncate">{profileImage ? profileImage.name : "Choose File"}</span>
              <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            </label>
            {profileImageError && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <FaExclamationCircle /> {profileImageError}
              </p>
            )}
            {profileImage && (
              <div className="flex items-center gap-3 mt-2">
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="profile preview"
                  className="w-14 h-14 object-cover rounded-lg border shadow-sm"
                />
                <button type="button" onClick={removeProfileImage} className="text-red-500 hover:text-red-700">
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* Ride Images */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Ride Images — Vehicle, License, etc. (max 10 files, 5MB each)
            </label>
            <label className={uploadBtnCls(!!rideImagesError)}>
              <FaCloudUploadAlt className="text-lg shrink-0" />
              <span>Choose Files</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleRideImagesChange}
                className="hidden"
              />
            </label>
            {rideImagesError && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <FaExclamationCircle /> {rideImagesError}
              </p>
            )}
            {rideImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {rideImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`ride-${i}`}
                      className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeRideImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {rideImages.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">{rideImages.length} file(s) selected</p>
            )}
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="flex items-center justify-between">
          {submitAttempted && !isFormValid() && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle /> Please fix all errors before submitting.
            </p>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-sm ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </span>
              ) : (
                "Create Rider"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}