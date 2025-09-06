import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import CreatePost from "@/components/post/create-post";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MobileNav from "@/components/layout/mobile-nav";

interface CreatePageProps {
  onPostCreated?: () => void;
}

export default function CreatePage({ onPostCreated }: CreatePageProps) {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6" data-testid="create-page">
      {/* Create Header */}
      <Card className="border border-border" data-testid="create-header">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Share your professional insights with the Portal community
          </CardDescription>
        </CardHeader>
      </Card>

          {/* Composer */}
          <CreatePost onPostCreated={onPostCreated} />
        </div>
      </main>
      {/* Bottom Navigation - Always Visible */}
      <MobileNav 
        activeSection="create" 
        onSectionChange={(section) => {
          if (section === 'jobs') setLocation('/jobs');
          else if (section === 'inbox') setLocation('/inbox');
          else if (section === 'profile') setLocation('/profile');
          else if (section === 'home') setLocation('/');
        }}
      />
    </div>
  );
}
