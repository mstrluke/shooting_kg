import { useQuery } from '@tanstack/react-query';
import { getSettings } from './api';

interface HeroData {
  image?: string;
  title?: string;
  subtitle?: string;
}

export function useHeroImage(key: string): string | undefined {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 60000 });
  return settings?.[`hero_${key}`] || undefined;
}

export function useHero(key: string): HeroData {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 60000 });
  return {
    image: settings?.[`hero_${key}`] || undefined,
    title: settings?.[`hero_${key}_title`] || undefined,
    subtitle: settings?.[`hero_${key}_subtitle`] || undefined,
  };
}
