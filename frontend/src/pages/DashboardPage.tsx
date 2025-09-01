import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardTitle, Button } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'MENTOR' 
            ? 'Manage your mentoring sessions and help mentees grow'
            : user?.role === 'MENTEE'
            ? 'Find mentors and book sessions to accelerate your learning'
            : 'Manage the platform and oversee all activities'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.role === 'MENTEE' && (
          <Card>
            <CardContent>
              <CardTitle>Find Mentors</CardTitle>
              <p className="text-gray-600 mt-2 mb-4">
                Browse and connect with experienced mentors in your field of interest
              </p>
              <Link to="/mentors">
                <Button className="w-full">
                  Browse Mentors
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-gray-600 mt-2">
              Dashboard functionality will be implemented in upcoming tasks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};