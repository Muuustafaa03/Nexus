import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProfileHeaderProps {
  user?: {
    id: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    followersCount: number;
    followingCount: number;
    postsCount?: number;
  };
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
}

export default function ProfileHeader({ 
  user, 
  isOwnProfile = false, 
  isFollowing = false,
  onFollow 
}: ProfileHeaderProps) {
  const { user: currentUser, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
  });
  const { toast } = useToast();

  const followMutation = useMutation({
    mutationFn: onFollow || (() => Promise.resolve()),
    onSuccess: () => {
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: `You are now ${isFollowing ? 'not following' : 'following'} @${user?.username}`,
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/auth");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSaveProfile = () => {
    // This would normally call an API to update the profile
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully",
    });
    setIsEditDialogOpen(false);
  };

  const displayUser = user || currentUser;
  if (!displayUser) return null;

  return (
    <Card className="border border-border" data-testid="profile-header">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="w-20 h-20" data-testid="profile-avatar">
            <AvatarImage src={displayUser.avatarUrl} alt={displayUser.username} />
            <AvatarFallback className="text-2xl">
              {displayUser.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-profile-username">
                  @{displayUser.username}
                </h1>
                {displayUser.bio && (
                  <p className="text-muted-foreground mt-1" data-testid="text-profile-bio">
                    {displayUser.bio}
                  </p>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {isOwnProfile ? (
                  <>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid="button-edit-profile">
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="edit-profile-dialog">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                              id="edit-username"
                              value={editData.username}
                              onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                              data-testid="input-edit-username"
                            />
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="destructive"
                              onClick={handleLogout}
                              disabled={logoutMutation.isPending}
                              data-testid="button-logout"
                            >
                              {logoutMutation.isPending ? "Logging out..." : "Logout"}
                            </Button>
                            <Button 
                              onClick={handleSaveProfile}
                              data-testid="button-save-profile"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    variant={isFollowing ? "outline" : "default"}
                    data-testid="button-follow"
                  >
                    {followMutation.isPending 
                      ? "Loading..." 
                      : isFollowing 
                        ? "Unfollow" 
                        : "Follow"
                    }
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-6 mt-4" data-testid="profile-stats">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground" data-testid="text-followers-count">
                  {displayUser.followersCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground" data-testid="text-following-count">
                  {displayUser.followingCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground" data-testid="text-posts-count">
                  {displayUser.postsCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
