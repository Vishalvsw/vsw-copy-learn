import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  User as UserIcon,
  Shield,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Code2
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface NavbarProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onOpenCheckout: (planId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAccount,
  onLogout,
  notifications,
  onOpenCheckout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case 'Premium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Professional':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Starter':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-400/20 group-hover:border-blue-400/50 transition">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-400 transition">
                  VSW ML HUB
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                VSW DATA SOLUTIONS
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentView === 'home'
                  ? 'text-blue-400 bg-blue-950/50 border border-blue-800/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                currentView === 'projects' || currentView === 'project-detail'
                  ? 'text-blue-400 bg-blue-950/50 border border-blue-800/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              Project Library
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentView === 'pricing'
                  ? 'text-blue-400 bg-blue-950/50 border border-blue-800/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Access Plans
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
            >
              How It Works
            </button>
          </nav>

          {/* User Actions & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* AI Query Balance */}
                <div
                  title="Remaining Project AI Assistant Queries"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {user.role === 'admin' ? 'Unlimited' : user.aiCredits} AI Credits
                  </span>
                </div>

                {/* Plan Access Badge */}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getAccessBadgeColor(
                    user.accessLevel
                  )}`}
                >
                  {user.role === 'admin' ? 'Admin Access' : `${user.accessLevel} Plan`}
                </span>

                {/* Notification Bell */}
                <button
                  onClick={onOpenAccount}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>

                {/* Admin Switcher */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => onNavigate(currentView === 'admin' ? 'home' : 'admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      currentView === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-amber-400 hover:bg-amber-500/10 border border-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {currentView === 'admin' ? 'Exit Admin' : 'Admin Panel'}
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAccount();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4 text-blue-400" />
                          My Subscription & Access
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-lg flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Console
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('pricing');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Upgrade / Extend Plan
                        </button>
                      </div>
                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-900"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Access
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={onOpenAccount}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-blue-400 font-semibold"
              >
                {user.accessLevel}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('projects');
              }}
              className="text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900 flex items-center justify-between"
            >
              <span>Project Library</span>
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">40+ ML</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('pricing');
              }}
              className="text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
            >
              Access Plans & Pricing
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-900 rounded-lg">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-blue-400 mt-1">
                    {user.accessLevel} Plan • {user.aiCredits} AI Credits
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccount();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
                >
                  My Subscription Details
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-slate-300 bg-slate-900 rounded-lg border border-slate-800"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
