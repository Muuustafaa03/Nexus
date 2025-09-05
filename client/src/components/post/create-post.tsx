import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface CreatePostProps {
  onPostCreated?: () => void;
}

type CreatePostForm = z.infer<typeof insertPostSchema>;

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      description: "",
      body: "",
      tags: [],
      category: "",
      sponsored: false,
      isDraft: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const response = await api.createPost({
        ...data,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });
      form.reset();
      onPostCreated?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAIAction = async (action: 'summarize' | 'rewrite' | 'title') => {
    const body = form.getValues('body');
    if (!body.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      let response;
      switch (action) {
        case 'summarize':
          response = await api.summarizeContent(body);
          const summary = await response.json();
          form.setValue('description', summary.summary);
          toast({ title: "Summary generated", description: "Content summarized successfully!" });
          break;
        case 'rewrite':
          response = await api.rewriteContent(body);
          const rewritten = await response.json();
          form.setValue('body', rewritten.rewritten);
          toast({ title: "Content rewritten", description: "Content improved successfully!" });
          break;
        case 'title':
          response = await api.generateTitles(body);
          const titles = await response.json();
          if (titles.titles && titles.titles.length > 0) {
            form.setValue('title', titles.titles[0]);
            toast({ title: "Title generated", description: "Title suggestion applied!" });
          }
          break;
      }
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  return (
    <Card className="border border-border" data-testid="create-post-form">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="post-form">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a compelling title..." data-testid="input-post-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={2}
                      placeholder="Brief summary or hook..." 
                      className="resize-none"
                      data-testid="input-post-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Assist Buttons */}
            <div className="flex flex-wrap gap-2" data-testid="ai-assist-buttons">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleAIAction('summarize')}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20"
                data-testid="button-ai-summarize"
              >
                <span className="text-lg">✨</span>
                <span>AI Summarize</span>
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleAIAction('rewrite')}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20"
                data-testid="button-ai-rewrite"
              >
                <span className="text-lg">✏️</span>
                <span>AI Rewrite</span>
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleAIAction('title')}
                disabled={isGeneratingAI}
                className="flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20"
                data-testid="button-ai-title"
              >
                <span className="text-lg">💡</span>
                <span>Title Ideas</span>
              </Button>
            </div>

            {/* Body Content */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={12}
                      placeholder="Write your content here... You can use markdown formatting."
                      className="resize-none"
                      data-testid="input-post-body"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Supports markdown formatting</p>
                </FormItem>
              )}
            />

            {/* Media Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="media-options">
              <Button
                type="button"
                variant="outline"
                disabled
                className="flex items-center justify-center space-x-2 border-2 border-dashed opacity-50 h-20"
                data-testid="button-video-capture"
              >
                <span className="text-lg">📹</span>
                <span>Video Capture (Demo)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center space-x-2 border-2 border-dashed h-20"
                data-testid="button-add-images"
              >
                <span className="text-lg">🖼️</span>
                <span>Add Images</span>
              </Button>
            </div>

            {/* Tags and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="e.g. javascript, react, web-dev"
                        data-testid="input-post-tags"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-post-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Options */}
            <div className="flex items-center space-x-6" data-testid="post-options">
              <FormField
                control={form.control}
                name="sponsored"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-sponsored"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Sponsored post
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDraft"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-draft"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Save as draft
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3" data-testid="form-actions">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  form.setValue('isDraft', true);
                  form.handleSubmit(onSubmit)();
                }}
                disabled={createPostMutation.isPending}
                data-testid="button-save-draft"
              >
                Save Draft
              </Button>
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending}
                data-testid="button-publish-post"
              >
                {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
