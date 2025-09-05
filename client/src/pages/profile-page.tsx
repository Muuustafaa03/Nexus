import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ProfileHeader from "@/components/profile/profile-header";
import PostCard from "@/components/post/post-card";
import { api, type PostWithAuthor } from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const { user } = useAuth();

  // For now, we'll show the current user's profile
  // In a real app, this would be determined by the route parameter
  const { data: userPosts = [], refetch: refetchPosts } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/user/posts', user?.id],
    queryFn: () => api.getPosts('recent'), // This would be filtered by user in a real implementation
    enabled: !!user,
  });

  // Filter posts to show only the current user's posts
  const currentUserPosts = userPosts.filter(post => post.author.id === user?.id);

  if (!user) {
    return (
      <div className="text-center py-8" data-testid="profile-loading">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const userWithPostCount = {
    ...user,
    postsCount: currentUserPosts.length,
  };

  return (
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
  );
}
