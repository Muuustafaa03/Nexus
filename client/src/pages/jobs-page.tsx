import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import JobFlipCard from "@/components/job/job-flip-card";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileNav from "@/components/layout/mobile-nav";
import { api, type Job } from "@/lib/api";

export default function JobsPage() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: jobs = [], isLoading, refetch } = useQuery<Job[]>({
    queryKey: ['/api/jobs', searchQuery, levelFilter, locationFilter],
    queryFn: () => api.getJobs({
      query: searchQuery || undefined,
      level: levelFilter && levelFilter !== 'all' ? levelFilter : undefined,
      remote: locationFilter === 'remote' ? true : locationFilter === 'onsite' ? false : undefined,
    }),
  });

  const loadMoreJobs = async () => {
    if (isLoadingMore || !hasMoreJobs) return;
    
    setIsLoadingMore(true);
    try {
      // For demo purposes, just refetch current jobs
      await refetch();
      // Simulate pagination - after 2 loads, no more jobs
      if (jobs.length > 8) {
        setHasMoreJobs(false);
      }
    } catch (error) {
      console.error('Failed to load more jobs:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <DesktopHeader 
          activeSection="jobs" 
          onSectionChange={(section) => {
            if (section === 'home') setLocation('/');
            else if (section === 'inbox') setLocation('/inbox');
            else if (section === 'profile') setLocation('/profile');
            else if (section === 'create') setLocation('/create');
          }}
        />
      )}
      {isMobile && (
        <MobileNav 
          activeSection="jobs" 
          onSectionChange={(section) => {
            if (section === 'home') setLocation('/');
            else if (section === 'inbox') setLocation('/inbox');
            else if (section === 'profile') setLocation('/profile');
            else if (section === 'create') setLocation('/create');
          }}
        />
      )}
      <main className={`${!isMobile ? 'pt-16' : 'pb-16'} px-4`}>
        <div className="max-w-4xl mx-auto space-y-6" data-testid="jobs-page">
      {/* Jobs Header */}
      <Card className="border border-border" data-testid="jobs-header">
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold text-foreground mb-4" data-testid="text-jobs-title">
            Job Opportunities
          </h1>
          
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-job-search"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-level-filter">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-location-filter">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" data-testid="button-more-filters">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[280px]" data-testid={`job-skeleton-${i}`}>
              <CardContent className="p-6 h-full">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-28"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-18"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center" data-testid="empty-jobs">
          <CardContent>
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || levelFilter || locationFilter
                ? "Try adjusting your search criteria"
                : "Check back later for new opportunities!"
              }
            </p>
            {(searchQuery || levelFilter || locationFilter) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setLevelFilter("");
                  setLocationFilter("");
                }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="jobs-grid">
            {jobs.map((job) => (
              <JobFlipCard key={job.id} job={job} />
            ))}
          </div>

          {/* Load More Jobs */}
          {hasMoreJobs && (
            <div className="text-center py-8" data-testid="load-more-jobs">
              <Button 
                variant="secondary" 
                onClick={loadMoreJobs}
                disabled={isLoadingMore}
                data-testid="button-load-more-jobs"
              >
                {isLoadingMore ? "Loading..." : "Load more jobs"}
              </Button>
            </div>
          )}
        </>
      )}
        </div>
      </main>
    </div>
  );
}
