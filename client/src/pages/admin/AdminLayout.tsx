import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Image, Newspaper, CalendarDays, Users, Camera,
  Video, Handshake, FileText, Trophy, FileEdit, Settings, LogOut, Target, ChevronsUpDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const contentItems = [
  { label: 'Слайдер', href: '/admin/sliders', icon: Image },
  { label: 'Новости', href: '/admin/news', icon: Newspaper },
  { label: 'Мероприятия', href: '/admin/events', icon: CalendarDays },
  { label: 'Персонал', href: '/admin/staff', icon: Users },
];

const mediaItems = [
  { label: 'Фото', href: '/admin/photos', icon: Camera },
  { label: 'Видео', href: '/admin/videos', icon: Video },
];

const dataItems = [
  { label: 'Партнеры', href: '/admin/partners', icon: Handshake },
  { label: 'Документы', href: '/admin/documents', icon: FileText },
  { label: 'Рейтинг', href: '/admin/ratings', icon: Trophy },
  { label: 'Страницы', href: '/admin/pages', icon: FileEdit },
  { label: 'Настройки', href: '/admin/settings', icon: Settings },
];

const pageNames: Record<string, string> = {
  '/admin': 'Дашборд', '/admin/sliders': 'Слайдер', '/admin/news': 'Новости',
  '/admin/events': 'Мероприятия', '/admin/staff': 'Персонал', '/admin/photos': 'Фото',
  '/admin/videos': 'Видео', '/admin/partners': 'Партнеры', '/admin/documents': 'Документы',
  '/admin/ratings': 'Рейтинг', '/admin/pages': 'Страницы', '/admin/settings': 'Настройки',
};

function NavItem({ item }: { item: { label: string; href: string; icon: any } }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.href}
          end={item.href === '/admin'}
          className={({ isActive }) => isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''}
        >
          <item.icon className="size-4" />
          <span>{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AppSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Target className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Shooting KG</span>
                  <span className="text-xs text-sidebar-foreground/50">Админ-панель</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Обзор</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem item={{ label: 'Дашборд', href: '/admin', icon: LayoutDashboard }} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Контент</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map(item => <NavItem key={item.href} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Медиа</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mediaItems.map(item => <NavItem key={item.href} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Данные</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems.map(item => <NavItem key={item.href} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="cursor-pointer">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-sidebar-foreground/50">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem onClick={() => { logout(); navigate('/admin/login'); }}>
                  <LogOut className="mr-2 size-4" /> Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'Админ';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{pageName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
