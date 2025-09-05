import CreatePost from "@/components/post/create-post";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CreatePageProps {
  onPostCreated?: () => void;
}

export default function CreatePage({ onPostCreated }: CreatePageProps) {
  return (
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
  );
}
