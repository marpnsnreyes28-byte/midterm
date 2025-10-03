'use client';

import React from 'react';

// Minimal test component to verify the app loads
export default function SimpleApp() {
  console.log('SimpleApp is rendering...');
  
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-green-800 text-center mb-4">
          Notre Dame RFID System
        </h1>
        <p className="text-green-600 text-center mb-6">
          System is loading successfully!
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-700">App initialized</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-yellow-700">Components ready</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-blue-700">Styles applied</span>
          </div>
        </div>
        <button 
          className="w-full mt-6 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          onClick={() => {
            console.log('Button clicked - app is interactive!');
            alert('App is working! You can now switch back to the full version.');
          }}
        >
          Test Interaction
        </button>
      </div>
    </div>
  );
}