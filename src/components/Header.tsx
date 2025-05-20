import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">Lecole Technique</h1>
        <p className="text-gray-600">Interactive Number Grid</p>
      </div>
    </header>
  );
};

export default Header;
