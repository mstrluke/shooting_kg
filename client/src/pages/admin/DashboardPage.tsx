import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Newspaper, CalendarDays, Users, Camera, Video, Trophy } from 'lucide-react';
import { getNewsAdmin, getEventsAdmin, getStaffAdmin, getPhotosAdmin, getVideosAdmin, getRatingsAdmin } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { data: news } = useQuery({ queryKey: ['admin', 'news'], queryFn: () => getNewsAdmin() });
  const { data: events } = useQuery({ queryKey: ['admin', 'events'], queryFn: () => getEventsAdmin() });
  const { data: staff } = useQuery({ queryKey: ['admin', 'staff'], queryFn: getStaffAdmin });
  const { data: photos } = useQuery({ queryKey: ['admin', 'photos'], queryFn: getPhotosAdmin });
  const { data: videos } = useQuery({ queryKey: ['admin', 'videos'], queryFn: getVideosAdmin });
  const { data: ratings } = useQuery({ queryKey: ['admin', 'ratings'], queryFn: getRatingsAdmin });

  const stats = [
    { label: 'Новости', value: news?.total || 0, icon: Newspaper, href: '/admin/news' },
    { label: 'Мероприятия', value: events?.total || 0, icon: CalendarDays, href: '/admin/events' },
    { label: 'Персонал', value: staff?.length || 0, icon: Users, href: '/admin/staff' },
    { label: 'Фото', value: photos?.length || 0, icon: Camera, href: '/admin/photos' },
    { label: 'Видео', value: videos?.length || 0, icon: Video, href: '/admin/videos' },
    { label: 'Рейтинг', value: ratings?.length || 0, icon: Trophy, href: '/admin/ratings' },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Дашборд</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.href}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center"><s.icon className="size-4 text-muted-foreground" /></div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
