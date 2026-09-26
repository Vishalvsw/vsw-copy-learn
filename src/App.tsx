import React, { useState, useEffect } from 'react';
import { api, setStoredToken, getStoredToken } from './api';
import { Navbar } from './components/Navbar';
import { PromoBanner } from './components/PromoBanner';
import { LandingPage } from './components/LandingPage';
import { ProjectCatalog } from './components/ProjectCatalog';
import { ProjectDetailView } from './components/ProjectDetailView';
import { DynamicPricing } from './components/DynamicPricing';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  User,
  Plan,
  ProjectSummary,
  ProjectDetail,
  Category,
  Banner,
  HomepageCMS,
  NotificationItem
} from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<
    'home' | 'projects' | 'project-detail' | 'pricing' | 'how-it-works' | 'admin'
  >('home');

  // Dynamic Data
  const [homepage, setHomepage] = useState<HomepageCMS | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const [homeRes, plansRes, catsRes, bannersRes, projsRes] = await Promise.all([
        api.getHomepage(),
        api.getPlans(),
        api.getCategories(),
        api.getBanners(),
        api.getProjects()
      ]);

      setHomepage(homeRes.homepage);
      setFeaturedProjects(homeRes.featuredProjects || []);
      setPlans(plansRes.plans || []);
      setCategories(catsRes.categories || []);
      setBanners(bannersRes.banners || []);
      setProjects(projsRes.projects || []);

      // Check current session
      const token = getStoredToken();
      if (token) {
        try {
          const meRes = await api.getMe();
          if (meRes.user) {
            setUser(meRes.user);
            const notifs = await api.getUserNotifications();
            setNotifications(notifs.notifications || []);
          } else {
            setStoredToken(null);
          }
        } catch {
          setStoredToken(null);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle open project detail
  const handleOpenProject = async (slugOrId: string) => {
    try {
      const res = await api.getProjectDetail(slugOrId);
      setSelectedProject(res.project);
      setCurrentView('project-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Failed to open project details');
    }
  };

  // Handle plan selection -> Checkout
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = async (planName: string) => {
    // Reload user session and projects permissions
    try {
      const meRes = await api.getMe();
      if (meRes.user) {
        setUser(meRes.user);
      }
      const projsRes = await api.getProjects();
      setProjects(projsRes.projects || []);

      if (selectedProject) {
        const refreshedProject = await api.getProjectDetail(selectedProject.slug || selectedProject.id);
        setSelectedProject(refreshedProject.project);
      }

      const notifs = await api.getUserNotifications();
      setNotifications(notifs.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Continue client cleanup
    }
    setStoredToken(null);
    setUser(null);
    setNotifications([]);
    if (currentView === 'admin') {
      setCurrentView('home');
    }
    // Refresh project catalog access flags
    const projsRes = await api.getProjects();
    setProjects(projsRes.projects || []);
  };

  if (initialLoading || !homepage) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
        <div className="text-center space-y-1">
          <p className="font-extrabold text-white text-base tracking-wider">VSW ML HUB</p>
          <p className="text-xs text-slate-400">Loading production machine learning library...</p>
        </div>
      </div>
    );
  }

  // If in Admin Dashboard view, render full dashboard
  if (currentView === 'admin' && user?.role === 'admin') {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          setCurrentView('home');
          loadInitialData();
        }}
        onOpenPublicProject={(slug) => {
          handleOpenProject(slug);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Dynamic Top Promotional Banner */}
      <PromoBanner
        banners={banners}
        onCtaClick={(url) => {
          if (url.includes('pricing')) {
            setCurrentView('pricing');
          } else if (url.startsWith('/projects')) {
            setCurrentView('projects');
          } else {
            setCurrentView('pricing');
          }
        }}
      />

      {/* Main Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'pricing') {
            setCurrentView('pricing');
          } else if (view === 'projects') {
            setCurrentView('projects');
          } else if (view === 'admin') {
            if (user?.role === 'admin') {
              setCurrentView('admin');
            } else {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }
          } else {
            setCurrentView('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenAccount={() => setAccountModalOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenCheckout={(planId) => {
          const targetPlan = plans.find((p) => p.id === planId) || plans[0];
          if (targetPlan) handleSelectPlan(targetPlan);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            homepage={homepage}
            plans={plans}
            featuredProjects={featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4)}
            categories={categories}
            onExploreProjects={() => {
              setCurrentView('projects');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPricing={() => {
              setCurrentView('pricing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProject={handleOpenProject}
            onSelectPlan={handleSelectPlan}
            currentUserPlan={user?.accessLevel}
          />
        )}

        {currentView === 'projects' && (
          <ProjectCatalog
            projects={projects}
            categories={categories}
            onOpenProject={handleOpenProject}
            onOpenPricing={() => setCurrentView('pricing')}
          />
        )}

        {currentView === 'project-detail' && selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            user={user}
            onBack={() => {
              setCurrentView('projects');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPricing={() => {
              setCurrentView('pricing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRequireAuth={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'pricing' && (
          <div className="pt-6">
            <DynamicPricing
              plans={plans}
              onSelectPlan={handleSelectPlan}
              currentUserPlan={user?.accessLevel}
            />
          </div>
        )}

        {currentView === 'how-it-works' && (
          <div className="py-16 px-4 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-extrabold text-white">How VSW ML HUB Works</h1>
              <p className="text-slate-400 text-sm">
                A streamlined online engineering portal designed to accelerate real-world ML deployment.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Select a Plan & Create Your Account',
                  desc: 'Pick between 30 Days (Starter), 6 Months (Professional), or 12 Months (Premium). All prices and durations are transparently managed by VSW DATA SOLUTIONS.'
                },
                {
                  step: '02',
                  title: 'Inspect Deep Architectural Blueprints',
                  desc: 'Every project provides a clear problem statement, business ROI evaluation, mathematical explanation, and pipeline flowchart.'
                },
                {
                  step: '03',
                  title: 'Browse Line-by-Line Source Code in Browser',
                  desc: 'Explore modular Python source code, data preprocessing notebooks, and FastAPI endpoints. Copy clean snippets with line numbers.'
                },
                {
                  step: '04',
                  title: 'Ask Project AI Assistant for Custom Deployments',
                  desc: 'Use the interactive Gemini 3.8 Flash assistant grounded in the project codebase to ask for AWS Lambda conversions, Docker optimizations, or error troubleshooting.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <span className="font-mono text-xl font-black text-blue-500">{item.step}</span>
                  <div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setCurrentView('projects')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
              >
                Browse All Projects Now
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          user={user}
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          onSuccess={handleCheckoutSuccess}
          onRequireAuth={() => {
            setCheckoutModalOpen(false);
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          api.getProjects().then((res) => setProjects(res.projects || []));
          api.getUserNotifications().then((res) => setNotifications(res.notifications || []));
        }}
      />

      {user && (
        <UserAccountModal
          user={user}
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onUpgradePlan={() => {
            setCurrentView('pricing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
