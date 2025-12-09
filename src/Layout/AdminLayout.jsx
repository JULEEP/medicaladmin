import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!isCollapsed && (
        <Sidebar
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-full" : ""
        }`}
        style={{ width: isCollapsed ? "100%" : "auto" }}
      >
        {/* Navbar */}
        <Navbar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />

        <div className="p-4 overflow-y-scroll no-scrollbar bg-[#EFF0F1] flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
