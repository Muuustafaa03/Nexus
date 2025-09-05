import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, type PostWithAuthor } from "@/lib/api";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileNav from "@/components/layout/mobile-nav";
import PostCard from "@/components/post/post-card";
import CreatePost from "@/components/post/create-post";
import JobsPage from "./jobs-page";
import CreatePage from "./create-page";
import InboxPage from "./inbox-page";
import ProfilePage from "./profile-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'home' | 'jobs' | 'create' | 'inbox' | 'profile'>('home');
  const [feedSort, setFeedSort] = useState<'trending' | 'recent'>('trending');
  const isMobile = useIsMobile();

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: posts = [], isLoading, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts', feedSort],
    queryFn: () => api.getPosts(feedSort),
  });

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts) return;
    
    setIsLoadingMore(true);
    try {
      // For demo purposes, just refetch current posts
      // In a real app, you'd implement cursor-based pagination
      await refetch();
      // Simulate pagination - after 2 loads, no more posts
      if (posts.length > 10) {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'jobs':
        return <JobsPage />;
      case 'create':
        return <CreatePage onPostCreated={() => refetch()} />;
      case 'inbox':
        return <InboxPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return renderHomeSection();
    }
  };

  const renderHomeSection = () => (
    <div className="space-y-6" data-testid="home-section">
      {/* Feed Header */}
      <Card className="border border-border" data-testid="feed-header">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground" data-testid="text-page-title">Home</h1>
            <div className="flex bg-muted rounded-lg p-1" data-testid="feed-sort-toggle">
              <Button
                variant={feedSort === 'trending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFeedSort('trending')}
                className="px-3 py-1 text-sm font-medium"
                data-testid="button-trending"
              >
                Trending
              </Button>
              <Button
                variant={feedSort === 'recent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFeedSort('recent')}
                className="px-3 py-1 text-sm font-medium"
                data-testid="button-recent"
              >
                Recent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Content */}
      <div className="space-y-4" data-testid="posts-container">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6" data-testid={`post-skeleton-${i}`}>
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center" data-testid="empty-feed">
            <CardContent>
              <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share something interesting!</p>
              <Button onClick={() => setActiveSection('create')} data-testid="button-create-first-post">
                Create your first post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={() => refetch()} />
            ))}
            
            {/* Load More Button */}
            {hasMorePosts && (
              <div className="text-center py-8" data-testid="load-more-container">
                <Button 
                  variant="secondary" 
                  onClick={loadMorePosts}
                  disabled={isLoadingMore}
                  data-testid="button-load-more"
                >
                  {isLoadingMore ? "Loading..." : "Load more posts"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="main-app">
      {/* Desktop Header */}
      {!isMobile && (
        <DesktopHeader 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
      )}

      {/* Main Content */}
      <main className="lg:max-w-7xl lg:mx-auto lg:px-4 lg:py-6 pb-20 lg:pb-6" data-testid="main-content">
        <div className="px-4 lg:px-0">
          {renderActiveSection()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
      )}
    </div>
  );
}
