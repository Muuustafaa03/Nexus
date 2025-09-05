import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DesktopHeaderProps {
  activeSection: 'home' | 'jobs' | 'create' | 'inbox' | 'profile';
  onSectionChange: (section: 'home' | 'jobs' | 'create' | 'inbox' | 'profile') => void;
}

export default function DesktopHeader({ activeSection, onSectionChange }: DesktopHeaderProps) {
  const { user } = useAuth();
  const { totalUnreadCount } = useUnreadCount();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'jobs' as const, label: 'Jobs', icon: '💼' },
    { id: 'create' as const, label: 'Create', icon: '➕' },
    { id: 'inbox' as const, label: 'Inbox', icon: '📧', badge: totalUnreadCount > 0 ? totalUnreadCount : undefined },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50" data-testid="desktop-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3" data-testid="header-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Portal</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex space-x-2" data-testid="desktop-navigation">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className="flex items-center space-x-2 px-3 py-2"
                data-testid={`nav-${item.id}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-1" data-testid={`badge-${item.id}`}>
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4" data-testid="user-menu">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.username} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
