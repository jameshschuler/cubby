import { AppData } from './types';

export function shouldShowOnboarding(data: AppData): boolean {
  if (data.settings.hasCompletedOnboarding) {
    return false;
  }

  return data.goals.length === 0;
}
