import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { api, type PostWithAuthor } from "@/lib/api";
import MobileNav from "@/components/layout/mobile-nav";
import PostCard from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [feedSort, setFeedSort] = useState<'trending' | 'recent'>('trending');
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6" data-testid="home-section">
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
          <div className="space-y-6" data-testid="posts-list">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border border-border" data-testid={`post-skeleton-${i}`}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-24"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center" data-testid="empty-posts">
                <CardContent>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with the community
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpdate={refetch} 
                  />
                ))}
                
                {hasMorePosts && (
                  <div className="flex justify-center py-6">
                    <Button
                      variant="outline"
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
      </main>
      
      {/* Bottom Navigation - Always Visible */}
      <MobileNav 
        activeSection="home" 
        onSectionChange={(section) => {
          if (section === 'jobs') setLocation('/jobs');
          else if (section === 'inbox') setLocation('/inbox');
          else if (section === 'profile') setLocation('/profile');
          else if (section === 'create') setLocation('/create');
          else if (section === 'home') setLocation('/');
        }} 
      />
    </div>
  );
}