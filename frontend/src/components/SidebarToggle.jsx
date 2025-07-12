import { Menu } from "lucide-react";

const SidebarToggle = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className={`fixed z-50 top-4 left-4 p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-all ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}
    >
      <Menu size={24} />
    </button>
  );
};

export default SidebarToggle;