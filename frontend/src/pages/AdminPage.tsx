import React, { useState } from 'react';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminUserTable } from '../components/AdminUserTable';
import { AdminAppointmentTable } from '../components/AdminAppointmentTable';

type AdminTab = 'dashboard' | 'users' | 'appointments';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: '📊' },
    { id: 'users' as AdminTab, label: 'Users', icon: '👥' },
    { id: 'appointments' as AdminTab, label: 'Appointments', icon: '📅' },
  ];

  const handleUserAction = (userId: string, action: string) => {
    console.log(`User ${userId} ${action}ed`);
    // Additional logging or analytics can be added here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Manage users, appointments, and monitor platform statistics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <AdminUserTable onUserAction={handleUserAction} />}
            {activeTab === 'appointments' && <AdminAppointmentTable />}
          </div>
        </div>
      </div>
    </div>
  );
};