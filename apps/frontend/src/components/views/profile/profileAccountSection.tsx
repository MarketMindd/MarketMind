import { User } from 'lucide-react';
import { Input } from '@/components/elements/input';

interface ProfileAccountSectionProps {
  fullName: string;
  email: string;
  onFullNameChange: (value: string) => void;
}

export const ProfileAccountSection = ({
  fullName,
  email,
  onFullNameChange,
}: ProfileAccountSectionProps) => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Account
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <Input value={email} disabled className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
