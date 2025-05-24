import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Створюємо тип для статистики
type StatsType = {
  activity1: { [key: string]: number },
  activity2: { [key: string]: number }
};

// Створюємо контекст для статистики
export const StatsContext = createContext<{
  stats: StatsType;
  updateStats: (activity: string, field: 'activity1' | 'activity2', increment: boolean) => void;
}>({ 
  stats: {
    activity1: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 },
    activity2: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 }
  },
  updateStats: () => {}
});

// Хук для використання статистики
export const useStats = () => useContext(StatsContext);

// Провайдер контексту статистики
export const StatsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [stats, setStats] = useState<StatsType>({
    activity1: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 },
    activity2: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 }
  });
  
  // Add a timestamp to force refreshing stats when needed
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(Date.now());
  
  // Функція для оновлення статистики
  const updateStats = (activity: string, field: 'activity1' | 'activity2', increment: boolean) => {
    console.log(`Updating stats: ${activity}, ${field}, increment=${increment}`);
    
    if (activity in stats[field]) {
      setStats(prevStats => {
        // Створюємо глибоку копію об'єкта, щоб уникнути мутацій
        const newStats = {
          activity1: { ...prevStats.activity1 },
          activity2: { ...prevStats.activity2 }
        };
        
        // Отримуємо поточне значення
        const currentValue = newStats[field][activity as keyof typeof newStats[typeof field]];
        
        // Встановлюємо нове значення (+1 або -1)
        newStats[field][activity as keyof typeof newStats[typeof field]] = 
          increment ? currentValue + 1 : Math.max(0, currentValue - 1);
        
        console.log('New stats:', newStats);
        return newStats;
      });
      
      // Also trigger a full refresh to ensure we're in sync with the database
      setRefreshTimestamp(Date.now());
    }
  };
  
  // Effect to load data from the database
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Отримуємо дані з бази, включаючи тільки видимі записи
        const { data, error } = await supabase
          .from('numbers')
          .select('*')
          .eq('visible', true);
          
        if (error) {
          console.error('Error fetching data:', error);
          return;
        }
        
        // Обчислюємо статистику
        const activityCounts = {
          activity1: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 },
          activity2: { 'KF': 0, 'Media': 0, 'SportEX': 0, 'SportIN': 0 }
        };
        
        if (data) {
          data.forEach(number => {
            // Only count numbers that are visible
            if (number.visible !== false) {
              if (number.activity1 && typeof number.activity1 === 'string' && 
                  number.activity1 in activityCounts.activity1) {
                activityCounts.activity1[number.activity1 as keyof typeof activityCounts.activity1] += 1;
              }
              
              if (number.activity2 && typeof number.activity2 === 'string' && 
                  number.activity2 in activityCounts.activity2) {
                activityCounts.activity2[number.activity2 as keyof typeof activityCounts.activity2] += 1;
              }
            }
          });
        }
        
        setStats(activityCounts);
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };
    
    // Load data on mount and whenever refreshTimestamp changes
    fetchAllData();
  }, [refreshTimestamp]);
  
  return (
    <StatsContext.Provider value={{ stats, updateStats }}>
      {children}
    </StatsContext.Provider>
  );
};

// Компонент для відображення статистики
const StatsDisplay: React.FC = () => {
  const { stats } = useStats();
  
  return (
    <div className="bg-gray-100 py-2 border-b border-gray-300">
      <div className="container mx-auto px-2 flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
        {/* Activity 1 */}
        <div className="mb-2 sm:mb-0 bg-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md shadow-sm">
          <div className="text-blue-600 font-medium mb-0.5 sm:mb-1 border-b pb-0.5 sm:pb-1">Activité 1</div>
          <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1">
            {/* Display activities in specific order: KF, Media, SportEX, SportIN */}
            {(['KF', 'Media', 'SportEX', 'SportIN'] as const).map(activity => (
              <div key={`a1-${activity}`} className="whitespace-nowrap flex items-center">
                <span className="font-medium mr-0.5 sm:mr-1">
                  {activity}:
                </span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-xs">{stats.activity1[activity]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Activity 2 */}
        <div className="bg-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-md shadow-sm">
          <div className="text-green-600 font-medium mb-0.5 sm:mb-1 border-b pb-0.5 sm:pb-1">Activité 2</div>
          <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1">
            {/* Display activities in specific order: KF, Media, SportEX, SportIN */}
            {(['KF', 'Media', 'SportEX', 'SportIN'] as const).map(activity => (
              <div key={`a2-${activity}`} className="whitespace-nowrap flex items-center">
                <span className="font-medium mr-0.5 sm:mr-1">
                  {activity}:
                </span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-xs">{stats.activity2[activity]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;

// Експортуємо також StatsProvider для використання у додатку
