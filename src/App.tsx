import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TeamPage } from './pages/TeamPage';
import { ServicesPage } from './pages/ServicesPage';
import { MedicalCardPage } from './pages/MedicalCardPage';
import { CardApplyPage } from './pages/CardApplyPage';
import { RepresentativeRegisterPage } from './pages/RepresentativeRegisterPage';
import { CardVerificationPage } from './pages/CardVerificationPage';
import { DiagnosticCentersPage } from './pages/DiagnosticCentersPage';
import { TestPricesPage } from './pages/TestPricesPage';
import { PackagesPage } from './pages/PackagesPage';
import { PartnerPage } from './pages/PartnerPage';
import { EventGalleryPage } from './pages/EventGalleryPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MemberDashboard } from './components/dashboards/MemberDashboard';
import { PartnerDashboard } from './components/dashboards/PartnerDashboard';
import { RepresentativeDashboard } from './components/dashboards/RepresentativeDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';

import {
  INITIAL_CARDS,
  INITIAL_DIAGNOSTIC_CENTERS,
  INITIAL_TESTS,
  INITIAL_PACKAGES,
  INITIAL_TRANSACTIONS,
  INITIAL_BLOGS,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS
} from './data/mockData';

import {
  MedicalCard,
  DiagnosticCenter,
  MedicalTest,
  HealthPackage,
  DiscountTransaction,
  BlogArticle,
  User,
  SiteSettings
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);

  // Application State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [cards, setCards] = useState<MedicalCard[]>(INITIAL_CARDS);
  const [centers, setCenters] = useState<DiagnosticCenter[]>(INITIAL_DIAGNOSTIC_CENTERS);
  const [tests, setTests] = useState<MedicalTest[]>(INITIAL_TESTS);
  const [packages, setPackages] = useState<HealthPackage[]>(INITIAL_PACKAGES);
  const [transactions, setTransactions] = useState<DiscountTransaction[]>(INITIAL_TRANSACTIONS);
  const [blogs, setBlogs] = useState<BlogArticle[]>(INITIAL_BLOGS);

  // Fetch initial data from server API on mount and check URL params for direct role links
  const fetchJsonSafe = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      if (text.trim().startsWith('<') || text.trim().startsWith('<!')) return null;
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const fetchApiData = async () => {
    try {
      const [resCards, resCenters, resTests, resPkg, resTxn, resBlogs, resSiteSettings] = await Promise.all([
        fetchJsonSafe('/api/members'),
        fetchJsonSafe('/api/diagnostic-centers'),
        fetchJsonSafe('/api/tests'),
        fetchJsonSafe('/api/health-packages'),
        fetchJsonSafe('/api/discount-tracking'),
        fetchJsonSafe('/api/blogs'),
        fetchJsonSafe('/api/site-settings'),
      ]);

      if (Array.isArray(resCards)) setCards(resCards);
      if (Array.isArray(resCenters)) setCenters(resCenters);
      if (Array.isArray(resTests)) setTests(resTests);
      if (Array.isArray(resPkg)) setPackages(resPkg);
      if (Array.isArray(resTxn)) setTransactions(resTxn);
      if (Array.isArray(resBlogs)) setBlogs(resBlogs);

      if (resSiteSettings) {
        setSiteSettings(resSiteSettings);
        if (resSiteSettings.siteTitle) {
          document.title = resSiteSettings.siteTitle;
        } else if (resSiteSettings.siteName) {
          document.title = resSiteSettings.siteName;
        }
        if (resSiteSettings.faviconUrl) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = resSiteSettings.faviconUrl;
        }
      }
    } catch (e) {
      console.warn('Backend API warming up, using seed dataset.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const tabParam = params.get('tab');
    if (roleParam || tabParam === 'login' || window.location.hash.includes('role=')) {
      setActiveTab('login');
    }
    fetchApiData();
  }, []);

  useEffect(() => {
    fetchApiData();
  }, [activeTab]);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem('dmb_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dmb_token');
    setActiveTab('home');
  };

  const handleNewCardApplied = (newCard: MedicalCard) => {
    setCards([newCard, ...cards]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Hide Navbar and Footer when in Admin Panel view */}
      {activeTab !== 'admin' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          siteSettings={siteSettings}
        />
      )}

      {/* Main Tab Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            centers={centers}
            tests={tests}
            packages={packages}
            blogs={blogs}
            testimonials={INITIAL_TESTIMONIALS}
          />
        )}

        {activeTab === 'about' && <AboutPage setActiveTab={setActiveTab} />}
        {activeTab === 'team' && <TeamPage setActiveTab={setActiveTab} />}
        {activeTab === 'services' && <ServicesPage setActiveTab={setActiveTab} />}
        {activeTab === 'medical-card' && <MedicalCardPage setActiveTab={setActiveTab} />}

        {activeTab === 'apply' && (
          <CardApplyPage
            onSuccessApply={handleNewCardApplied}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'rep-register' && <RepresentativeRegisterPage setActiveTab={setActiveTab} />}

        {activeTab === 'verify' && <CardVerificationPage setActiveTab={setActiveTab} />}
        {activeTab === 'diagnostic' && <DiagnosticCentersPage centers={centers} />}
        {activeTab === 'test-prices' && <TestPricesPage tests={tests} setActiveTab={setActiveTab} />}
        {activeTab === 'packages' && <PackagesPage packages={packages} setActiveTab={setActiveTab} />}
        {activeTab === 'partner' && <PartnerPage centers={centers} />}
        {activeTab === 'events' && <EventGalleryPage setActiveTab={setActiveTab} />}
        {activeTab === 'blog' && <BlogPage blogs={blogs} />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'faq' && <FaqPage faqs={INITIAL_FAQS} />}

        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'admin' && (
          user ? (
            user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_STAFF' ? (
              <AdminDashboard
                user={user}
                onLogout={handleLogout}
                initialCards={cards}
                initialCenters={centers}
                initialTests={tests}
                initialPackages={packages}
                initialTransactions={transactions}
                initialBlogs={blogs}
              />
            ) : user.role === 'MEDICAL_CARD_MEMBER' ? (
              <MemberDashboard
                user={user}
                onLogout={handleLogout}
                initialCards={cards}
                initialPackages={packages}
                initialCenters={centers}
              />
            ) : user.role === 'DIAGNOSTIC_PARTNER' ? (
              <PartnerDashboard
                user={user}
                onLogout={handleLogout}
                initialCenters={centers}
              />
            ) : user.role === 'REPRESENTATIVE' ? (
              <RepresentativeDashboard
                user={user}
                onLogout={handleLogout}
              />
            ) : user.role === 'DOCTOR' ? (
              <DoctorDashboard
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <AdminDashboard
                user={user}
                onLogout={handleLogout}
                initialCards={cards}
                initialCenters={centers}
                initialTests={tests}
                initialPackages={packages}
                initialTransactions={transactions}
                initialBlogs={blogs}
              />
            )
          ) : (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              setActiveTab={setActiveTab}
            />
          )
        )}
      </main>

      {/* Footer */}
      {activeTab !== 'admin' && <Footer setActiveTab={setActiveTab} siteSettings={siteSettings} />}
    </div>
  );
}
