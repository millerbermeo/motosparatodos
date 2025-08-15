import React from "react";

const Navbar: React.FC = () => {
  return (
    <div className="w-full bg-white/80 pl-20 backdrop-blur border-b border-gray-200 px-4 py-5 flex items-center justify-between">
      <h1 className="text-[15px] md:text-base font-medium text-gray-700">
        Panel de Administración (estático)
      </h1>
      <div className="text-sm text-gray-500">v1.0</div>
    </div>
  );
};

export default Navbar;
