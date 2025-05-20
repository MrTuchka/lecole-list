import React, { useState, useEffect } from 'react';
import { getNumbersByPage, updateNumberStatus, clearAllStatuses, NumberRecord, supabase } from '../supabaseClient';

interface NumberGridProps {
  page: number;
}

type StatusOption = 'Media' | 'Cafe' | 'Sport EXT' | 'Sport INT';

const NumberGrid: React.FC<NumberGridProps> = ({ page }) => {
  const [numbers, setNumbers] = useState<NumberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<NumberRecord | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Load numbers from database
  useEffect(() => {
    const fetchNumbers = async () => {
      setLoading(true);
      const { data, error } = await getNumbersByPage(page);
      
      if (error) {
        console.error('Error fetching numbers:', error);
      } else if (data) {
        setNumbers(data);
      } else {
        // If no data is found, create initial numbers for this page
        const initialNumbers: NumberRecord[] = [];
        for (let i = 1; i <= 54; i++) {
          const numberStr = i < 10 ? `0${i}` : `${i}`;
          initialNumbers.push({
            id: i,
            number: `${page}-${numberStr}`,
            page: page,
            status: null
          });
        }
        setNumbers(initialNumbers);
      }
      
      setLoading(false);
    };

    fetchNumbers();
  }, [page]);

  // Handle number click
  const handleNumberClick = (number: NumberRecord) => {
    setSelectedNumber(number);
    setShowPopup(true);
  };

  // Handle status selection
  const handleStatusSelect = async (status: StatusOption) => {
    if (!selectedNumber) return;

    try {
      await updateNumberStatus(selectedNumber.id, status);
      
      // Update local state
      setNumbers(numbers.map(n => 
        n.id === selectedNumber.id 
          ? { ...n, status: status } 
          : n
      ));
      
      // Close popup
      setShowPopup(false);
      setSelectedNumber(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  // Handle clearing a single number's status
  const handleClearSingleStatus = async () => {
    if (!selectedNumber) return;

    try {
      const { data, error } = await supabase
        .from('numbers')
        .update({ status: null })
        .eq('id', selectedNumber.id);
      
      if (error) {
        console.error('Error clearing status:', error);
        return;
      }
      
      // Update local state
      setNumbers(numbers.map(n => 
        n.id === selectedNumber.id 
          ? { ...n, status: null } 
          : n
      ));
      
      // Close popup
      setShowPopup(false);
      setSelectedNumber(null);
    } catch (error) {
      console.error('Error clearing status:', error);
    }
  };

  // Determine background color based on status
  const getBackgroundColor = (status: string | null) => {
    return status ? 'bg-red-500 text-white' : 'bg-gray-200';
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }

  // Handle showing clear confirmation
  const showClearConfirmationDialog = () => {
    setShowClearConfirmation(true);
  };

  // Handle clear all statuses after confirmation
  const handleClearAll = async () => {
    try {
      const { error } = await clearAllStatuses();
      
      if (error) {
        console.error('Error clearing statuses:', error);
        return;
      }
      
      // Update local state to reflect cleared statuses
      setNumbers(numbers.map(n => ({ ...n, status: null })));
      
      // Close confirmation dialog
      setShowClearConfirmation(false);
    } catch (error) {
      console.error('Error clearing statuses:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-5">
        <button 
          className="h-10 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-md px-4 flex items-center justify-center"
          onClick={showClearConfirmationDialog}
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-5">
        {numbers.map((number) => (
          <button
            key={number.id}
            className={`${getBackgroundColor(number.status)} border border-gray-300 rounded-lg p-2 h-10 md:h-12 lg:h-10 w-full flex items-center justify-center text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-all`}
            onClick={() => handleNumberClick(number)}
          >
            {number.number}
          </button>
        ))}
      </div>

      {/* Status Selection Popup */}
      {showPopup && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full">
            <h2 className="text-xl font-bold mb-5 text-center">
              Select option for {selectedNumber.number}
            </h2>
            <div className="space-y-5">
              {['Media', 'Cafe', 'Sport EXT', 'Sport INT'].map((option) => (
                <button
                  key={option}
                  className={`w-full h-10 rounded-md font-medium flex items-center justify-center ${selectedNumber.status === option 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  onClick={() => handleStatusSelect(option as StatusOption)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-5 flex space-x-4">
              {selectedNumber.status && (
                <button
                  className="w-1/2 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium flex items-center justify-center"
                  onClick={handleClearSingleStatus}
                >
                  Clear
                </button>
              )}
              <button
                className={`${selectedNumber.status ? 'w-1/2' : 'w-full'} h-10 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center`}
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Confirmation Popup */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full">
            <h2 className="text-xl font-bold mb-5 text-center">
              Confirmation
            </h2>
            <p className="text-center mb-5">
              Are you sure you want to clear all selected locations?
            </p>
            <div className="flex space-x-5">
              <button
                className="w-1/2 h-10 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium flex items-center justify-center"
                onClick={handleClearAll}
              >
                Yes
              </button>
              <button
                className="w-1/2 h-10 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center"
                onClick={() => setShowClearConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberGrid;
