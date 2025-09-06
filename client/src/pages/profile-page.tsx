import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MobileNav from "@/components/layout/mobile-nav";
import ProfileHeader from "@/components/profile/profile-header";
import PostCard from "@/components/post/post-card";
import { api, type PostWithAuthor } from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  // Fetch the current user's published posts directly
  const { data: currentUserPosts = [], refetch: refetchPosts } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts/user', user?.id],
    queryFn: () => api.getUserPosts(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="text-center py-8" data-testid="profile-loading">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const userWithPostCount = {
    ...user,
    bio: user?.bio || undefined,
    avatarUrl: user?.avatarUrl || undefined,
    postsCount: currentUserPosts.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6" data-testid="profile-page">
      {/* Profile Header */}
      <ProfileHeader 
        user={userWithPostCount}
        isOwnProfile={true}
      />

      {/* Profile Navigation */}
      <Card className="border border-border" data-testid="profile-navigation">
        <CardContent className="p-0">
          <div className="flex">
            <Button
              variant={activeTab === 'posts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('posts')}
              className="flex-1 rounded-none px-6 py-3 text-sm font-medium"
              data-testid="tab-posts"
            >
              My Posts
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
              className="flex-1 rounded-none px-6 py-3 text-sm font-medium"
              data-testid="tab-settings"
            >
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-4" data-testid="posts-content">
          {/* Posts Header */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground">
                My Published Posts
              </h3>
            </CardContent>
          </Card>
          
          {currentUserPosts.length === 0 ? (
            <Card className="p-8 text-center" data-testid="empty-user-posts">
              <CardContent>
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start sharing your professional insights with the community
                </p>
              </CardContent>
            </Card>
          ) : (
            currentUserPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpdate={refetchPosts} 
              />
            ))
          )}
        </div>
      ) : (
        <Card className="border border-border" data-testid="settings-content">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Account Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your profile information and customize your presence on Portal.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your privacy settings and account security preferences.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="privacy-profile" 
                    defaultChecked={false}
                    data-testid="checkbox-privacy-profile"
                  />
                  <Label 
                    htmlFor="privacy-profile" 
                    className="text-sm font-normal"
                    data-testid="label-privacy-profile"
                  >
                    Make my profile private (only followers can see my posts)
                  </Label>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Choose what notifications you want to receive and how.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </main>
      
      {/* Bottom Navigation - Always Visible */}
      <MobileNav 
        activeSection="profile" 
        onSectionChange={(section) => {
          if (section === 'home') setLocation('/');
          else if (section === 'jobs') setLocation('/jobs');
          else if (section === 'inbox') setLocation('/inbox');
          else if (section === 'create') setLocation('/create');
        }}
      />
    </div>
  );
}
