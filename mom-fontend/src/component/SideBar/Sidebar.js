import React from "react";
import { HiHome, HiUser, HiCog, HiShoppingCart, HiInformationCircle } from "react-icons/hi";

const Sidebar = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="bg-blue-600 text-white w-64 p-5">
        <h1 className="text-2xl font-semibold mb-8">App Name</h1>
        <nav>
          <ul>
            <SidebarItem href="#" icon={<HiHome />} label="Home" />
            <SidebarItem href="#" icon={<HiUser />} label="Profile" />
            <SidebarItem href="#" icon={<HiShoppingCart />} label="Shop" />
            <SidebarItem href="#" icon={<HiCog />} label="Settings" />
            <SidebarItem href="#" icon={<HiInformationCircle />} label="About" />
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      </div>
    </div>
  );
};

const SidebarItem = ({ href, icon, label }) => {
  return (
    <li className="mb-4">
      <a
        href={href}
        className="flex items-center space-x-4 py-2 px-3 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        <span className="text-xl">{icon}</span>
        <span className="text-lg">{label}</span>
      </a>
    </li>
  );
};

export default Sidebar;
