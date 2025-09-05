import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type PostWithAuthor } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: PostWithAuthor;
  onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
    queryFn: () => api.getComments(post.id),
    enabled: showComments,
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => api.addComment(post.id, { body }),
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      onUpdate();
      toast({
        title: "Comment added",
        description: "Your comment has been posted!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => isLiked ? api.unlikePost(post.id) : api.likePost(post.id),
    onSuccess: () => {
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        description: `You ${isLiked ? 'unliked' : 'liked'} "${post.title}"`,
      });
      onUpdate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isLiked ? 'unlike' : 'like'} post`,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => isSaved ? api.unsavePost(post.id) : api.savePost(post.id),
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Post unsaved" : "Post saved",
        description: `You ${isSaved ? 'removed' : 'saved'} "${post.title}"`,
      });
      onUpdate();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: `Failed to ${isSaved ? 'unsave' : 'save'} post`,
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.description || post.title,
        url: window.location.href,
      });
      toast({
        title: "Shared successfully",
        description: "Post shared!",
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard!",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`post-card-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10" data-testid="post-author-avatar">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
            <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2" data-testid="post-header">
              <span className="font-medium text-foreground" data-testid="text-author-username">
                @{post.author.username}
              </span>
              <span className="text-sm text-muted-foreground" data-testid="text-post-time">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.sponsored && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid="badge-sponsored">
                  Sponsored
                </Badge>
              )}
              <Badge variant="outline" data-testid={`badge-category-${post.category.toLowerCase()}`}>
                {post.category}
              </Badge>
            </div>
            
            {/* Content */}
            <h2 className="text-lg font-semibold text-foreground mb-2" data-testid="text-post-title">
              {post.title}
            </h2>
            {post.description && (
              <p className="text-muted-foreground mb-4" data-testid="text-post-description">
                {post.description}
              </p>
            )}
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4" data-testid="post-tags">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-6" data-testid="post-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className={`flex items-center space-x-2 ${isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="button-like"
              >
                <svg 
                  className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm" data-testid="text-likes-count">{post.likesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                data-testid="button-comment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm" data-testid="text-comments-count">{post.commentsCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className={`flex items-center space-x-2 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="button-save"
              >
                <svg 
                  className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-sm" data-testid="text-saves-count">{post.savesCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                data-testid="button-share"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm" data-testid="text-shares-count">{post.sharesCount}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t pt-4 mt-4 space-y-4" data-testid="comments-section">
            {/* Add Comment Form */}
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newComment.trim()) {
                      commentMutation.mutate(newComment.trim());
                    }
                  }}
                  data-testid="input-comment"
                />
                <Button
                  size="sm"
                  onClick={() => newComment.trim() && commentMutation.mutate(newComment.trim())}
                  disabled={commentMutation.isPending || !newComment.trim()}
                  data-testid="button-post-comment"
                >
                  {commentMutation.isPending ? "..." : "Post"}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3" data-testid="comments-list">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatarUrl} alt={comment.author?.username} />
                    <AvatarFallback>{comment.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{comment.author?.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.body}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
