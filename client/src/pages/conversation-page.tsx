import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePortalMessageStatus } from "@/hooks/use-portal-message-status";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileNav from "@/components/layout/mobile-nav";

export default function ConversationPage() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const { markAsRead } = usePortalMessageStatus();

  // Mark Portal message as read when user visits the conversation
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // For demo purposes, hardcoded Portal Official conversation
  const conversation = {
    id: 'portal-official-thread',
    otherUser: {
      id: 'portal-official',
      username: 'portal',
      email: 'portal@portal.com',
      bio: 'Official Portal account - Welcome to the community!',
      avatarUrl: undefined,
      isVerified: true,
    },
    messages: [
      {
        id: 'portal-msg-1',
        body: 'Welcome to Portal! We\'re excited to have you join our professional community.',
        createdAt: new Date(Date.now() - 60000 * 30), // 30 minutes ago
        senderId: 'portal-official',
        senderUsername: 'portal'
      },
      {
        id: 'portal-msg-2',
        body: 'This is a demo conversation to showcase the messaging functionality.',
        createdAt: new Date(Date.now() - 60000 * 25), // 25 minutes ago
        senderId: 'portal-official',
        senderUsername: 'portal'
      }
    ]
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add the message to the local state for immediate display
    const newMsg = {
      id: `user-msg-${Date.now()}`,
      body: newMessage,
      createdAt: new Date(),
      senderId: 'current-user',
      senderUsername: 'you'
    };
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    
    console.log("Message sent:", newMessage);
  };

  // Combine demo messages with user messages
  const allMessages = [...conversation.messages, ...messages];

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <DesktopHeader 
          activeSection="inbox" 
          onSectionChange={(section) => {
            if (section === 'home') setLocation('/');
            else if (section === 'jobs') setLocation('/jobs');
            else if (section === 'profile') setLocation('/profile');
            else if (section === 'create') setLocation('/create');
          }}
        />
      )}
      {isMobile && (
        <MobileNav 
          activeSection="inbox" 
          onSectionChange={(section) => {
            if (section === 'home') setLocation('/');
            else if (section === 'jobs') setLocation('/jobs');
            else if (section === 'profile') setLocation('/profile');
            else if (section === 'create') setLocation('/create');
          }}
        />
      )}
      <main className={`${!isMobile ? 'pt-16' : 'pb-16'} px-4`}>
        <div className="max-w-4xl mx-auto h-screen flex flex-col" data-testid="conversation-page">
      {/* Header */}
      <Card className="border-b rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/inbox')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="ml-1">Back</span>
            </Button>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.otherUser.avatarUrl} alt={conversation.otherUser.username} />
              <AvatarFallback>
                {conversation.otherUser.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="font-semibold text-foreground" data-testid="conversation-title">
                  @{conversation.otherUser.username}
                </h1>
                {conversation.otherUser.isVerified && (
                  <svg 
                    className="w-4 h-4 text-blue-500" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    data-testid="verified-badge"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{conversation.otherUser.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
        {allMessages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === 'current-user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
              data-testid={`message-${message.id}`}
            >
              <p className="text-sm">{message.body}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <Card className="border-t rounded-none">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              data-testid="input-new-message"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  );
}