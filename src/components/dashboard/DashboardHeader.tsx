"use client";

import {
  Bell,
  Search,
  Plus,
  Bot,
  ChevronDown,
  Menu,
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function DashboardHeader({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-100">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-surface-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-surface-500">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 w-64">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-surface-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-surface-400">
              ⌘K
            </kbd>
          </div>

          {/* AI Assistant */}
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
            <Bot className="h-[18px] w-[18px]" />
          </button>

          {/* Notifications */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 transition-colors">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className="btn-primary text-sm py-2 px-4"
            >
              <Plus className="h-4 w-4" />
              {action.label}
            </button>
          )}

          {/* User */}
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
              AO
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-surface-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
