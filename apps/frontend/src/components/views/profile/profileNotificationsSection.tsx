import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ProfileNotificationsSectionProps {
  emailNotifications: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
}

export const ProfileNotificationsSection = ({
  emailNotifications,
  onEmailNotificationsChange,
}: ProfileNotificationsSectionProps) => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Notifications
      </h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Email alerts</p>
          <p className="text-sm text-muted-foreground">
            Receive email notifications when recommendations change for stocks in your portfolio
          </p>
        </div>
        <Switch checked={emailNotifications} onCheckedChange={onEmailNotificationsChange} />
      </div>
    </div>
  );
};
