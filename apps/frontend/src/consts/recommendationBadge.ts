import { Size } from '@/enums/recommendationBadge';

export const sizeClasses: Record<Size, string> = {
  [Size.SM]: 'text-xs px-2 py-1 gap-1',
  [Size.MD]: 'text-sm px-3 py-1.5 gap-1.5',
  [Size.LG]: 'text-base px-4 py-2 gap-2',
};

export const iconSizes: Record<Size, number> = {
  [Size.SM]: 12,
  [Size.MD]: 14,
  [Size.LG]: 16,
};
