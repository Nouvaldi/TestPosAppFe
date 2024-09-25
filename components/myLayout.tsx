import React from "react";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-6 grid-rows-1 gap-1">
      <Sidebar className="" />
      <main className="flex-1 col-span-5 p-5">{children}</main>
    </div>
  );
};

export default Layout;
