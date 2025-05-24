import React, { useEffect, useState, useRef } from 'react';
import { supabase, NumberRecord } from '../supabaseClient';
import html2canvas from 'html2canvas';

interface ExportModalProps {
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<{[key: number]: NumberRecord[]}>({});
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Activities in the required order
  const activities = ['KF', 'Media', 'SportEX', 'SportIN'];
  
  useEffect(() => {
    const fetchAllPageData = async () => {
      setLoading(true);
      
      try {
        // Fetch data for all 3 pages
        const pagePromises = [1, 2, 3].map(async (page) => {
          const { data, error } = await supabase
            .from('numbers')
            .select('*')
            .eq('page', page)
            .order('number', { ascending: true });
            
          if (error) {
            console.error(`Error fetching page ${page}:`, error);
            return { page, data: [] };
          }
          
          // Note: We still fetch all numbers even if not visible to keep the full data structure
          // The filtering will be done at the rendering stage
          return { page, data: data as NumberRecord[] };
        });
        
        const results = await Promise.all(pagePromises);
        
        // Transform results to object with page numbers as keys
        const pagesData: {[key: number]: NumberRecord[]} = {};
        results.forEach(result => {
          pagesData[result.page] = result.data;
        });
        
        setPageData(pagesData);
      } catch (error) {
        console.error('Error fetching all page data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllPageData();
  }, []);
  
  const exportPage = async (page: number) => {
    if (!exportRefs.current[page - 1]) return;
    
    try {
      const element = exportRefs.current[page - 1];
      if (!element) return;
      
      // Створюємо клон елемента для експорту
      const cloneContainer = document.createElement('div');
      cloneContainer.style.position = 'absolute';
      cloneContainer.style.top = '-9999px';
      cloneContainer.style.left = '-9999px';
      cloneContainer.style.width = '1200px'; // Фіксована ширина для консистентності
      cloneContainer.style.zIndex = '-1';
      
      // Клонуємо елемент для експорту
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      
      // Додаємо клон до DOM тимчасово
      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);
      
      // Даємо браузеру час на рендеринг клонованого елемента
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        backgroundColor: 'white',
        logging: false,
        width: 1200, // Фіксована ширина для консистентності
        height: clone.scrollHeight, // Повна висота контенту
        windowWidth: 1200,
        windowHeight: clone.scrollHeight,
        // Переконуємося, що захоплюється весь вміст
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        useCORS: true,
      });
      
      // Видаляємо тимчасовий елемент
      document.body.removeChild(cloneContainer);
      
      const image = canvas.toDataURL('image/png');
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = `page-${page}-export.png`;
      downloadLink.click();
    } catch (error) {
      console.error(`Error exporting page ${page}:`, error);
    }
  };
  
  const exportAllPages = () => {
    [1, 2, 3].forEach(page => {
      exportPage(page);
    });
  };
  
  // Check if a specific activity is selected for a number
  const isActivitySelected = (number: NumberRecord, activityField: 'activity1' | 'activity2', activity: string) => {
    return number[activityField] === activity;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-6xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">Export Data</h2>
          <button
            className="h-8 px-3 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end mb-2">
              <button 
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
                onClick={exportAllPages}
              >
                Export All Pages
              </button>
            </div>
            
            {[1, 2, 3].map((page, pageIndex) => (
              <div key={page} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Page {page}</h3>
                  <button 
                    className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center justify-center"
                    onClick={() => exportPage(page)}
                  >
                    Export Page {page}
                  </button>
                </div>
                
                <div 
                  ref={(el: HTMLDivElement | null) => { exportRefs.current[pageIndex] = el }}
                  className="overflow-auto border border-gray-300 rounded-lg p-4"
                  style={{ minWidth: '300px' }}
                >
                  <table className="border-collapse" style={{ width: 'fit-content', margin: '0 auto' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        {activities.map(activity => (
                          <th key={`head-act1-${activity}`} className="border border-gray-300 p-2 text-center">
                            {activity}
                          </th>
                        ))}
                        <th className="border border-gray-300 px-1 py-2 text-center" style={{ width: 'min-content' }}>Number</th>
                        {activities.map(activity => (
                          <th key={`head-act2-${activity}`} className="border border-gray-300 p-2 text-center">
                            {activity}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData[page]?.filter(number => number.visible !== false).map((number) => (
                        <tr key={number.id} className="hover:bg-gray-50">
                          {/* Activity 1 Columns */}
                          {activities.map(activity => (
                            <td key={`a1-${activity}-${number.id}`} className="border border-gray-300 px-1 py-2 text-center" style={{ width: 'min-content' }}>
                              {isActivitySelected(number, 'activity1', activity) ? 'X' : ''}
                            </td>
                          ))}
                          
                          {/* Number Column */}
                          <td className="border border-gray-300 px-1 py-2 text-center font-medium" style={{ width: 'min-content' }}>
                            {number.number}
                          </td>
                          
                          {/* Activity 2 Columns */}
                          {activities.map(activity => (
                            <td key={`a2-${activity}-${number.id}`} className="border border-gray-300 px-1 py-2 text-center" style={{ width: 'min-content' }}>
                              {isActivitySelected(number, 'activity2', activity) ? 'X' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-5 flex justify-center">
          <button
            className="h-10 px-4 bg-gray-300 hover:bg-gray-400 rounded-md flex items-center justify-center"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
