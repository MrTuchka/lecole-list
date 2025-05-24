import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExportModal from './ExportModal';
import PageSizeModal from './PageSizeModal';
import GenerateListsModal from './GenerateListsModal';
import { useClearContext } from './ClearContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPageSizeModal, setShowPageSizeModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGenerateListsModal, setShowGenerateListsModal] = useState(false);
  const { showClearDialog } = useClearContext();
  
  // No longer need the mobile size check as we're using CSS media queries
  
  // Close mobile menu when location changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);
  
  return (
    <nav className="bg-gray-800 py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Desktop buttons - left side */}
        <div className="hidden md:flex md:flex-none">
          <button 
            onClick={() => setShowPageSizeModal(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Quantity
          </button>
        </div>
        
        {/* Empty div for left side on mobile to maintain layout */}
        <div className="md:hidden flex-none">
        </div>
        
        {/* Page number links - always visible */}
        <div className="flex space-x-5 flex-1 justify-center">
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
        
        {/* Desktop buttons - right side */}
        <div className="hidden md:flex md:space-x-3">
          <button 
            onClick={showClearDialog}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Report
          </button>
          <button 
            onClick={() => setShowGenerateListsModal(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Generate Lists
          </button>
        </div>
        
        {/* Mobile menu button - right side */}
        <div className="md:hidden flex-none">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-gray-700 mt-2 rounded-md overflow-hidden">
          <div className="p-3 space-y-2">
            <button 
              onClick={() => {
                setShowPageSizeModal(true);
                setShowMobileMenu(false);
              }}
              className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Quantity
            </button>
            <button 
              onClick={() => {
                setShowExportModal(true);
                setShowMobileMenu(false);
              }}
              className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Report
            </button>
            <button 
              onClick={() => {
                setShowGenerateListsModal(true);
                setShowMobileMenu(false);
              }}
              className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Generate Lists
            </button>
            <button 
              onClick={() => {
                showClearDialog();
                setShowMobileMenu(false);
              }}
              className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      )}
      
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}

      {showPageSizeModal && (
        <PageSizeModal onClose={() => setShowPageSizeModal(false)} />
      )}

      {showGenerateListsModal && (
        <GenerateListsModal onClose={() => setShowGenerateListsModal(false)} />
      )}
    </nav>
  );
};

export default Navbar;
