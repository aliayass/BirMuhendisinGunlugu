"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Cpu,
  PenTool,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { SearchProvider, useSearch } from '@/context/SearchContext';

const navItems = [
  { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Teknik Notlar', href: '/dashboard/notes', icon: BookOpen },
  { name: 'Projeler', href: '/dashboard/projects', icon: Cpu },
  { name: 'Blog Yönetimi', href: '/dashboard/blog', icon: PenTool },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Yükleniyor...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "glass h-screen border-r border-white/5 transition-all duration-300 z-40 fixed md:relative flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              BMG v1.0
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="rounded-xl"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="mt-8 px-4 flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive ? "text-white" : "group-hover:text-primary")} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
                {user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-4 p-4 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-6 h-6 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Çıkış Yap</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 glass">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Notlarda veya görevlerde ara..."
              className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[1px]">
              <div className="w-full h-full rounded-xl bg-background flex items-center justify-center font-bold text-sm">
                {user?.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'ME'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <DashboardInner>{children}</DashboardInner>
    </SearchProvider>
  );
}
