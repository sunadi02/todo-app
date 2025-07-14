import { Menu } from "lucide-react";

const SidebarToggle = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className={`fixed z-50 top-6 ${
        isSidebarOpen ? 'left-[22rem] mt-14' : 'left-6 mt-14'
      } p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-all duration-300`}
    >
      <Menu size={24} />
    </button>
  );
};

export default SidebarToggle;