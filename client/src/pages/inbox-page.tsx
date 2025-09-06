import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import InboxTabs from "@/components/inbox/inbox-tabs";
import MobileNav from "@/components/layout/mobile-nav";

export default function InboxPage() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 px-4">
        <div className="max-w-4xl mx-auto" data-testid="inbox-page">
          <InboxTabs />
        </div>
      </main>
      
      {/* Bottom Navigation - Always Visible */}
      <MobileNav 
        activeSection="inbox" 
        onSectionChange={(section) => {
          if (section === 'home') setLocation('/');
          else if (section === 'jobs') setLocation('/jobs');
          else if (section === 'profile') setLocation('/profile');
          else if (section === 'create') setLocation('/create');
        }}
      />
    </div>
  );
}
