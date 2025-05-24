import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClearContextType {
  showClearDialog: () => void;
  isDialogVisible: boolean;
  hideClearDialog: () => void;
}

const ClearContext = createContext<ClearContextType>({
  showClearDialog: () => {},
  isDialogVisible: false,
  hideClearDialog: () => {}
});

export const useClearContext = () => useContext(ClearContext);

export const ClearProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  const showClearDialog = () => {
    setShowClearConfirmation(true);
  };
  
  const hideClearDialog = () => {
    setShowClearConfirmation(false);
  };
  
  return (
    <ClearContext.Provider 
      value={{ 
        showClearDialog, 
        isDialogVisible: showClearConfirmation,
        hideClearDialog
      }}
    >
      {children}
    </ClearContext.Provider>
  );
};

export default ClearContext;
