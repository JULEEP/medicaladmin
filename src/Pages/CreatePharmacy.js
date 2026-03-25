import React, { useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ─── Validation Rules ────────────────────────────────────────────────────────

const VALIDATORS = {
  name: (v) => {
    if (!v.trim()) return "Pharmacy name is required.";
    if (v.trim().length < 3) return "Name must be at least 3 characters.";
    if (v.trim().length > 100) return "Name must be under 100 characters.";
    return "";
  },
  vendorName: (v) => {
    if (!v.trim()) return "Vendor name is required.";
    if (!/^[a-zA-Z\s.'-]{2,80}$/.test(v.trim()))
      return "Enter a valid name (letters, spaces, . ' - only).";
    return "";
  },
  vendorEmail: (v) => {
    if (!v.trim()) return "Vendor email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Enter a valid email address.";
    return "";
  },
  vendorPhone: (v) => {
    if (!v.trim()) return "Vendor phone is required.";
    if (!/^[6-9]\d{9}$/.test(v.replace(/\s/g, "")))
      return "Enter a valid 10-digit Indian mobile number.";
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
  shopAddress: (v) => {
    if (!v.trim()) return "Shop address is required.";
    if (v.trim().length < 10) return "Address seems too short (min 10 chars).";
    if (v.trim().length > 300) return "Address must be under 300 characters.";
    return "";
  },
  aadhar: (v) => {
    if (!v.trim()) return "Aadhar number is required.";
    if (!/^\d{12}$/.test(v.replace(/\s/g, "")))
      return "Aadhar must be exactly 12 digits.";
    return "";
  },
  panCard: (v) => {
    if (!v.trim()) return "PAN card number is required.";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.trim().toUpperCase()))
      return "Enter a valid PAN (e.g. ABCDE1234F).";
    return "";
  },
  license: (v) => {
    if (!v.trim()) return "License number is required.";
    if (v.trim().length < 5) return "License number seems too short.";
    if (v.trim().length > 50) return "License number must be under 50 characters.";
    return "";
  },
  imageURL: (v) => {
    if (!v) return "";
    try {
      const url = new URL(v);
      if (!["http:", "https:"].includes(url.protocol))
        return "Image URL must start with http or https.";
    } catch {
      return "Enter a valid URL.";
    }
    return "";
  },
};

const validateCategoryField = (field, value) => {
  if (field === "name") {
    if (!value.trim()) return "Category name is required.";
    if (value.trim().length < 2) return "Name must be at least 2 characters.";
    if (value.trim().length > 60) return "Name must be under 60 characters.";
  }
  if (field === "imageURL" && value) {
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol))
        return "URL must start with http or https.";
    } catch {
      return "Enter a valid URL.";
    }
  }
  return "";
};

const MAX_FILE_SIZE_MB = 5;
const validateFile = (file, allowedTypes) => {
  if (!file) return "";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return `File must be under ${MAX_FILE_SIZE_MB}MB.`;
  if (allowedTypes && !allowedTypes.some((t) => file.type.startsWith(t)))
    return `Invalid file type. Allowed: ${allowedTypes.join(", ")}.`;
  return "";
};

// ─── Field Component ──────────────────────────────────────────────────────────

