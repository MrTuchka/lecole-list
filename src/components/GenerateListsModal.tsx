import React, { useState, useRef, useEffect } from 'react';
import { getAllNumbers, NumberRecord } from '../supabaseClient';

interface GenerateListsModalProps {
  onClose: () => void;
}

interface ProcessedEntry {
  id: string; // Format like "1-01"
  name: string;
}

interface ActivityEntry {
  name: string;
  id: string;
}

interface ActivityCounts {
  KF: ActivityEntry[];
  Media: ActivityEntry[];
  SportEX: ActivityEntry[];
  SportIN: ActivityEntry[];
  [key: string]: ActivityEntry[];
}

interface ActivityReport {
  activity1: ActivityCounts;
  activity2: ActivityCounts;
  unidentified: ProcessedEntry[];
}

const GenerateListsModal: React.FC<GenerateListsModalProps> = ({ onClose }) => {
  const [inputData, setInputData] = useState('');
  const [dbNumbers, setDbNumbers] = useState<NumberRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Helper function to get colors for activity types
  const getActivityTypeColor = (type: string): string => {
    switch (type) {
      case 'KF': return '#28a745'; // Green
      case 'Media': return '#fd7e14'; // Orange
      case 'SportEX': return '#6f42c1'; // Purple
      case 'SportIN': return '#20c997'; // Teal
      default: return '#007bff'; // Blue
    }
  };

  // Fetch all numbers from the database when component mounts
  useEffect(() => {
    const fetchAllNumbers = async () => {
      setLoading(true);
      try {
        const { data, error } = await getAllNumbers();
        if (error) {
          console.error('Error fetching numbers:', error);
        } else if (data) {
          setDbNumbers(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNumbers();
  }, []);

  // Parse input data to extract entries
  const parseInput = (input: string): ProcessedEntry[] => {
    // Normalize input: replace new lines with spaces and split by commas or spaces
    const rawEntries = input.replace(/\n/g, ' ').split(/[,\s]+/);
    const entries: string[] = [];
    
    // Process entries to reconstruct the format X-YY Name Surname
    let currentEntry = '';
    for (const part of rawEntries) {
      // Skip empty parts
      if (!part.trim()) continue;
      
      // Check if this part starts a new entry (has format X-YY)
      if (part.match(/^\d+-\d+$/)) {
        // If we have a current entry, push it to entries
        if (currentEntry) {
          entries.push(currentEntry.trim());
        }
        // Start a new entry
        currentEntry = part;
      } else if (currentEntry) {
        // This part is a continuation (name part)
        currentEntry += ' ' + part;
      }
    }
    
    // Add the last entry if there is one
    if (currentEntry) {
      entries.push(currentEntry.trim());
    }
    
    console.log('Processed input entries:', entries);
    
    // Convert string entries to structured objects
    const processedEntries: ProcessedEntry[] = [];
    
    for (const entry of entries) {
      // Match the format X-YY with or without name
      const match = entry.match(/(\d+)-(\d+)(?:\s+(.+))?/);
      
      if (!match) {
        console.log('No match for entry:', entry);
        continue;
      }
      
      const activityNumber = match[1];
      const personNumber = match[2];
      const fullName = match[3]?.trim() || 'NO NAME';
      const id = `${activityNumber}-${personNumber}`;
      
      processedEntries.push({
        id,
        name: fullName
      });
    }
    
    return processedEntries;
  };

  // Process data by matching input entries with database records
  const processData = (inputEntries: ProcessedEntry[]): ActivityReport => {
    // Create report structure
    const report: ActivityReport = {
      activity1: {
        KF: [],
        Media: [],
        SportEX: [],
        SportIN: []
      },
      activity2: {
        KF: [],
        Media: [],
        SportEX: [],
        SportIN: []
      },
      unidentified: []
    };
    
    // Create a map of input entries for quick lookup
    const inputEntriesMap = new Map<string, string>();
    inputEntries.forEach(entry => {
      inputEntriesMap.set(entry.id, entry.name);
    });
    // Create a set of database numbers for quick existence check
    const dbNumbersSet = new Set<string>();
    dbNumbers.forEach(record => {
      dbNumbersSet.add(record.number);
    });
    
    // Process data by matching input entries with database records
    for (const inputEntry of inputEntries) {
      // Look for this entry in our database records
      const match = dbNumbers.find(record => record.number === inputEntry.id);
      
      if (match) {
        // Found a match in the database
        if (match.activity1) {
          // Add to activity1 group - pass both name and id
          report.activity1[match.activity1].push({
            name: inputEntry.name,
            id: inputEntry.id
          });
        }
        
        if (match.activity2) {
          // Add to activity2 group - pass both name and id
          report.activity2[match.activity2].push({
            name: inputEntry.name,
            id: inputEntry.id
          });
        }
        
        // If no activities are set for this number, add to unidentified
        if (!match.activity1 && !match.activity2) {
          report.unidentified.push(inputEntry);
        }
      } else {
        // No match in database, add to unidentified
        report.unidentified.push(inputEntry);
      }
    }
    
    console.log('Processed report:', report);
    return report;
  };

  const generateImage = () => {
    if (!canvasRef.current || dbNumbers.length === 0) return;
    setLoading(true);
    
    // Process the input data
    const inputEntries = parseInput(inputData);
    const report = processData(inputEntries);
    
    // Get total entries count to estimate report size
    const totalEntries = Object.values(report.activity1).reduce((sum, arr) => sum + arr.length, 0) +
                        Object.values(report.activity2).reduce((sum, arr) => sum + arr.length, 0) +
                        report.unidentified.length;
    
    console.log('Report generated with entries:', totalEntries);
    
    // Configure canvas size - Portrait A4 ratio
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // A4 portrait with some margin for better printing
    canvas.width = 800;
  
    // Calculate canvas height based on total entries to ensure everything fits
    // For larger numbers of entries, make the canvas taller
    const baseHeight = 1131; // Approximate A4 ratio (1:1.414)
    const additionalHeight = totalEntries > 50 ? (totalEntries - 50) * 5 : 0;
    canvas.height = baseHeight + additionalHeight;
    
    // Reset canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add paper shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ffffff';
    const paperMargin = 20;
    ctx.fillRect(paperMargin, paperMargin, canvas.width - paperMargin * 2, canvas.height - paperMargin * 2);
    
    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Dimensions for content area
    const padding = 40;
    
    // Count the total number of people being processed
    const totalPeopleCount = inputEntries.length;
    
    // Log the number of entries in each activity for debugging
    console.log('Activity1 entries:', Object.entries(report.activity1).map(([type, entries]) => `${type}: ${entries.length}`));
    console.log('Activity2 entries:', Object.entries(report.activity2).map(([type, entries]) => `${type}: ${entries.length}`));
    
    // Prepare date string
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const contentY = 130; // Start after header
    const contentHeight = canvas.height - contentY - padding;
    
    // Calculate available space and adjust font sizes if needed
    const activityTypes = ['KF', 'Media', 'SportEX', 'SportIN'];
    const lineHeight = totalEntries > 30 ? 24 : 30; // Smaller line height for more entries
    const fontSize = totalEntries > 30 ? 14 : 16; // Smaller font for more entries
    const titleFontSize = totalEntries > 30 ? 22 : 28; // Smaller title font for more entries
    const activityHeaderSize = totalEntries > 30 ? 18 : 22; // Smaller headers for more entries
    
    // Create a dark header background
    ctx.fillStyle = '#343a40';
    ctx.fillRect(paperMargin, paperMargin, canvas.width - (paperMargin * 2), 70);
    
    // Update text color for header elements to white
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Liste des enfants', padding, 55);
    
    // People count on the right (in white)
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Total: ${totalPeopleCount} d'enfants`, canvas.width - padding, 40);
    
    // Add date below the count (in white)
    ctx.font = '16px Arial';
    ctx.fillText(dateStr, canvas.width - padding, 65);
    
    // Reset text color
    ctx.fillStyle = '#212529';
    ctx.textAlign = 'left';
    
    // Two columns layout
    const contentAreaWidth = canvas.width - (padding * 2);
    const columnWidth = contentAreaWidth / 2 - 20; // Space between columns
    
    // Column positions
    const activity1X = padding + 20;
    const dividerX = padding + columnWidth + 20;
    const activity2X = dividerX + 20;
    
    // Draw titles
    let activityY = contentY + 30;
    ctx.fillStyle = '#007bff';
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.fillText('Activité 1', activity1X, activityY);
    ctx.fillText('Activité 2', activity2X, activityY);
    activityY += 40;
    
    // Estimate max height per activity
    const availableHeight = contentHeight - 70; // After titles
    const maxHeightPerActivity = Math.floor(availableHeight / activityTypes.length);
    
    // Draw each activity type
    activityTypes.forEach((type, idx) => {
      const activity1Entries = report.activity1[type];
      const activity2Entries = report.activity2[type];
      
      // Alternate row backgrounds
      if (idx % 2 === 0) {
        ctx.fillStyle = '#f8f9fa';
        const rowY = activityY - 25;
        
        // Calculate the actual number of rows needed for each column
        const activity1Rows = Math.ceil(activity1Entries.length / 2);
        const activity2Rows = Math.ceil(activity2Entries.length / 2);
        
        // Calculate the height based on actual entries plus padding
        // Don't limit by maxHeightPerActivity to ensure background covers all entries
        const rowHeight = Math.max(
          activity1Rows * lineHeight,
          activity2Rows * lineHeight
        ) + 40; // Add padding
        
        // Draw background rectangles that will expand with content
        ctx.fillRect(activity1X - 10, rowY, columnWidth - 20, rowHeight);
        ctx.fillRect(activity2X - 10, rowY, columnWidth - 20, rowHeight);
      }
      
      // Activity type headers with color coding
      ctx.fillStyle = getActivityTypeColor(type);
      ctx.font = `bold ${activityHeaderSize}px Arial`;
      ctx.fillText(`${type} - ${activity1Entries.length}`, activity1X, activityY);
      ctx.fillText(`${type} - ${activity2Entries.length}`, activity2X, activityY);
      activityY += 30;
      
      // Calculate entry columns (2 columns per activity for better visibility)
      // Ensure all entries can be displayed by increasing maxEntriesPerInnerCol
      const maxEntriesPerInnerCol = Math.ceil(Math.max(
        activity1Entries.length,
        activity2Entries.length
      ) / 2);
      
      // No upper limit on the number of entries per column - will display all entries
      const innerColWidth = (columnWidth - 30) / 2;
      
      // Entry font
      ctx.fillStyle = '#212529';
      ctx.font = `${fontSize}px Arial`;
      
      // Get the tallest content height
      let maxEntriesHeight = 0;
      
      // Draw Activity 1 entries in two inner columns
      activity1Entries.forEach((entry: ActivityEntry, index: number) => {
        const innerCol = index < maxEntriesPerInnerCol ? 0 : 1;
        const row = index % maxEntriesPerInnerCol;
        const entryX = activity1X + (innerCol * innerColWidth);
        const entryY = activityY + (row * lineHeight);
        
        // Draw number in bold
        ctx.font = `bold ${fontSize}px Arial`;
        const numberText = `${index + 1}.`;
        ctx.fillText(numberText, entryX, entryY);
        
        // Measure the width of the numbering
        const numberWidth = ctx.measureText(numberText).width;
        
        // Draw the name in normal weight
        ctx.font = `${fontSize}px Arial`;
        let nameText = ` ${entry.name}`;
        
        // Check available width for name and ID
        const availableWidth = innerColWidth - numberWidth - 5;
        const idText = entry.id;
        const idWidth = ctx.measureText(idText).width;
        
        // Check if we need to truncate the name
        if (ctx.measureText(nameText).width > availableWidth - idWidth - 15) {
          // Try to shorten it
          while (ctx.measureText(nameText + '...').width > availableWidth - idWidth - 15 && nameText.length > 1) {
            nameText = nameText.slice(0, -1);
          }
          nameText += '...';
        }
        
        // Draw the name
        ctx.fillText(nameText, entryX + numberWidth, entryY);
        
        // Draw the ID in light gray to the right of the name
        ctx.fillStyle = '#999999';
        const nameWidth = ctx.measureText(nameText).width;
        ctx.fillText(idText, entryX + numberWidth + nameWidth + 5, entryY);
        
        // Reset text color
        ctx.fillStyle = '#212529';
        
        // Track the tallest content
        const contentHeight = (row + 1) * lineHeight;
        if (contentHeight > maxEntriesHeight) maxEntriesHeight = contentHeight;
      });
      
      // Draw Activity 2 entries in two inner columns
      activity2Entries.forEach((entry: ActivityEntry, index: number) => {
        const innerCol = index < maxEntriesPerInnerCol ? 0 : 1;
        const row = index % maxEntriesPerInnerCol;
        const entryX = activity2X + (innerCol * innerColWidth);
        const entryY = activityY + (row * lineHeight);
        
        // Draw number in bold
        ctx.font = `bold ${fontSize}px Arial`;
        const numberText = `${index + 1}.`;
        ctx.fillText(numberText, entryX, entryY);
        
        // Measure the width of the numbering
        const numberWidth = ctx.measureText(numberText).width;
        
        // Draw the name in normal weight
        ctx.font = `${fontSize}px Arial`;
        let nameText = ` ${entry.name}`;
        
        // Check available width for name and ID
        const availableWidth = innerColWidth - numberWidth - 5;
        const idText = entry.id;
        const idWidth = ctx.measureText(idText).width;
        
        // Check if we need to truncate the name
        if (ctx.measureText(nameText).width > availableWidth - idWidth - 15) {
          // Try to shorten it
          while (ctx.measureText(nameText + '...').width > availableWidth - idWidth - 15 && nameText.length > 1) {
            nameText = nameText.slice(0, -1);
          }
          nameText += '...';
        }
        
        // Draw the name
        ctx.fillText(nameText, entryX + numberWidth, entryY);
        
        // Draw the ID in light gray to the right of the name
        ctx.fillStyle = '#999999';
        const nameWidth = ctx.measureText(nameText).width;
        ctx.fillText(idText, entryX + numberWidth + nameWidth + 5, entryY);
        
        // Reset text color
        ctx.fillStyle = '#212529';
        
        // Track the tallest content
        const contentHeight = (row + 1) * lineHeight;
        if (contentHeight > maxEntriesHeight) maxEntriesHeight = contentHeight;
      });
      
      // Move to position for next activity type with spacing proportional to content
      const spacing = totalEntries > 30 ? 15 : 25;
      
      // Adjust the vertical space to ensure all entries are visible
      // Don't limit by maxHeightPerActivity to ensure all entries are shown
      activityY += maxEntriesHeight + spacing;
    });
    
    // Add unidentified entries at the bottom as a separate full-width block
    if (report.unidentified.length > 0) {
      // Check if we have room for unidentified section
      const remainingSpace = canvas.height - activityY - padding;
      const estimatedUnidentifiedHeight = 120 + Math.ceil(report.unidentified.length / 4) * lineHeight;
      
      if (remainingSpace >= estimatedUnidentifiedHeight) {
        // Add more space before Not Identified section
        activityY += 40;
        
        // Create a background container for Not Identified
        ctx.fillStyle = '#f8f9fa';
        const boxHeight = Math.min(
          remainingSpace - 40,
          estimatedUnidentifiedHeight
        );
        ctx.fillRect(paperMargin + 20, activityY - 20, canvas.width - (paperMargin * 2) - 40, boxHeight);
        
        // Add a border
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 2;
        ctx.strokeRect(paperMargin + 20, activityY - 20, canvas.width - (paperMargin * 2) - 40, boxHeight);
        ctx.lineWidth = 1;
        
        // Not Identified section title in a separate header bar
        ctx.fillStyle = '#dc3545';
        ctx.font = `bold ${activityHeaderSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText("Enfant qui n'a pas choisi d'activité", canvas.width / 2, activityY + 10);
        ctx.textAlign = 'left';
        
        activityY += 40;
        
        // Use exactly 4 columns as requested
        const colCount = 4;
        const maxEntriesPerCol = Math.ceil(report.unidentified.length / colCount);
        const colWidth = (canvas.width - (paperMargin * 2) - 80) / colCount;
        
        // Draw entries with better spacing
        ctx.fillStyle = '#212529';
        report.unidentified.forEach((entry: ProcessedEntry, index: number) => {
          const col = Math.floor(index / maxEntriesPerCol);
          const row = index % maxEntriesPerCol;
          const entryX = paperMargin + 40 + (col * colWidth);
          const entryY = activityY + (row * lineHeight);
          
          // Draw the numbering in bold
          ctx.font = `bold ${fontSize}px Arial`;
          const numberText = `${index + 1}.`;
          ctx.fillText(numberText, entryX, entryY);
          
          // Measure the width of the numbering
          const numberWidth = ctx.measureText(numberText).width;
          
          // Draw the name in normal weight
          ctx.font = `${fontSize}px Arial`;
          let nameText = ` ${entry.name}`;
          
          // Check available width for name and ID
          const availableWidth = colWidth - numberWidth - 10;
          const idText = entry.id;
          const idWidth = ctx.measureText(idText).width;
          
          // Check if we need to truncate the name
          if (ctx.measureText(nameText).width > availableWidth - idWidth - 15) {
            // Try to shorten it
            while (ctx.measureText(nameText + '...').width > availableWidth - idWidth - 15 && nameText.length > 1) {
              nameText = nameText.slice(0, -1);
            }
            nameText += '...';
          }
          
          // Draw the name
          ctx.fillText(nameText, entryX + numberWidth, entryY);
          
          // Draw the ID in light gray to the right of the name
          ctx.fillStyle = '#999999';
          const nameWidth = ctx.measureText(nameText).width;
          ctx.fillText(idText, entryX + numberWidth + nameWidth + 5, entryY);
          
          // Reset text color
          ctx.fillStyle = '#212529';
        });
      }
    }
    
    // Download the canvas
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'activity-lists.png';
    link.href = dataUrl;
    link.click();
    
    setLoading(false);
  };

  // No longer needed as we removed the examples section
  
  // For debugging - log parsed result whenever input changes
  useEffect(() => {
    if (inputData.trim()) {
      console.log('Current input:', inputData);
      const groups = parseInput(inputData);
      console.log('Parsed groups:', groups);
    }
  }, [inputData]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generate Lists</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Enter data in format: 1-03 Name Surname, 2-04 Name Surname...
          </label>

          <div className="relative">
            <textarea
              className="w-full h-64 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="1-03 Name Surname, 2-04 Name Surname..."
            />
            {!inputData.trim() && (
              <button
                className="absolute top-2 right-2 h-10 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium flex items-center justify-center"
                onClick={async () => {
                  try {
                    // This will trigger the browser's permission prompt on all devices
                    // The user will be asked if they want to allow access to the clipboard
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setInputData(text);
                    }
                  } catch (err) {
                    console.error('Clipboard permission denied or API not available', err);
                    
                    // Focus the textarea in case the user wants to paste manually
                    const textareaEl = document.querySelector('textarea');
                    if (textareaEl) {
                      textareaEl.focus();
                    }
                  }
                }}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Paste
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          {/* Student Count */}
          <div className="text-sm text-gray-600">
            {inputData.trim() 
              ? `Total:${parseInput(inputData).length}` 
              : ''}
          </div>
          
          <button
            onClick={generateImage}
            className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Generate and Download
              </>
            )}
          </button>
        </div>
        
        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default GenerateListsModal;
