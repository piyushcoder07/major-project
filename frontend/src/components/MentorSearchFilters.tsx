import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { MultiSelect } from './ui/MultiSelect';

interface MentorSearchFiltersProps {
  selectedExpertise: string[];
  onExpertiseChange: (expertise: string[]) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (availableOnly: boolean) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const EXPERTISE_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'UI/UX Design',
  'Product Management',
  'Software Architecture',
  'Database Design',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Game Development',
  'Quality Assurance',
  'Technical Writing',
];

export const MentorSearchFilters: React.FC<MentorSearchFiltersProps> = ({
  selectedExpertise,
  onExpertiseChange,
  availableOnly,
  onAvailableOnlyChange,
  onClearFilters,
  isLoading = false,
}) => {
  const hasActiveFilters = selectedExpertise.length > 0 || availableOnly;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expertise Areas
          </label>
          <MultiSelect
            options={EXPERTISE_OPTIONS.map(option => ({
              value: option,
              label: option,
            }))}
            value={selectedExpertise}
            onChange={onExpertiseChange}
            placeholder="Select expertise areas..."
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => onAvailableOnlyChange(e.target.checked)}
              disabled={isLoading}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Show only available mentors
            </span>
          </label>
        </div>

        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Active filters:
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedExpertise.map((expertise) => (
                <span
                  key={expertise}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {expertise}
                  <button
                    onClick={() => onExpertiseChange(selectedExpertise.filter(e => e !== expertise))}
                    disabled={isLoading}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {availableOnly && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Available only
                  <button
                    onClick={() => onAvailableOnlyChange(false)}
                    disabled={isLoading}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};