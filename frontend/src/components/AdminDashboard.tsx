import React, { useEffect, useState } from 'react';
import { AdminStats } from '../types/admin';
import { adminService } from '../services/adminService';
import { useToast } from '../contexts/ToastContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`text-3xl ${color.replace('border-l-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="border-l-blue-500"
          />
          <StatCard
            title="Mentors"
            value={stats.totalMentors}
            icon="🎓"
            color="border-l-green-500"
          />
          <StatCard
            title="Mentees"
            value={stats.totalMentees}
            icon="📚"
            color="border-l-purple-500"
          />
          <StatCard
            title="Average Rating"
            value={stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
            icon="⭐"
            color="border-l-yellow-500"
          />
        </div>
      </div>

      {/* Appointment Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon="📅"
            color="border-l-indigo-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedAppointments}
            icon="✅"
            color="border-l-green-500"
          />
          <StatCard
            title="Pending"
            value={stats.pendingAppointments}
            icon="⏳"
            color="border-l-orange-500"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelledAppointments}
            icon="❌"
            color="border-l-red-500"
          />
        </div>
      </div>
    </div>
  );
};