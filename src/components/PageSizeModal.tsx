import React, { useState, useEffect } from 'react';
import { updatePageVisibility, getPageVisibilityCount, getPageActivityVisibility, updatePageActivityVisibility } from '../supabaseClient';

interface PageSizeModalProps {
  onClose: () => void;
}

const PageSizeModal: React.FC<PageSizeModalProps> = ({ onClose }) => {
  // Create state for all three pages
  const [counts, setCounts] = useState<{[key: number]: number}>({1: 54, 2: 54, 3: 54});
  const [isLoading, setIsLoading] = useState(false);
  
  // Activity settings for each page
  const [pageActivities, setPageActivities] = useState<Record<number, { activity1Enabled: boolean; activity2Enabled: boolean }>>(
    {
      1: { activity1Enabled: true, activity2Enabled: true },
      2: { activity1Enabled: true, activity2Enabled: true },
      3: { activity1Enabled: true, activity2Enabled: true }
    }
  );
  
  // Load all page sizes and activity settings on component mount
  useEffect(() => {
    const loadPageSizes = async () => {
      const newCounts: {[key: number]: number} = {
        1: 54,
        2: 54,
        3: 54
      };
      
      const newPageActivities: Record<number, { activity1Enabled: boolean; activity2Enabled: boolean }> = { 
        1: { activity1Enabled: true, activity2Enabled: true },
        2: { activity1Enabled: true, activity2Enabled: true },
        3: { activity1Enabled: true, activity2Enabled: true }
      };
      
      // Load counts and activity settings for all three pages
      for (let page = 1; page <= 3; page++) {
        // Load counts
        const { count, error } = await getPageVisibilityCount(page);
        if (!error && count !== undefined) {
          newCounts[page] = count; // Use count from database
        }
        
        // Load activity visibility settings for this page
        const { settings } = await getPageActivityVisibility(page);
        newPageActivities[page] = {
          activity1Enabled: settings.activity1Enabled,
          activity2Enabled: settings.activity2Enabled
        };
      }
      
      setCounts(newCounts);
      setPageActivities(newPageActivities);
    };
    
    loadPageSizes();
  }, []);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update all three pages
      for (let page = 1; page <= 3; page++) {
        // Update counts for this page
        await updatePageVisibility(page, counts[page]);
        
        // Update activity settings for this page
        await updatePageActivityVisibility(
          page,
          pageActivities[page].activity1Enabled, 
          pageActivities[page].activity2Enabled
        );
      }
      
      // Force a page reload to update the numbers display and statistics
      window.location.reload();
      
      // Note: The onClose will happen after reload
      onClose();
    } catch (error) {
      console.error('Error updating settings:', error);
      setIsLoading(false);
    }
    // No finally block needed since we're reloading the page
  };
  
  // Handle update when a page count changes - only update local state
  const handleCountChange = (page: number, newCount: number) => {
    // Update local state only
    setCounts(prevCounts => ({
      ...prevCounts,
      [page]: newCount
    }));
    
    // We'll save all changes at once when the Save button is clicked
    // This avoids too many page reloads while selecting different values
  };
  
  // Create array of options (1 to 54)
  const options = Array.from({ length: 54 }, (_, i) => i + 1);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-5 text-center">
          Select Quantity of Items Per Page
        </h2>
        
        {/* Page 1, 2, 3 sections with toggles */}
        {[1, 2, 3].map(pageNum => (
          <div key={pageNum} className="mb-5">
            <label htmlFor={`page${pageNum}Size`} className="block text-sm font-medium text-gray-700 mb-2">
              Page {pageNum} quantity (max 54):
            </label>
            <select
              id={`page${pageNum}Size`}
              className="h-10 w-full px-3 border border-gray-300 rounded-md mb-3"
              value={counts[pageNum]}
              onChange={(e) => handleCountChange(pageNum, Number(e.target.value))}
            >
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {/* Activity toggles in one row */}
            <div className="flex items-center space-x-4">
              {/* Activity 1 toggle */}
              <div 
                className="flex-1 flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setPageActivities(prev => ({
                    ...prev,
                    [pageNum]: {
                      ...prev[pageNum],
                      activity1Enabled: !prev[pageNum].activity1Enabled
                    }
                  }));
                }}
              >
                <label htmlFor={`page${pageNum}Activity1Toggle`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Activité 1
                </label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id={`page${pageNum}Activity1Toggle`} 
                    checked={pageActivities[pageNum].activity1Enabled}
                    onChange={() => {}} 
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-12 ${pageActivities[pageNum].activity1Enabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${pageActivities[pageNum].activity1Enabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
              
              {/* Activity 2 toggle */}
              <div 
                className="flex-1 flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setPageActivities(prev => ({
                    ...prev,
                    [pageNum]: {
                      ...prev[pageNum],
                      activity2Enabled: !prev[pageNum].activity2Enabled
                    }
                  }));
                }}
              >
                <label htmlFor={`page${pageNum}Activity2Toggle`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Activité 2
                </label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id={`page${pageNum}Activity2Toggle`} 
                    checked={pageActivities[pageNum].activity2Enabled}
                    onChange={() => {}} 
                    className="sr-only"
                  />
                  <div className={`block h-6 rounded-full w-12 ${pageActivities[pageNum].activity2Enabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${pageActivities[pageNum].activity2Enabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex space-x-4">
          <button
            className="w-1/2 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium flex items-center justify-center"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            className="w-1/2 h-10 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageSizeModal;
