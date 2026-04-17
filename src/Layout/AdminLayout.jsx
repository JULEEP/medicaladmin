import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF0F1]">
      {/* Sidebar Container 
        We transition the width instead of removing it to keep the flex layout stable.
      */}
      <div 
        className={`transition-all duration-300 ease-in-out z-50 ${
          isMobile 
            ? (isCollapsed ? "w-0 overflow-hidden" : "fixed inset-y-0 left-0 w-64") 
            : (isCollapsed ? "w-20" : "w-64")
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content 
        1. flex-1: Fills all remaining space.
        2. min-w-0: The MAGIC fix. Prevents the container from expanding past 100% width if children are wide.
      */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar 
          setIsCollapsed={setIsCollapsed} 
          isCollapsed={isCollapsed} 
          isMobile={isMobile}
        />

        <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
}