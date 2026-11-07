import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { WebsiteSettings, Competition, AdminUser } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PrizeSection } from './components/PrizeSection';
import { HowToParticipate } from './components/HowToParticipate';
import { RulesAndSyllabus } from './components/RulesAndSyllabus';
import { RegistrationFeeSection } from './components/RegistrationFeeSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';
import { CheckStatusModal } from './components/CheckStatusModal';
import { LegalModals } from './components/LegalModals';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

const initialDefaultSettings: WebsiteSettings = {
  website_title: 'QUIZARENA INDIA',
  tagline: 'Think. Compete. Win.',
  hero_heading: 'Challenge Your Knowledge. Prove Your Skills.',
  hero_subheading: "India's premier national online quiz championship. Compete with bright minds across the nation, test your intellect across General Knowledge, Science, Indian Heritage & Current Affairs, and win cash prizes, medals & national certificates.",
  registration_fee: 50,
  registrations_open: true,
  payment_qr_image: '/assets/aistudio/qr_code_cropped.png',
  contact_email: 'support@quizarena.in',
  contact_phone: '+91 98765 43210',
  contact_whatsapp: '+91 98765 43210',
  announcement_banner: '⚡ Exam on 30th December 2026! Last Date of Registration: 30th December 2026.',
  faqs: [
    {
      question: 'Who is eligible to participate in QuizArena India?',
      answer: 'Anyone aged 10 to 60 residing in India or of Indian origin can participate. The quiz questions are curated with multi-level cognitive logic suitable for students, college scholars, and working professionals alike.'
    },
    {
      question: 'How do I pay the ₹50 registration fee?',
      answer: 'You can use any UPI app (PhonePe, Google Pay, Paytm, BHIM, Cred, Amazon Pay, or bank UPI). Simply scan the official QuizArena QR code shown during Step 2 of registration, complete the ₹50 payment, copy the 12-digit UTR/UPI Transaction ID, upload the screenshot, and submit!'
    },
    {
      question: 'Why is my registration showing "PENDING"?',
      answer: 'For 100% security and to eliminate duplicate or fraudulent submissions, every UPI transaction ID and screenshot is manually verified by the QuizArena India verification team. Once verified, your status will turn CONFIRMED.'
    },
    {
      question: 'When and how will the quiz take place?',
      answer: 'The quiz is conducted completely online on a secure proctored portal. Confirmed participants receive their login credentials, admit link, and exam time slot via email and SMS/WhatsApp 48 hours before the event.'
    },
    {
      question: 'What are the prizes and recognition awarded?',
      answer: 'Top 3 rankers receive Grand Cash Prizes, Gold/Silver/Bronze Trophies, and Framed Certificates of Merit delivered to their doorstep. Top 50 participants receive Cash Vouchers and Certificates of Excellence, and all verified participants receive an official Certificate of Participation.'
    },
    {
      question: 'Is the registration fee refundable?',
      answer: 'Registration fees are non-refundable once your registration has been submitted and verified, as server slots and examination licenses are booked immediately. In case of payment deduplication or rejected registrations, refund requests are processed within 5-7 business days.'
    }
  ],
  terms_and_conditions: `QUIZARENA INDIA - TERMS & CONDITIONS\n1. Nature of Competition: QuizArena India is an intellectual skill-based online quiz tournament. No element of chance or lottery is involved.\n2. Eligibility: Participants must provide accurate full name, valid Indian phone number, and state. Impersonation will result in immediate disqualification.\n3. Registration & Fee: A nominal participation fee of ₹50 is required to cover cloud server infrastructure, proctoring security, and evaluation logistics.\n4. Verification: All payments are subjected to manual UTR verification. Submitting fake, altered, or duplicate UTR numbers will permanently ban the participant.\n5. Code of Conduct: Participants agree not to use unauthorized browser extensions, AI tools, or secondary devices during the quiz.\n6. Decision of Judges: The QuizArena jury's score evaluation and rank determination are final and binding.`,
  privacy_policy: `QUIZARENA INDIA - PRIVACY POLICY\nWe respect and protect your personal information.\n1. Information Collected: Full Name, Contact Mobile, Email, State, City, and payment proof (UTR and transaction receipt).\n2. Purpose: Data is solely utilized for participant authentication, admit card generation, prize distribution, and critical competition updates.\n3. Security: Payment screenshots and participant credentials are encrypted and stored in private directories accessible only to authorized administrators.\n4. Third Parties: We never sell, rent, or trade your personal data to third-party marketing companies.`,
  refund_policy: `QUIZARENA INDIA - REFUND & CANCELLATION POLICY\n1. As slot reservation and question-paper provisioning happen instantaneously, registration fees once verified are non-refundable.\n2. In the rare event of duplicate payment debits for the same participant, excess amount will be refunded upon manual review within 7 working days.\n3. If an application is rejected by the administration due to illegible or failed payment receipts, the participant may re-upload a valid proof or contact support.`
};

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings>(initialDefaultSettings);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [checkStatusModalOpen, setCheckStatusModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Monitor #admin hash in URL
  useEffect(() => {
    const handleHashChange = () => {
      const isHashAdmin = window.location.hash.toLowerCase() === '#admin';
      setIsAdminRoute(isHashAdmin);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial public settings & competitions
  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res.settings) setSettings(res.settings);
      })
      .catch(err => console.error('Failed to load settings:', err));

    api.getCompetitions()
      .then(res => {
        if (res.competitions) setCompetitions(res.competitions);
      })
      .catch(err => console.error('Failed to load competitions:', err));
  }, []);

  // Verify Admin Session if token exists
  useEffect(() => {
    const token = api.getAdminToken();
    if (token) {
      api.getAdminMe()
        .then(res => {
          setAdminUser(res.admin);
        })
        .catch(() => {
          api.clearAdminToken();
          setAdminUser(null);
        });
    }
  }, []);

  // Admin handlers
  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
  };

  const handleAdminLogout = () => {
    api.clearAdminToken();
    setAdminUser(null);
    window.location.hash = '';
    setIsAdminRoute(false);
  };

  const handleExitAdmin = () => {
    window.location.hash = '';
    setIsAdminRoute(false);
  };

  const activeCompetition = competitions[0];

  // If URL hash is #admin, show private admin interface
  if (isAdminRoute) {
    if (adminUser) {
      return (
        <AdminDashboard
          admin={adminUser}
          onLogout={handleAdminLogout}
          onViewWebsite={handleExitAdmin}
          settings={settings}
          onSettingsUpdate={newSettings => setSettings(newSettings)}
        />
      );
    }
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onExit={handleExitAdmin}
      />
    );
  }

  // Otherwise, render Public Website
  // Strictly NO admin button, admin link or admin login option on public website!
  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Public Navbar */}
      <Navbar
        settings={settings}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenCheckStatus={() => setCheckStatusModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          settings={settings}
          activeCompetition={activeCompetition}
          onOpenRegister={() => setRegisterModalOpen(true)}
          onOpenCheckStatus={() => setCheckStatusModalOpen(true)}
        />

        <PrizeSection
          competition={activeCompetition}
          onOpenRegister={() => setRegisterModalOpen(true)}
        />

        <HowToParticipate
          registrationFee={settings.registration_fee}
          onOpenRegister={() => setRegisterModalOpen(true)}
        />

        <RulesAndSyllabus
          competition={activeCompetition}
        />

        <RegistrationFeeSection
          fee={settings.registration_fee}
          onOpenRegister={() => setRegisterModalOpen(true)}
        />

        <FaqSection
          faqs={settings.faqs}
        />

        <ContactSection
          settings={settings}
        />
      </main>

      {/* Public Footer */}
      <Footer
        settings={settings}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenRefund={() => setLegalModalType('refund')}
      />

      {/* 3-Step Registration Modal */}
      <RegistrationModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        settings={settings}
        competition={activeCompetition}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
      />

      {/* Check Status Modal */}
      <CheckStatusModal
        isOpen={checkStatusModalOpen}
        onClose={() => setCheckStatusModalOpen(false)}
        supportPhone={settings.contact_phone}
        supportEmail={settings.contact_email}
      />

      {/* Legal Policies Modal */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        settings={settings}
      />
    </div>
  );
}