const Field = ({ label, error, touched, children, className = "" }) => (
  <div className={className}>
    <label className="block mb-1 text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {touched && error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
        <FaExclamationCircle className="shrink-0" />
        {error}
      </p>
    )}
    {touched && !error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-green-600">
        <FaCheckCircle className="shrink-0" />
        Looks good
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

export default function CreatePharmacy() {
  const navigate = useNavigate();

  // ── Form State ──
  const [fields, setFields] = useState({
    name: "",
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    latitude: "",
    longitude: "",
    shopAddress: "",
    aadhar: "",
    panCard: "",
    license: "",
    imageURL: "",
  });

  const [files, setFiles] = useState({
    imageFile: null,
    aadharFile: null,
    panCardFile: null,
    licenseFile: null,
  });

  const [categories, setCategories] = useState([]);
  const [touched, setTouched] = useState({});
  const [catTouched, setCatTouched] = useState([]);
  const [fileErrors, setFileErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ── Field Handlers ──
  const handleChange = (field, value) => {
    setFields((f) => ({ ...f, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleFileChange = (key, file, allowedTypes) => {
    const err = validateFile(file, allowedTypes);
    setFileErrors((e) => ({ ...e, [key]: err }));
    if (!err) setFiles((f) => ({ ...f, [key]: file }));
    else setFiles((f) => ({ ...f, [key]: null }));
  };

  const removeFile = (key) => {
    setFiles((f) => ({ ...f, [key]: null }));
    setFileErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Category Handlers ──
  const addCategory = () => {
    setCategories((c) => [...c, { name: "", imageURL: "", imageFile: null }]);
    setCatTouched((t) => [...t, {}]);
  };

  const updateCategory = (index, field, value) => {
    setCategories((cats) => {
      const updated = [...cats];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const touchCatField = (index, field) => {
    setCatTouched((t) => {
      const updated = [...t];
      updated[index] = { ...(updated[index] || {}), [field]: true };
      return updated;
    });
  };

  const handleCatFileChange = (index, file) => {
    const err = validateFile(file, ["image/"]);
    updateCategory(index, "imageFileError", err);
    updateCategory(index, "imageFile", err ? null : file);
  };

  const removeCategory = (index) => {
    setCategories((c) => c.filter((_, i) => i !== index));
    setCatTouched((t) => t.filter((_, i) => i !== index));
  };

  // ── Validation Summary ──
  const getFieldError = (field) => VALIDATORS[field]?.(fields[field]) || "";

  const isFormValid = () => {
    const mainFieldsValid = Object.keys(VALIDATORS)
      .filter((k) => k !== "imageURL") // imageURL optional
      .every((k) => !getFieldError(k));

    const imageURLValid = !getFieldError("imageURL");

    const catValid = categories.every(
      (cat) =>
        !validateCategoryField("name", cat.name) &&
        !validateCategoryField("imageURL", cat.imageURL)
    );

    const fileErrsClean = Object.values(fileErrors).every((e) => !e);

    return mainFieldsValid && imageURLValid && catValid && fileErrsClean;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Touch all fields to reveal errors
    const allTouched = Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const newCatTouched = categories.map(() => ({ name: true, imageURL: true }));
    setCatTouched(newCatTouched);

    if (!isFormValid()) {
      setError("Please fix the errors above before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (isLoading) return;
    setMessage("");
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (k !== "imageURL" || !files.imageFile) formData.append(k === "imageURL" ? "image" : k, v);
    });

    if (files.imageFile) formData.append("image", files.imageFile);
    if (files.aadharFile) formData.append("aadharFile", files.aadharFile);
    if (files.panCardFile) formData.append("panCardFile", files.panCardFile);
    if (files.licenseFile) formData.append("licenseFile", files.licenseFile);

    formData.append(
      "categories",
      JSON.stringify(categories.map(({ name, imageURL }) => ({ name, image: imageURL })))
    );
    categories.forEach((cat) => {
      if (cat.imageFile) formData.append("categoryImages", cat.imageFile);
    });

    try {
      const res = await fetch(
        "http://31.97.206.144:7021/api/pharmacy/create-pharmacy",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);
      alert("Pharmacy created successfully. Click OK to continue.");
      navigate("/pharmacylist");
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── File Preview ──
  const renderFilePreview = (file, fileKey) => {
    if (!file) return null;
    const isImage = file.type.startsWith("image/");
    return (
      <div className="flex items-center gap-3 mt-2">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-14 h-14 object-cover rounded-lg border shadow-sm"
          />
        ) : (
          <span className="text-sm text-gray-600 truncate max-w-[160px]">{file.name}</span>
        )}
        <button
          type="button"
          onClick={() => removeFile(fileKey)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Remove file"
        >
          <FaTimes />
        </button>
      </div>
    );
  };

  const uploadBtnCls = (hasError) =>
    `flex items-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-lg cursor-pointer text-sm transition-colors ${
      hasError
        ? "border-red-400 bg-red-50 text-red-600"
        : "border-blue-400 text-blue-600 hover:bg-blue-50"
    }`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-700">Create Pharmacy</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in all required fields. Fields marked with <span className="text-red-500">*</span> are mandatory.
        </p>
      </div>

      {/* Global Messages */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 text-sm">
          <FaExclamationCircle className="mt-0.5 shrink-0 text-base" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-300 text-green-700 p-4 rounded-lg mb-6 text-sm">
          <FaCheckCircle className="mt-0.5 shrink-0 text-base" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Section: Basic Info ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">
            📋 Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Pharmacy Name *" error={getFieldError("name")} touched={touched.name}>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="e.g. MedPlus Pharmacy"
                className={inputCls(getFieldError("name"), touched.name)}
              />
            </Field>

            <Field label="Vendor Name *" error={getFieldError("vendorName")} touched={touched.vendorName}>
              <input
                type="text"
                value={fields.vendorName}
                onChange={(e) => handleChange("vendorName", e.target.value)}
                onBlur={() => handleBlur("vendorName")}
                placeholder="e.g. Ravi Kumar"
                className={inputCls(getFieldError("vendorName"), touched.vendorName)}
              />
            </Field>

            <Field label="Vendor Email *" error={getFieldError("vendorEmail")} touched={touched.vendorEmail}>
              <input
                type="email"
                value={fields.vendorEmail}
                onChange={(e) => handleChange("vendorEmail", e.target.value)}
                onBlur={() => handleBlur("vendorEmail")}
                placeholder="e.g. vendor@example.com"
                className={inputCls(getFieldError("vendorEmail"), touched.vendorEmail)}
              />
            </Field>

            <Field label="Vendor Phone *" error={getFieldError("vendorPhone")} touched={touched.vendorPhone}>
              <input
                type="tel"
                value={fields.vendorPhone}
                onChange={(e) => handleChange("vendorPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => handleBlur("vendorPhone")}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className={inputCls(getFieldError("vendorPhone"), touched.vendorPhone)}
              />
            </Field>
          </div>
        </section>

        {/* ── Section: Location ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">
            📍 Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Latitude *" error={getFieldError("latitude")} touched={touched.latitude}>
              <input
                type="number"
                value={fields.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                onBlur={() => handleBlur("latitude")}
                step="any"
                placeholder="e.g. 17.385044"
                className={inputCls(getFieldError("latitude"), touched.latitude)}
              />
            </Field>

            <Field label="Longitude *" error={getFieldError("longitude")} touched={touched.longitude}>
              <input
                type="number"
                value={fields.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                onBlur={() => handleBlur("longitude")}
                step="any"
                placeholder="e.g. 78.486671"
                className={inputCls(getFieldError("longitude"), touched.longitude)}
              />
            </Field>

            <Field
              label="Shop Address *"
              error={getFieldError("shopAddress")}
              touched={touched.shopAddress}
              className="md:col-span-2"
            >
              <textarea
                value={fields.shopAddress}
                onChange={(e) => handleChange("shopAddress", e.target.value)}
                onBlur={() => handleBlur("shopAddress")}
                rows={3}
                placeholder="Full address including street, city, state, pincode"
                className={inputCls(getFieldError("shopAddress"), touched.shopAddress)}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {fields.shopAddress.length}/300
              </p>
            </Field>
          </div>
        </section>

        {/* ── Section: KYC Documents ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">
            🪪 KYC Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Aadhar */}
            <Field label="Aadhar Number *" error={getFieldError("aadhar")} touched={touched.aadhar}>
              <input
                type="text"
                value={fields.aadhar}
                onChange={(e) => handleChange("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                onBlur={() => handleBlur("aadhar")}
                placeholder="12-digit Aadhar number"
                maxLength={12}
                className={inputCls(getFieldError("aadhar"), touched.aadhar)}
              />
            </Field>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Upload Aadhar (image/PDF, max 5MB)
              </label>
              <label className={uploadBtnCls(!!fileErrors.aadharFile)}>
                <FaCloudUploadAlt className="text-lg shrink-0" />
                <span className="truncate">{files.aadharFile ? files.aadharFile.name : "Choose File"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange("aadharFile", e.target.files[0], ["image/", "application/pdf"])}
                  className="hidden"
                />
              </label>
              {fileErrors.aadharFile && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FaExclamationCircle /> {fileErrors.aadharFile}
                </p>
              )}
              {renderFilePreview(files.aadharFile, "aadharFile")}
            </div>

            {/* PAN */}
            <Field label="PAN Card Number *" error={getFieldError("panCard")} touched={touched.panCard}>
              <input
                type="text"
                value={fields.panCard}
                onChange={(e) => handleChange("panCard", e.target.value.toUpperCase().slice(0, 10))}
                onBlur={() => handleBlur("panCard")}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className={inputCls(getFieldError("panCard"), touched.panCard)}
              />
            </Field>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Upload PAN (image/PDF, max 5MB)
              </label>
              <label className={uploadBtnCls(!!fileErrors.panCardFile)}>
                <FaCloudUploadAlt className="text-lg shrink-0" />
                <span className="truncate">{files.panCardFile ? files.panCardFile.name : "Choose File"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange("panCardFile", e.target.files[0], ["image/", "application/pdf"])}
                  className="hidden"
                />
              </label>
              {fileErrors.panCardFile && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FaExclamationCircle /> {fileErrors.panCardFile}
                </p>
              )}
              {renderFilePreview(files.panCardFile, "panCardFile")}
            </div>

            {/* License */}
            <Field label="License Number *" error={getFieldError("license")} touched={touched.license}>
              <input
                type="text"
                value={fields.license}
                onChange={(e) => handleChange("license", e.target.value)}
                onBlur={() => handleBlur("license")}
                placeholder="e.g. MH-LIC-12345"
                className={inputCls(getFieldError("license"), touched.license)}
              />
            </Field>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Upload License (image/PDF, max 5MB)
              </label>
              <label className={uploadBtnCls(!!fileErrors.licenseFile)}>
                <FaCloudUploadAlt className="text-lg shrink-0" />
                <span className="truncate">{files.licenseFile ? files.licenseFile.name : "Choose File"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange("licenseFile", e.target.files[0], ["image/", "application/pdf"])}
                  className="hidden"
                />
              </label>
              {fileErrors.licenseFile && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FaExclamationCircle /> {fileErrors.licenseFile}
                </p>
              )}
              {renderFilePreview(files.licenseFile, "licenseFile")}
            </div>
          </div>
        </section>

        {/* ── Section: Pharmacy Image ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b">
            🖼️ Pharmacy Image (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Image URL"
              error={getFieldError("imageURL")}
              touched={touched.imageURL && !!fields.imageURL}
            >
              <input
                type="url"
                value={fields.imageURL}
                onChange={(e) => handleChange("imageURL", e.target.value)}
                onBlur={() => fields.imageURL && handleBlur("imageURL")}
                placeholder="https://example.com/image.jpg"
                className={inputCls(
                  getFieldError("imageURL"),
                  touched.imageURL && !!fields.imageURL
                )}
                disabled={!!files.imageFile}
              />
              {files.imageFile && (
                <p className="text-xs text-gray-400 mt-1">URL disabled when a file is uploaded.</p>
              )}
            </Field>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                Upload Image (max 5MB)
              </label>
              <label className={uploadBtnCls(!!fileErrors.imageFile)}>
                <FaCloudUploadAlt className="text-lg shrink-0" />
                <span className="truncate">{files.imageFile ? files.imageFile.name : "Choose File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("imageFile", e.target.files[0], ["image/"])}
                  className="hidden"
                />
              </label>
              {fileErrors.imageFile && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FaExclamationCircle /> {fileErrors.imageFile}
                </p>
              )}
              {renderFilePreview(files.imageFile, "imageFile")}
            </div>
          </div>
        </section>

        {/* ── Section: Categories ── */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="text-base font-bold text-gray-800">🗂️ Categories</h3>
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Category
            </button>
          </div>

          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No categories added yet. Click "Add Category" to add one.
            </p>
          )}

          {categories.map((cat, index) => {
            const ct = catTouched[index] || {};
            const nameErr = validateCategoryField("name", cat.name);
            const urlErr = validateCategoryField("imageURL", cat.imageURL);

            return (
              <div
                key={index}
                className="grid md:grid-cols-3 gap-4 items-start mb-4 border border-gray-200 bg-gray-50 p-4 rounded-xl"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategory(index, "name", e.target.value)}
                    onBlur={() => touchCatField(index, "name")}
                    placeholder="e.g. Vitamins"
                    className={inputCls(nameErr, ct.name)}
                  />
                  {ct.name && nameErr && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <FaExclamationCircle /> {nameErr}
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={cat.imageURL}
                    onChange={(e) => updateCategory(index, "imageURL", e.target.value)}
                    onBlur={() => cat.imageURL && touchCatField(index, "imageURL")}
                    placeholder="https://..."
                    className={inputCls(urlErr, ct.imageURL && !!cat.imageURL)}
                    disabled={!!cat.imageFile}
                  />
                  {ct.imageURL && urlErr && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <FaExclamationCircle /> {urlErr}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Upload Image
                  </label>
                  <label className={uploadBtnCls(!!cat.imageFileError)}>
                    <FaCloudUploadAlt className="shrink-0" />
                    <span className="truncate text-xs">
                      {cat.imageFile ? cat.imageFile.name : "Choose File"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCatFileChange(index, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {cat.imageFileError && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <FaExclamationCircle /> {cat.imageFileError}
                    </p>
                  )}
                  {cat.imageFile && (
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={URL.createObjectURL(cat.imageFile)}
                        alt="preview"
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => { updateCategory(index, "imageFile", null); updateCategory(index, "imageFileError", ""); }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Remove Category
                  </button>
                </div>
              </div>
            );
          })}
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
                "Create Pharmacy"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}