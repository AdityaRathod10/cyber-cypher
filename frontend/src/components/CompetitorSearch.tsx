'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ExternalLink, Building2, Users, BarChart } from 'lucide-react';

// Updated interfaces to match FastAPI response
interface Competitor {
  name: string;
  industry: string;
  size: string;
  profile_url: string;
  similarity_score: number;
}

interface ApiResponse {
  competitors: Competitor[];
  message?: string;
}

interface ApiError {
  detail: string;
}

const getAvatarStyle = (index: number) => {
  const styles = [
    'from-pink-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-violet-400 to-purple-500',
    'from-teal-400 to-cyan-500'
  ];
  return styles[Math.max(0, Math.min(index, styles.length - 1))];
};

const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'NA';
  return name
    .split(' ')
    .map(word => word?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';
};

const LoadingSkeleton = () => (
  <Card className="w-full bg-white/10 backdrop-blur-sm border-none shadow-xl">
    <CardContent className="p-6">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CompetitorCard = ({ competitor, index }: { competitor: Competitor; index: number }) => {
  const sanitizedScore = Math.round(
    Number.isNaN(competitor.similarity_score) ? 0 : competitor.similarity_score
  );

  return (
    <Card className="w-full hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-sm border-none shadow-xl">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative">
            <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getAvatarStyle(index)} flex items-center justify-center text-white font-bold text-xl`}>
              {getInitials(competitor.name)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white truncate">
              {competitor.name || 'Unknown Company'}
            </h3>
            <div className="flex items-center text-gray-300 mt-1">
              <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
              <p className="truncate text-sm">{competitor.industry || 'Industry not specified'}</p>
            </div>
            <div className="flex items-center text-gray-300 mt-1">
              <Users className="h-4 w-4 mr-1 flex-shrink-0" />
              <p className="text-sm">{competitor.size || 'Size not specified'}</p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between ml-4">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <BarChart className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                Similarity: {sanitizedScore}%
              </span>
            </div>
            {competitor.profile_url && competitor.profile_url !== '#' && (
              <a
                href={competitor.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                View Profile
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CompetitorSearch = () => {
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const validateInputs = (): boolean => {
    if (!description.trim()) {
      setError('Please enter a company description');
      return false;
    }

    if (!size.trim()) {
      setError('Please enter a company size');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError('');
    setMessage('');
    setCompetitors([]);

    try {
      const response = await fetch('http://localhost:8000/find-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          description: description.trim(),
          size: size.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const successData = data as ApiResponse;
      
      // Check if we have a message from the API
      if (successData.message) {
        setMessage(successData.message);
      }

      // Validate competitors array
      if (!Array.isArray(successData.competitors)) {
        throw new Error('Invalid response format from server');
      }

      setCompetitors(successData.competitors);

      // Show message if no competitors found
      if (successData.competitors.length === 0) {
        setMessage('No competitors found matching your criteria');
      }

    } catch (err) {
      console.error('Error details:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-900 to-blue-950 text-white">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <Card className="mb-8 border-none shadow-xl bg-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Find Your Competitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Enter your company description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 resize-none text-lg p-4 bg-white/5 backdrop-blur-sm border-purple-500/30 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 text-white placeholder:text-gray-400"
                required
              />
              <Input
                type="text"
                placeholder="Company size (e.g., '11-50 employees', '51-200 employees')"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="bg-white/5 backdrop-blur-sm border-purple-500/30 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 text-white placeholder:text-gray-400"
                required
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching for Competitors...
                  </>
                ) : (
                  'Find Competitors'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-200 px-4 py-3 rounded-md mb-6 text-center">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            competitors?.map((competitor, index) => (
              <CompetitorCard 
                key={`${competitor.name}-${index}`} 
                competitor={competitor} 
                index={index} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorSearch;