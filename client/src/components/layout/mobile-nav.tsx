import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/use-unread-count";

interface MobileNavProps {
  activeSection: 'home' | 'jobs' | 'create' | 'inbox' | 'profile';
  onSectionChange: (section: 'home' | 'jobs' | 'create' | 'inbox' | 'profile') => void;
}

export default function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const { totalUnreadCount } = useUnreadCount();
  
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'jobs' as const, label: 'Jobs', icon: '💼' },
    { id: 'create' as const, label: 'Create', icon: '➕' },
    { id: 'inbox' as const, label: 'Inbox', icon: '📧', badge: totalUnreadCount > 0 ? totalUnreadCount : undefined },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="mobile-navigation">
      <div className="flex">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onSectionChange(item.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs relative h-auto ${
              activeSection === item.id 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}
            data-testid={`mobile-nav-${item.id}`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                data-testid={`mobile-badge-${item.id}`}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
