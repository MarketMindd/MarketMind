import { Loader2, UserCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import { Button } from '@/components/elements/button';
import { useClientQueries } from '@/hooks/useClientQueries';
import { useToast } from '@/hooks/useToast';
import { ProfileAccountSection } from './profileAccountSection';
import { ProfileNotificationsSection } from './profileNotificationsSection';
import { ProfilePreferencesSection } from './profilePreferencesSection';
import { ProfileUnsavedChangesDialog } from './profileUnsavedChangesDialog';

export const Profile = () => {
  const { toast } = useToast();

  const {
    profile: { useGetProfile, useUpdateProfile },
  } = useClientQueries();

  const { data, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => toast({ description: 'Profile saved' }),
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

  const isDirty =
    !!data &&
    (fullName !== data.fullName ||
      riskTolerance !== data.riskTolerance ||
      emailNotifications !== data.emailNotifications ||
      interests.length !== data.interests.length ||
      interests.some((interest) => !data.interests.includes(interest)));

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (!isDirty) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty]);

  const handleSave = useCallback(
    (onSaved?: () => void) => {
      updateProfile(
        { fullName, riskTolerance, interests, emailNotifications },
        { onSuccess: () => onSaved?.() },
      );
    },
    [updateProfile, fullName, riskTolerance, interests, emailNotifications],
  );

  const discardChanges = () => {
    if (data) {
      setFullName(data.fullName);
      setRiskTolerance(data.riskTolerance);
      setInterests(data.interests);
      setEmailNotifications(data.emailNotifications);
    }
    blocker.proceed?.();
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="pt-28 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-primary shrink-0" />
                My Profile
              </h1>
              <p className="text-muted-foreground">Manage your account details and preferences</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isDirty && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Unsaved changes
                </span>
              )}
              <Button
                variant="glow"
                onClick={() => handleSave()}
                disabled={isPending || !isDirty}
                className="gap-2"
              >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                {isPending ? 'Saving...' : 'Save All'}
              </Button>
            </div>
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
          </div>
        )}
      </div>

      <ProfileUnsavedChangesDialog
        open={blocker.state === 'blocked'}
        isSaving={isPending}
        onSaveAndLeave={() => handleSave(() => blocker.proceed?.())}
        onDiscard={discardChanges}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
};
