import { useState, useEffect, useRef } from "react";
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiGrid,
  FiPlusCircle,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiMessageSquare,
  FiSend,
  FiTruck,
  FiWifi
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState("today");
  const [orderFilter, setOrderFilter] = useState("today");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState({ type: "", text: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [currentPharmacyPage, setCurrentPharmacyPage] = useState(1);
  const pharmaciesPerPage = 5;

  const navigate = useNavigate();
  const location = useLocation();
  const dashboardRef = useRef(null);

  // Scroll position management - FIXED VERSION
  useEffect(() => {
    // Check if we're coming back from navigation
    if (location.state?.fromNavigation) {
      const savedScrollPosition = sessionStorage.getItem('dashboardScrollPosition');
      if (savedScrollPosition && dashboardRef.current) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition));
        }, 0);
      }
      // Clear the state to avoid infinite loop
      window.history.replaceState({ ...window.history.state, fromNavigation: false }, '');
    }

    // Cleanup on unmount
    return () => {
      sessionStorage.removeItem('dashboardScrollPosition');
    };
  }, [location]);

  const handleNavigation = (route) => {
    // Save current scroll position before navigating
    const scrollPosition = window.pageYOffset;
    sessionStorage.setItem('dashboardScrollPosition', scrollPosition.toString());
    
    // Navigate with state to identify we're coming back
    navigate(route, { state: { fromNavigation: true } });
  };

  // Alternative approach: Save scroll position on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('dashboardScrollPosition', window.pageYOffset.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://31.97.206.144:7021/api/admin/dashboard");
        setDashboardData(res.data);
        
        // After data loads, check if we need to restore scroll position
        const savedScrollPosition = sessionStorage.getItem('dashboardScrollPosition');
        if (savedScrollPosition && location.state?.fromNavigation) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
            sessionStorage.removeItem('dashboardScrollPosition');
          }, 100);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboard();

    const fetchVendors = async () => {
      try {
        const res = await axios.get("http://31.97.206.144:7021/api/pharmacy/getallpjarmacy");
        
        // Handle different response formats
        let vendorsData = [];
        if (Array.isArray(res.data)) {
          vendorsData = res.data;
        } else if (res.data && Array.isArray(res.data.pharmacies)) {
          vendorsData = res.data.pharmacies;
        } else if (res.data && Array.isArray(res.data.data)) {
          vendorsData = res.data.data;
        } else if (typeof res.data === 'object' && res.data !== null) {
          vendorsData = Object.values(res.data);
        }
        
        setVendors(vendorsData);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      }
    };
    fetchVendors();
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setMessageStatus({ type: "error", text: "Please enter a message" });
      return;
    }

    setIsSending(true);
    setMessageStatus({ type: "", text: "" });

    try {
      if (selectedVendor === "all") {
        const vendorIds = vendors.map(vendor => vendor._id || vendor.id);
        await axios.post("http://31.97.206.144:7021/api/admin/send-message", {
          vendorIds,
          message
        });
        setMessageStatus({ type: "success", text: `Message sent to all ${vendorIds.length} vendors` });
      } else {
        await axios.post("http://31.97.206.144:7021/api/admin/send-message", {
          vendorId: selectedVendor,
          message
        });
        const vendorName = vendors.find(v => (v._id || v.id) === selectedVendor)?.name || "Vendor";
        setMessageStatus({ type: "success", text: `Message sent to ${vendorName}` });
      }
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageStatus({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setIsSending(false);
    }
  };

  if (!dashboardData) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Calculate delivery stats from user data
  const deliveryStats = {
    onTime: dashboardData.userOrdersSummary.reduce((sum, user) => sum + (user.onTime || 0), 0),
    delayed: dashboardData.userOrdersSummary.reduce((sum, user) => sum + (user.delayed || 0), 0),
    cancelled: dashboardData.userOrdersSummary.reduce((sum, user) => sum + (user.cancelled || 0), 0),
  };

  // Prepare revenue data for charts
  const revenueChartData = [
    { name: "Today", revenue: dashboardData.revenueData[0].revenue },
    { name: "7 Days", revenue: dashboardData.revenueData[1].revenue },
    { name: "1 Month", revenue: dashboardData.revenueData[2].revenue },
    { name: "6 Months", revenue: dashboardData.revenueData[3].revenue },
    { name: "12 Months", revenue: dashboardData.revenueData[4].revenue },
  ];

  // Prepare pharmacy performance data
  const pharmacyPerformanceData = dashboardData.pharmacyInsights
    .slice(0, 6)
    .map(pharmacy => ({
      name: pharmacy.pharmacy.length > 12 ? pharmacy.pharmacy.substring(0, 12) + '...' : pharmacy.pharmacy,
      orders: pharmacy.totalOrders,
      rating: pharmacy.avgRating
    }));

  // Prepare data for Pharmacy Pie Chart
  const pharmacyPieData = [
    { name: "Active Pharmacies", value: dashboardData.stats.activePharmacies },
    { name: "Inactive Pharmacies", value: dashboardData.stats.totalPharmacies - dashboardData.stats.activePharmacies }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Pagination logic for users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = dashboardData.userOrdersSummary.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(dashboardData.userOrdersSummary.length / usersPerPage);

  // Pagination logic for pharmacies
  const indexOfLastPharmacy = currentPharmacyPage * pharmaciesPerPage;
  const indexOfFirstPharmacy = indexOfLastPharmacy - pharmaciesPerPage;
  const currentPharmacies = dashboardData.pharmacyInsights.slice(indexOfFirstPharmacy, indexOfLastPharmacy);
  const totalPharmacyPages = Math.ceil(dashboardData.pharmacyInsights.length / pharmaciesPerPage);

  return (
    <div ref={dashboardRef} className="bg-gray-100 min-h-screen p-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Users" value={dashboardData.stats.totalUsers} color="blue" onClick={() => handleNavigation("/users")}/>
        <StatCard icon={FiPackage} label="Total Orders" value={dashboardData.stats.totalOrders} color="green" onClick={() => handleNavigation("/orderlist")}/>
        <StatCard icon={FiShoppingBag} label="Partner Pharmacies" value={dashboardData.stats.totalPharmacies} color="purple" onClick={() => handleNavigation("/pharmacylist")}/>
        <StatCard icon={FiGrid} label="Medicines Available" value={dashboardData.stats.totalMedicines} color="yellow" onClick={() => handleNavigation("/medicinelist")}/>
      </div>

      {/* Delivery Stats with Total Riders and Active Riders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={FiClock} label="Active Pharmacies" value={dashboardData.stats.activePharmacies} color="blue" onClick={() => handleNavigation("/activepharmacies")}/>
         <StatCard icon={FiClock} label="InActive Pharmacies" value={dashboardData.stats.inactivePharmacies} color="red" onClick={() => handleNavigation("/inactivepharmacies")}/>
        <StatCard icon={FiTrendingUp} label="Today's Orders" value={dashboardData.stats.todaysOrders} color="green" onClick={() => handleNavigation("/todaysorders")}/>
        <StatCard icon={FiCalendar} label="Cancelled Orders" value={deliveryStats.cancelled} color="purple" onClick={() => handleNavigation("/cancelledorders")}/>
        <StatCard icon={FiTruck} label="Total Riders" value={dashboardData.stats.totalRiders || 0} color="orange" onClick={() => handleNavigation("/riderlist")}/>
        <StatCard icon={FiWifi} label="Active Riders" value={dashboardData.stats.onlineRiders || 0} color="emerald" onClick={() => handleNavigation("/onlineriders")}/>
      </div>

      {/* Add Rider Button */}
      <div className="mb-6">
        <button 
          onClick={() => handleNavigation('/add-rider')} 
          className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center"
        >
          <FiPlusCircle className="mr-2" />
          Add Rider
        </button>
      </div>

      {/* Vendor Messaging Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FiMessageSquare className="mr-2" /> Send Message to Vendors
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="all">All Vendors</option>
              {Array.isArray(vendors) && vendors.map(vendor => (
                <option key={vendor._id || vendor.id} value={vendor._id || vendor.id}>
                  {vendor.name || vendor.pharmacyName || "Unknown Vendor"}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSendMessage}
              disabled={isSending || vendors.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        {vendors.length === 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-3">
            No vendors available to message.
          </div>
        )}
        
        {messageStatus.text && (
          <div className={`p-3 rounded-md ${
            messageStatus.type === "success" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {messageStatus.text}
          </div>
        )}
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {dashboardData.revenueData.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-lg font-bold">₹{item.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Charts - Added Pharmacy Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Revenue Trend"
          data={revenueChartData}
          filter={revenueFilter}
          setFilter={setRevenueFilter}
          dataKey="revenue"
          color="#3b82f6"
        />

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Pharmacy Performance</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">7 Days</option>
              <option value="monthly">1 Month</option>
              <option value="sixMonths">6 Months</option>
              <option value="yearly">12 Months</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pharmacyPerformanceData} margin={{ top: 5, right: 20, left: 5, bottom: 30 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'orders' ? 'Orders' : 'Rating']}
                />
                <Bar 
                  dataKey="orders" 
                  name="Orders" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="rating" 
                  name="Rating" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-4">Pharmacy Status</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pharmacyPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pharmacyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 space-x-4">
            {pharmacyPieData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Activity Table */}
      <DataTable
        title="User Orders"
        data={currentUsers}
        columns={[
          { label: "User", key: "user" },
          { label: "Last Order", key: "lastOrder" },
          { label: "Account Created", key: "accountCreated" },
          { label: "Total Orders", key: "totalOrders" },
          { label: "Medicines Ordered", key: "medicinesOrdered" },
        ]}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={dashboardData.userOrdersSummary.length}
        handleNavigation={handleNavigation}
      />

      {/* Pharmacy Insights Table */}
      <DataTable
        title="Pharmacy Insights"
        data={currentPharmacies}
        columns={[
          { label: "Pharmacy", key: "pharmacy" },
          { label: "Total Orders", key: "totalOrders" },
          { label: "Medicines Available", key: "medicinesAvailable" },
          { label: "Joined Date", key: "joinedDate" },
        ]}
        currentPage={currentPharmacyPage}
        totalPages={totalPharmacyPages}
        setCurrentPage={setCurrentPharmacyPage}
        totalItems={dashboardData.pharmacyInsights.length}
        handleNavigation={handleNavigation}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton label="Add New Medicine" route="/add-medicine" handleNavigation={handleNavigation} />
          <QuickActionButton label="Manage Pharmacies" route="/pharmacylist" handleNavigation={handleNavigation} />
          <QuickActionButton label="Manage Orders" route="/orderlist" handleNavigation={handleNavigation} />
          <QuickActionButton label="Manage Users" route="/users" handleNavigation={handleNavigation} />
          <QuickActionButton label="Messages" route="/allmessage" handleNavigation={handleNavigation} />
          <QuickActionButton label="Manage Riders" route="/riderlist" handleNavigation={handleNavigation} />
        </div>
      </div>
    </div>
  );
};

// Rest of the components remain the same...
// StatCard, ChartCard, DataTable, QuickActionButton components...

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    orange: "text-orange-600 bg-orange-100",
    red: "text-red-600 bg-red-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const ChartCard = ({ title, data, filter, setFilter, dataKey, color }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="today">Today</option>
        <option value="weekly">7 Days</option>
        <option value="monthly">1 Month</option>
        <option value="sixMonths">6 Months</option>
        <option value="yearly">12 Months</option>
      </select>
    </div>
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <Tooltip 
            formatter={(value) => [`₹${value}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2} 
            fill={`url(#color${dataKey})`} 
            dot={{ r: 3 }} 
            activeDot={{ r: 6 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const DataTable = ({ title, data, columns, currentPage, totalPages, setCurrentPage, totalItems, handleNavigation }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 font-semibold">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {columns.map((col, i) => {
                  const value = row[col.key];
                  return (
                    <td key={i} className="px-4 py-2">{value || "N/A"}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded ${currentPage === pageNum ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickActionButton = ({ label, route, handleNavigation }) => {
  return (
    <button 
      onClick={() => handleNavigation(route)} 
      className="bg-blue-600 text-white py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center"
    >
      {label}
    </button>
  );
};

export default Dashboard;