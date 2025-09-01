import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-400">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
        
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};