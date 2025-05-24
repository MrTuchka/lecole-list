import React, { useState, useEffect } from 'react';
import { getNumbersByPage, NumberRecord, getPageActivityVisibility, clearAllActivities, supabase } from '../supabaseClient';
import { useStats } from './StatsDisplay';
import { useClearContext } from './ClearContext';

interface NumberGridProps {
  page: number;
}

type ActivityOption = 'KF' | 'Media' | 'SportEX' | 'SportIN';

const NumberGrid: React.FC<NumberGridProps> = ({ page }) => {
  const [numbers, setNumbers] = useState<NumberRecord[]>([]);
  const [activity1Enabled, setActivity1Enabled] = useState(true);
  const [activity2Enabled, setActivity2Enabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<NumberRecord | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const { updateStats } = useStats();
  const { isDialogVisible: showClearConfirmation, hideClearDialog } = useClearContext();

  // Load numbers from database and activity settings
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
            activity1: null,
            activity2: null,
            visible: true // All numbers are visible by default
          });
        }
        setNumbers(initialNumbers);
      }
      
      setLoading(false);
    };

    const loadActivitySettings = async () => {
      const { settings } = await getPageActivityVisibility(page);
      setActivity1Enabled(settings.activity1Enabled);
      setActivity2Enabled(settings.activity2Enabled);
    };

    fetchNumbers();
    loadActivitySettings();
  }, [page]);

  // Handle number click
  const handleNumberClick = (number: NumberRecord) => {
    setSelectedNumber(number);
    setShowPopup(true);
  };

  // Handle activity1 selection
  const handleActivity1Select = async (activity: ActivityOption) => {
    if (!selectedNumber) return;

    try {
      // Check if the activity is already selected, if so, clear it
      const isRemoving = selectedNumber.activity1 === activity;
      const newActivity = isRemoving ? null : activity;
      
      // Визначаємо попередню активність для оновлення статистики
      const prevActivity = selectedNumber.activity1;
      
      // Оновлюємо дані в базі
      await supabase
        .from('numbers')
        .update({ activity1: newActivity })
        .eq('id', selectedNumber.id);
      
      // Update local state
      setNumbers(numbers.map(n => 
        n.id === selectedNumber.id 
          ? { ...n, activity1: newActivity } 
          : n
      ));
      
      // Update selectedNumber state to reflect the change in the popup
      setSelectedNumber(prev => prev ? {...prev, activity1: newActivity} : null);
      
      // Оновлюємо статистику - спочатку видаляємо стару активність, якщо вона була
      if (prevActivity) {
        updateStats(prevActivity, 'activity1', false);
      }
      
      // Потім додаємо нову активність, якщо вона є
      if (newActivity && !isRemoving) {
        updateStats(newActivity, 'activity1', true);
      }
    } catch (error) {
      console.error('Error updating activity1:', error);
    }
  };
  
  // Handle activity2 selection
  const handleActivity2Select = async (activity: ActivityOption) => {
    if (!selectedNumber) return;

    try {
      // Check if the activity is already selected, if so, clear it
      const isRemoving = selectedNumber.activity2 === activity;
      const newActivity = isRemoving ? null : activity;
      
      // Визначаємо попередню активність для оновлення статистики
      const prevActivity = selectedNumber.activity2;
      
      // Оновлюємо дані в базі
      await supabase
        .from('numbers')
        .update({ activity2: newActivity })
        .eq('id', selectedNumber.id);
      
      // Update local state
      setNumbers(numbers.map(n => 
        n.id === selectedNumber.id 
          ? { ...n, activity2: newActivity } 
          : n
      ));
      
      // Update selectedNumber state to reflect the change in the popup
      setSelectedNumber(prev => prev ? {...prev, activity2: newActivity} : null);
      
      // Оновлюємо статистику - спочатку видаляємо стару активність, якщо вона була
      if (prevActivity) {
        updateStats(prevActivity, 'activity2', false);
      }
      
      // Потім додаємо нову активність, якщо вона є
      if (newActivity && !isRemoving) {
        updateStats(newActivity, 'activity2', true);
      }
    } catch (error) {
      console.error('Error updating activity2:', error);
    }
  };
  
  // Handle clearing a single number's activities
  const handleClearSingleActivities = async () => {
    if (!selectedNumber) return;

    try {
      const { error } = await supabase
        .from('numbers')
        .update({ activity1: null, activity2: null })
        .eq('id', selectedNumber.id);
      
      if (error) {
        console.error('Error clearing activities:', error);
        return;
      }
      
      // Update statistics context before updating local state
      if (selectedNumber.activity1) {
        updateStats(selectedNumber.activity1, 'activity1', false);
      }
      if (selectedNumber.activity2) {
        updateStats(selectedNumber.activity2, 'activity2', false);
      }
      
      // Update local state
      setNumbers(numbers.map(n => 
        n.id === selectedNumber.id 
          ? { ...n, activity1: null, activity2: null } 
          : n
      ));
      
      // Keep popup open, just update the selectedNumber state
      setSelectedNumber(prev => prev ? {...prev, activity1: null, activity2: null} : null);
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  };
  
  // Handle close popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedNumber(null);
  };

  // Determine background color based on activities
  const getBackgroundColor = (number: NumberRecord) => {
    return number.activity1 || number.activity2 ? 'bg-red-500 text-white' : 'bg-gray-200';
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }
  
  // Filter numbers based on visibility
  const visibleNumbers = numbers.filter(number => number.visible !== false);

  // Clear All функціональність тепер управляється через контекст

  // Handle clear all activities after confirmation
  const handleClearAll = async () => {
    try {
      // Отримуємо поточні дані для зниження статистики
      const activitiesData: {activity: string, field: 'activity1' | 'activity2'}[] = [];
      
      // Збираємо всі активності, які потрібно зняти зі статистики
      numbers.forEach(number => {
        if (number.activity1) {
          activitiesData.push({activity: number.activity1, field: 'activity1'});
        }
        if (number.activity2) {
          activitiesData.push({activity: number.activity2, field: 'activity2'});
        }
      });
      
      // Викликаємо API для очищення всіх активностей
      const { error } = await clearAllActivities();
      
      if (error) {
        console.error('Error clearing activities:', error);
        return;
      }
      
      // Оновлюємо локальний стан, щоб відобразити очищені активності
      setNumbers(numbers.map(n => ({ ...n, activity1: null, activity2: null })));
      
      // Зниження статистики для кожної активності
      activitiesData.forEach(item => {
        updateStats(item.activity, item.field, false);
      });
      
      // Закриваємо діалог підтвердження
      hideClearDialog();
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Кнопка Clear All перенесена в навігаційне меню */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-5">
        {visibleNumbers.map((number) => (
          <button
            key={number.id}
            className={`${getBackgroundColor(number)} border border-gray-300 rounded-lg p-2 h-10 md:h-12 lg:h-10 w-full flex items-center justify-center text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-all`}
            onClick={() => handleNumberClick(number)}
          >
            {number.number}
          </button>
        ))}
      </div>

      {/* Activity Selection Popup */}
      {showPopup && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClosePopup}>
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-5 text-center">
              Select activities for {selectedNumber.number}
            </h2>
            <div className="flex space-x-6">
              {/* Activite 1 Column */}
              <div className="flex-1">
                <h3 className="font-medium text-center mb-3 text-lg">Activité 1</h3>
                <div className="space-y-3">
                  {['KF', 'Media', 'SportEX', 'SportIN'].map((option) => (
                    <button
                      key={option}
                      className={`w-full h-10 rounded-md font-medium flex items-center justify-center ${selectedNumber.activity1 === option 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} ${!activity1Enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => activity1Enabled && handleActivity1Select(option as ActivityOption)}
                      disabled={!activity1Enabled}
                    >
                      {option}
                    </button>
                  ))}
                  {!activity1Enabled && (
                    <div className="text-xs text-center text-gray-500 mt-1">
                      Activité 1 is disabled in settings
                    </div>
                  )}
                </div>
              </div>
              
              {/* Activite 2 Column */}
              <div className="flex-1">
                <h3 className="font-medium text-center mb-3 text-lg">Activité 2</h3>
                <div className="space-y-3">
                  {['KF', 'Media', 'SportEX', 'SportIN'].map((option) => (
                    <button
                      key={option}
                      className={`w-full h-10 rounded-md font-medium flex items-center justify-center ${selectedNumber.activity2 === option 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} ${!activity2Enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => activity2Enabled && handleActivity2Select(option as ActivityOption)}
                      disabled={!activity2Enabled}
                    >
                      {option}
                    </button>
                  ))}
                  {!activity2Enabled && (
                    <div className="text-xs text-center text-gray-500 mt-1">
                      Activité 2 is disabled in settings
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex space-x-4">
              <button
                className="w-1/2 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium flex items-center justify-center"
                onClick={handleClearSingleActivities}
              >
                Clear
              </button>
              <button
                className="w-1/2 h-10 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center"
                onClick={handleClosePopup}
              >
                Close
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
                onClick={hideClearDialog}
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
