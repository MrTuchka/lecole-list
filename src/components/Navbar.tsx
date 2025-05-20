import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-gray-800 py-3 px-4">
      <div className="container mx-auto flex justify-center">
        <div className="flex space-x-5">
          <Link
            to="/page/1"
            className={`h-10 px-4 flex items-center justify-center rounded-md text-lg font-medium ${
              location.pathname === '/page/1' || location.pathname === '/' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            1
          </Link>
          <Link
            to="/page/2"
            className={`h-10 px-4 flex items-center justify-center rounded-md text-lg font-medium ${
              location.pathname === '/page/2' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            2
          </Link>
          <Link
            to="/page/3"
            className={`h-10 px-4 flex items-center justify-center rounded-md text-lg font-medium ${
              location.pathname === '/page/3' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            3
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
