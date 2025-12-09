import { useState, useEffect, useRef } from "react";
import { MdOutlineFeed } from "react-icons/md";
import { FaPrescriptionBottleAlt } from "react-icons/fa";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { FaExpand, FaCompress } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  const [notificationCount, setNotificationCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const readNotificationIds = useRef(new Set());
  const previousNotifTotalCount = useRef(0);

  // 🔊 Sound + Alert for new notifications
  const triggerNotificationAlert = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);

    alert("🔔 New notification received!");
  };

  // 🔄 Fetch notifications and prescriptions
  const fetchCounts = async () => {
    try {
      const [notifRes, prescriptionRes] = await Promise.all([
        axios.get("http://31.97.206.144:7021/api/admin/allnotifications"),
        axios.get("http://31.97.206.144:7021/api/admin/alluploadprescription"),
      ]);

      const notifications = notifRes.data || [];
      const currentTotalCount = notifications.length;

      // Check if new notifications were added (length increased)
      if (currentTotalCount > previousNotifTotalCount.current) {
        triggerNotificationAlert();
      }

      previousNotifTotalCount.current = currentTotalCount;

      // Only show count of unread (not in readNotificationIds)
      const unread = notifications.filter(
        (n) => !readNotificationIds.current.has(n._id)
      );

      setNotificationCount(unread.length);
      setPrescriptionCount(prescriptionRes.data.length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchCounts(); // Initial load
    const interval = setInterval(fetchCounts, 10000); // Every 10s
    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle function
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // ✅ Mark all as read locally
  const handleNotificationsClick = async () => {
    try {
      const notifRes = await axios.get("http://31.97.206.144:7021/api/admin/allnotifications");
      const notifications = notifRes.data || [];

      notifications.forEach((n) => readNotificationIds.current.add(n._id));

      setNotificationCount(0); // Reset display
      navigate("/notifications");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-28 px-4 flex items-center shadow-lg z-50">
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="text-xl p-2 hover:bg-blue-700 rounded-lg transition-colors"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      {/* Notifications & Prescriptions */}
      <div className="flex gap-6 ml-4">
        {/* 🔔 Notifications */}
        <div
          className="flex items-center gap-1 relative cursor-pointer hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
          onClick={handleNotificationsClick}
          title="View Notifications"
        >
          <MdOutlineFeed className="text-3xl text-white" />
          <span className="text-white font-medium">Notifications</span>
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>

        {/* 💊 Prescriptions */}
        <div
          className="flex items-center gap-1 relative cursor-pointer hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
          onClick={() => navigate("/prescriptions")}
          title="View Prescriptions"
        >
          <FaPrescriptionBottleAlt className="text-3xl text-white" />
          <span className="text-white font-medium">Prescriptions</span>
          {prescriptionCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {prescriptionCount}
            </span>
          )}
        </div>
      </div>

      {/* Right-side Controls */}
      <div className="flex justify-between items-center w-full ml-4">
        <div className="flex gap-3">
          {/* Additional left-side items can go here */}
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullScreen}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? (
              <FaCompress className="text-xl text-white" />
            ) : (
              <FaExpand className="text-xl text-white" />
            )}
            <span className="text-white font-medium hidden sm:block">
              {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </button>

          {/* Logo */}
          <div className="flex flex-col justify-center items-center">
            <img 
              className="rounded-full w-12 h-12 object-cover border-2 border-white" 
              src="/logo.png" 
              alt="Admin Logo" 
            />
            <h1 className="text-xs text-white mt-1">CLYNIX</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;