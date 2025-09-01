import React from 'react';
import { User } from '../types/auth';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface MentorCardProps {
  mentor: User;
  onViewDetails: (mentorId: string) => void;
  onBookAppointment?: (mentorId: string) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onViewDetails,
  onBookAppointment,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-fill)"
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }

    return stars;
  };

  const hasAvailableSlots = mentor.availabilitySlots && mentor.availabilitySlots.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {mentor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                <div className="flex items-center gap-2">
                  {mentor.ratingAverage && (
                    <>
                      <div className="flex items-center">
                        {renderStars(mentor.ratingAverage)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({mentor.ratingAverage.toFixed(1)})
                      </span>
                    </>
                  )}
                  {!mentor.ratingAverage && (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                {mentor.yearsExperience} years of experience
              </p>
              {mentor.bio && (
                <p className="text-sm text-gray-700 line-clamp-2">{mentor.bio}</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {mentor.expertise && (() => {
                  const skills = mentor.expertise.split(',').map(s => s.trim());
                  const displaySkills = skills.slice(0, 3);
                  return (
                    <>
                      {displaySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasAvailableSlots ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {hasAvailableSlots ? 'Available' : 'No slots available'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(mentor.id)}
                >
                  View Details
                </Button>
                {hasAvailableSlots && onBookAppointment && (
                  <Button
                    size="sm"
                    onClick={() => onBookAppointment(mentor.id)}
                  >
                    Book Session
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};