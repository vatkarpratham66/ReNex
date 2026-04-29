import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 px-4 pb-28 pt-4 sm:px-6 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
