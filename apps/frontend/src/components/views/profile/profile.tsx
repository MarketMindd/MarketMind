import { Loader2, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { ProfileAccountSection } from './profileAccountSection';
import { ProfileNotificationsSection } from './profileNotificationsSection';
import { ProfilePreferencesSection } from './profilePreferencesSection';

export const Profile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    profile: { useGetProfile, useUpdateProfile },
  } = useClientQueries();

  const { data, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ description: 'Profile saved' });
    },
    onError: (err: Error) =>
      toast({ title: 'Failed to save profile', description: err.message, variant: 'destructive' }),
  });

  const [fullName, setFullName] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(RiskTolerance.MEDIUM);
  const [interests, setInterests] = useState<SectorInterest[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (data) {
      setFullName(data.fullName);
      setRiskTolerance(data.riskTolerance);
      setInterests(data.interests);
      setEmailNotifications(data.emailNotifications);
    }
  }, [data]);

  const handleSave = () => {
    updateProfile({ fullName, riskTolerance, interests, emailNotifications });
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground">Manage your account details and preferences</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <ProfileAccountSection
              fullName={fullName}
              email={data?.email ?? ''}
              onFullNameChange={setFullName}
            />
            <ProfilePreferencesSection
              riskTolerance={riskTolerance}
              interests={interests}
              onRiskToleranceChange={setRiskTolerance}
              onInterestsChange={setInterests}
            />
            <ProfileNotificationsSection
              emailNotifications={emailNotifications}
              onEmailNotificationsChange={setEmailNotifications}
            />
            <div className="flex justify-end">
              <Button variant="glow" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                {isPending ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
