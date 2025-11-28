import { Bell } from "lucide-react";

export function NotificationsPlaceholder() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-background border shadow-lg rounded-lg px-4 py-3 animate-fade-in">
      <Bell className="w-5 h-5 text-primary animate-bounce" />
      <span className="text-sm text-muted-foreground">Notifications coming soon</span>
    </div>
  );
}
