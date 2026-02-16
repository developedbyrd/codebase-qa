'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, History, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/qa', label: 'Q&A', icon: MessageSquare },
    { href: '/history', label: 'History', icon: History },
    { href: '/status', label: 'Status', icon: Activity },
  ];

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm transition-colors group relative
                    ${isActive 
                      ? 'text-[var(--text-primary)]' 
                      : 'text-[var(--muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-colors
                    ${isActive 
                      ? 'text-[var(--accent)]' 
                      : 'text-[var(--muted)] group-hover:text-[var(--text-primary)]'
                    }`} 
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] 
                       text-[var(--muted)] hover:text-[var(--text-primary)]
                       transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}