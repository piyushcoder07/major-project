import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/auth';
import { userService } from '../services/userService';
import { MentorCard } from '../components/MentorCard';
import { MentorSearchFilters } from '../components/MentorSearchFilters';
import { Pagination } from '../components/ui/Pagination';
import { Input } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

const MENTORS_PER_PAGE = 6;

export const MentorSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: showToast } = useToast();
  
  const [mentors, setMentors] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      // Load all mentors without filters initially
      const mentorsData = await userService.getMentors({ limit: 100 });
      setMentors(mentorsData);
    } catch (error) {
      console.error('Failed to load mentors:', error);
      showToast('Failed to load mentors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  useEffect(() => {
    let filtered = [...mentors];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(query) ||
        mentor.bio?.toLowerCase().includes(query) ||
        mentor.expertise?.toLowerCase().includes(query)
      );
    }

    // Filter by expertise
    if (selectedExpertise.length > 0) {
      filtered = filtered.filter(mentor =>
        mentor.expertise && selectedExpertise.some(skill => 
          mentor.expertise!.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }

    // Filter by availability
    if (availableOnly) {
      filtered = filtered.filter(mentor =>
        mentor.availabilitySlots && mentor.availabilitySlots.length > 0
      );
    }

    setFilteredMentors(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [mentors, searchQuery, selectedExpertise, availableOnly]);

  const handleViewDetails = (mentorId: string) => {
    navigate(`/mentors/${mentorId}`);
  };

  const handleBookAppointment = (mentorId: string) => {
    navigate(`/mentors/${mentorId}?book=true`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedExpertise([]);
    setAvailableOnly(false);
  };

  const totalPages = Math.ceil(filteredMentors.length / MENTORS_PER_PAGE);
  const startIndex = (currentPage - 1) * MENTORS_PER_PAGE;
  const paginatedMentors = filteredMentors.slice(startIndex, startIndex + MENTORS_PER_PAGE);

  const hasActiveFilters = searchQuery.trim() || selectedExpertise.length > 0 || availableOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
        <p className="text-gray-600">
          Connect with experienced mentors who can guide you in your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <div>
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <MentorSearchFilters
              selectedExpertise={selectedExpertise}
              onExpertiseChange={setSelectedExpertise}
              availableOnly={availableOnly}
              onAvailableOnlyChange={setAvailableOnly}
              onClearFilters={handleClearFilters}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                {isLoading ? (
                  'Loading mentors...'
                ) : (
                  <>
                    Showing {paginatedMentors.length} of {filteredMentors.length} mentors
                    {hasActiveFilters && ' (filtered)'}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No mentors found
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no mentors available at the moment.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Mentor Grid */}
          {!isLoading && paginatedMentors.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {paginatedMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onViewDetails={handleViewDetails}
                    onBookAppointment={handleBookAppointment}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};