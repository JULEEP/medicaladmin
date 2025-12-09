import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://31.97.206.144:7021/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    { icon: <i className="ri-dashboard-fill text-white"></i>, name: "Dashboard", path: "/dashboard" },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [{ name: "Get All Users", path: "/users" }],
    },
    {
      icon: <i className="ri-hospital-line text-white"></i>,
      name: "Pharmacies",
      dropdown: [
        { name: "Create Pharmacy", path: "/create-pharmacy" },
        { name: "All Pharmacies", path: "/pharmacylist" },
        { name: "Active Pharmacies", path: "/activepharmacies" },
       { name: "InActive Pharmacies", path: "/inactivepharmacies" },
        { name: "All Prescription", path: "/prescriptions" },
        { name: "All Messages", path: "/allmessage" },
        { name: "Vendor Queries", path: "/vendorqueries" },
        { name: "Vendor PaymnetHistory", path: "/vendorpaymenthistory" },
      ],
    },
    {
      icon: <i className="ri-medicine-bottle-fill text-white"></i>,
      name: "Medicines",
      dropdown: [
        { name: "Create Medicine", path: "/add-medicine" },
        { name: "All Medicines", path: "/medicinelist" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Categories",
      dropdown: [{ name: "Create Category", path: "/create-category" }],
    },
    {
      icon: <i className="ri-wallet-3-fill text-white"></i>,
      name: "Payment",
      dropdown: [
        { name: "All Payments", path: "/allpayments" },
        { name: "All Refunded", path: "/allrefundedorders" },
      ],
    },
    {
      icon: <i className="ri-file-list-3-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "All Orders", path: "/orderlist" },
        { name: "All Delivered Orders", path: "/alldeliveredorders" },
        { name: "All Preodic Orders", path: "/preodicorders" },
        { name: "Prescription Orders", path: "/prescriptionorders" },
      ],
    },
    {
      icon: <i className="ri-motorbike-fill text-white"></i>,
      name: "Riders",
      dropdown: [
        { name: "All Riders", path: "/riderlist" },
        { name: "Rider Payments", path: "/riderpayments" },
        { name: "Rider Queries", path: "/rdierqueries" },
      ],
    },
    // {
    //   icon: <i className="ri-advertisement-fill text-white"></i>,
    //   name: "Ads",
    //   dropdown: [
    //     { name: "Create Ad", path: "/create-ads" },
    //     { name: "Ads List", path: "/adslist" },
    //   ],
    // },
    {
    icon: <i className="ri-gift-fill text-white"></i>,  // You can choose a coupon icon here
    name: "Coupons",
    dropdown: [
      { name: "Add Coupon", path: "/add-coupon" },  // Path to add coupon page
      { name: "Coupon List", path: "/couponlist" },  // Path to list of all coupons
    ],
  },
    {
      icon: <i className="ri-image-2-fill text-white"></i>,
      name: "Banner",
      dropdown: [{ name: "Banners", path: "/banners" }],
    },
    {
      icon: <i className="ri-questionnaire-fill text-white"></i>,
      name: "Queries",
      dropdown: [{ name: "All Queries", path: "/queries" }],
    },
    {
      icon: <i className="ri-notification-fill text-white"></i>,
      name: "Notifications",
      dropdown: [{ name: "All Notifications", path: "/notifications" }],
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      dropdown: [
        { name: "Create Privacy & Policy", path: "/create-privacy" },
        { name: "Create FAQ", path: "/faq" }
      ],

    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${
        isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
      } h-screen flex flex-col bg-blue-800`}
    >
      {/* ✅ Header (Sticky) */}
      <div className="sticky top-0 bg-blue-800 z-10">
        <div className="p-4 font-bold text-white flex justify-center text-xl">
          <span>Admin Dashboard</span>
        </div>
        <div className="border-b-4 border-gray-800"></div>
      </div>

      {/* ✅ Scrollable Nav */}
      <nav
        className={`flex-1 overflow-y-auto no-scrollbar flex flex-col ${
          isCollapsed && "items-center"
        } space-y-4 mt-4`}
      >
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  >
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${
                      openDropdown === item.name ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer text-white hover:text-[#00B074] no-underline transition-colors duration-300"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                >
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
