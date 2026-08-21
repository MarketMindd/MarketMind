import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ProfileUnsavedChangesDialogProps = {
  open: boolean;
  isSaving: boolean;
  onSaveAndLeave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export const ProfileUnsavedChangesDialog = ({
  open,
  isSaving,
  onSaveAndLeave,
  onDiscard,
  onCancel,
}: ProfileUnsavedChangesDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            Your profile edits haven't been saved yet. Save them before leaving, or discard them and
            continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isSaving}>
            Stay on this page
          </AlertDialogCancel>
          <AlertDialogCancel onClick={onDiscard} disabled={isSaving}>
            Discard changes
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSaveAndLeave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save and leave'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
