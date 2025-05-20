import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import NumberGrid from './NumberGrid';

const PageView: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const page = parseInt(pageId || '1', 10);
  
  // Validate page parameter
  if (isNaN(page) || page < 1 || page > 3) {
    return <Navigate to="/page/1" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <NumberGrid page={page} />
      </div>
    </div>
  );
};

export default PageView;
