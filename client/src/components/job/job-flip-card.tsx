import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, type Job } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface JobFlipCardProps {
  job: Job;
}

export default function JobFlipCard({ job }: JobFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const saveJobMutation = useMutation({
    mutationFn: () => api.saveJob(job.id),
    onSuccess: () => {
      toast({
        title: "Job saved",
        description: `Saved "${job.title}" at ${job.company}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${job.title} at ${job.company}`,
        text: job.blurb,
        url: job.applyUrl,
      });
      toast({
        title: "Shared successfully",
        description: "Job shared!",
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(job.applyUrl);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard!",
      });
    }
  };

  return (
    <div 
      className="flip-card h-[280px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      data-testid={`job-card-${job.id}`}
    >
      <div className={`flip-card-inner ${isFlipped ? 'rotate-y-180' : ''} relative w-full h-full transition-transform duration-600 preserve-3d`}>
        {/* Front of Card */}
        <Card className={`flip-card-front absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-left mb-1" data-testid="text-job-title">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-left" data-testid="text-job-company">
                    {job.company}
                  </p>
                </div>
                <Badge 
                  variant={job.remote ? "default" : "secondary"}
                  className={job.remote ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}
                  data-testid="badge-job-type"
                >
                  {job.remote ? "Remote" : "On-site"}
                </Badge>
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span data-testid="text-job-location">{job.location}</span>
                </div>
                {job.salaryRange && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span data-testid="text-job-salary">{job.salaryRange}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span data-testid="text-job-posted">
                    {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1 mb-4" data-testid="job-tags">
                {job.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`tag-${tag.toLowerCase()}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Hover to see details</p>
            </div>
          </CardContent>
        </Card>

        {/* Back of Card */}
        <Card className={`flip-card-back absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'visible' : 'invisible'}`}>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-3" data-testid="text-job-title-back">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground text-left mb-4" data-testid="text-job-blurb">
                {job.blurb}
              </p>
            </div>

            <div className="space-y-3" data-testid="job-actions">
              <Button
                className="w-full"
                onClick={() => window.open(job.applyUrl, '_blank')}
                data-testid="button-apply"
              >
                Apply Now
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-sm"
                  onClick={() => saveJobMutation.mutate()}
                  disabled={saveJobMutation.isPending}
                  data-testid="button-save-job"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 text-sm"
                  onClick={handleShare}
                  data-testid="button-share-job"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
