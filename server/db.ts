import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Participant {
  id: string;
  registration_id: string;
  full_name: string;
  mobile: string;
  email: string;
  age: number;
  state: string;
  city: string;
  school_name?: string;
  gender?: string;
  competition_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  created_at: string;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  utr_number: string;
  payment_screenshot: string;
  payment_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
}

export interface Competition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  registration_fee: number;
  start_date: string;
  end_date: string;
  registration_enabled: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  prizes: { rank: string; prize: string; icon: string }[];
  rules: string[];
  topics: string[];
}

export interface WebsiteSettings {
  website_title: string;
  tagline: string;
  hero_heading: string;
  hero_subheading: string;
  registration_fee: number;
  registrations_open: boolean;
  payment_qr_image: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  announcement_banner: string;
  faqs: { question: string; answer: string }[];
  terms_and_conditions: string;
  privacy_policy: string;
  refund_policy: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  created_at: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  admin_notification_email: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_secure?: boolean;
  from_email?: string;
}

export interface EmailAlertLog {
  id: string;
  registration_id: string;
  participant_name: string;
  recipient_email: string;
  subject: string;
  content: string;
  sent_at: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  error_message?: string;
}

interface DatabaseSchema {
  participants: Participant[];
  payments: Payment[];
  competitions: Competition[];
  settings: WebsiteSettings;
  admins: AdminUser[];
  email_settings: EmailNotificationSettings;
  email_logs: EmailAlertLog[];
}

const DB_PATH = path.resolve(process.cwd(), 'data/database.json');

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

const initialSettings: WebsiteSettings = {
  website_title: 'QUIZARENA INDIA',
  tagline: 'Think. Compete. Win.',
  hero_heading: 'Challenge Your Knowledge. Prove Your Skills.',
  hero_subheading: "India's premier national online quiz championship. Compete with bright minds across the nation, test your intellect across General Knowledge, Science, History & Current Affairs, and win cash prizes, medals & national certificates.",
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
  terms_and_conditions: `QUIZARENA INDIA - TERMS & CONDITIONS
1. Nature of Competition: QuizArena India is an intellectual skill-based online quiz tournament. No element of chance or lottery is involved.
2. Eligibility: Participants must provide accurate full name, valid Indian phone number, and state. Impersonation will result in immediate disqualification.
3. Registration & Fee: A nominal participation fee of ₹50 is required to cover cloud server infrastructure, proctoring security, and evaluation logistics.
4. Verification: All payments are subjected to manual UTR verification. Submitting fake, altered, or duplicate UTR numbers will permanently ban the participant.
5. Code of Conduct: Participants agree not to use unauthorized browser extensions, AI tools, or secondary devices during the quiz.
6. Decision of Judges: The QuizArena jury's score evaluation and rank determination are final and binding.`,
  privacy_policy: `QUIZARENA INDIA - PRIVACY POLICY
We respect and protect your personal information.
1. Information Collected: Full Name, Contact Mobile, Email, State, City, and payment proof (UTR and transaction receipt).
2. Purpose: Data is solely utilized for participant authentication, admit card generation, prize distribution, and critical competition updates.
3. Security: Payment screenshots and participant credentials are encrypted and stored in private directories accessible only to authorized administrators.
4. Third Parties: We never sell, rent, or trade your personal data to third-party marketing companies.`,
  refund_policy: `QUIZARENA INDIA - REFUND & CANCELLATION POLICY
1. As slot reservation and question-paper provisioning happen instantaneously, registration fees once verified are non-refundable.
2. In the rare event of duplicate payment debits for the same participant, excess amount will be refunded upon manual review within 7 working days.
3. If an application is rejected by the administration due to illegible or failed payment receipts, the participant may re-upload a valid proof or contact support.`
};

const initialCompetitions: Competition[] = [
  {
    id: 'comp_national_2026',
    title: 'QuizArena All-India National Championship 2026',
    subtitle: 'General Knowledge, Science, History & Current Affairs',
    description: 'The biggest intellectual battleground for Indian minds. 50 high-impact questions, 45 minutes, tested on speed, accuracy, and depth of reasoning.',
    registration_fee: 50,
    start_date: '2026-12-30T10:00:00+05:30',
    end_date: '2026-12-30T23:59:59+05:30',
    registration_enabled: true,
    status: 'ACTIVE',
    prizes: [
      { rank: '1st Prize (Champion)', prize: 'Brand New Laptop + National Gold Trophy + Certificate of Championship', icon: 'laptop' },
      { rank: '2nd to 5th Prize', prize: 'Smart Mobilephone + Silver Trophy/Medal + Certificate of Excellence', icon: 'smartphone' },
      { rank: '5th to 10th Prize', prize: 'Smartwatch & Headphones + Certificate of High Merit', icon: 'watch' },
      { rank: 'All Participants', prize: 'Official Digital Certificate of National Participation with Verified QR', icon: 'file-check' }
    ],
    rules: [
      'Total 50 multiple choice questions (MCQ).',
      '45 Minutes overall exam duration.',
      '+2 Marks for every correct answer, -0.5 for wrong answers to discourage blind guessing.',
      'Tie-breaker is determined by the total submission time recorded by the server.',
      'Accessible on any smartphone, tablet, laptop, or desktop with a modern browser.'
    ],
    topics: [
      'Indian History & Heritage',
      'Science & Modern Technology',
      'Geography & Wildlife of India',
      'Sports, Olympics & Cricket',
      'Current Affairs & National Governance',
      'Logical Reasoning & Brain Teasers'
    ]
  }
];

const initialEmailSettings: EmailNotificationSettings = {
  enabled: true,
  admin_notification_email: 'arnavgupta2580@gmail.com',
  smtp_host: process.env.SMTP_HOST || '',
  smtp_port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtp_user: process.env.SMTP_USER || '',
  smtp_pass: process.env.SMTP_PASS || '',
  smtp_secure: false,
  from_email: process.env.SMTP_FROM || 'alerts@quizarena.in'
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure defaults if missing
        return {
          participants: parsed.participants || [],
          payments: parsed.payments || [],
          competitions: parsed.competitions || initialCompetitions,
          settings: { ...initialSettings, ...(parsed.settings || {}) },
          admins: parsed.admins || this.getDefaultAdmins(),
          email_settings: { ...initialEmailSettings, ...(parsed.email_settings || {}) },
          email_logs: parsed.email_logs || []
        };
      }
    } catch (e) {
      console.error('Failed to load database, creating fresh one:', e);
    }
    
    const fresh: DatabaseSchema = {
      participants: [],
      payments: [],
      competitions: initialCompetitions,
      settings: initialSettings,
      admins: this.getDefaultAdmins(),
      email_settings: initialEmailSettings,
      email_logs: []
    };
    this.saveData(fresh);
    return fresh;
  }

  private getDefaultAdmins(): AdminUser[] {
    const admin1 = hashPassword('Admin@QuizArena2026');
    const now = new Date().toISOString();
    return [
      {
        id: 'admin_1',
        email: 'arnavgupta2580@gmail.com',
        name: 'Arnav Gupta (Super Admin)',
        password_hash: admin1.hash,
        salt: admin1.salt,
        role: 'SUPER_ADMIN',
        created_at: now
      },
      {
        id: 'admin_2',
        email: 'admin@quizarena.in',
        name: 'QuizArena Administrator',
        password_hash: admin1.hash,
        salt: admin1.salt,
        role: 'SUPER_ADMIN',
        created_at: now
      }
    ];
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Participants
  public getParticipants(): Participant[] {
    return this.data.participants;
  }

  public getParticipantById(id: string): Participant | undefined {
    return this.data.participants.find(p => p.id === id || p.registration_id === id);
  }

  public findParticipantByMobileOrEmail(mobile: string, email: string, competition_id: string): Participant | undefined {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = email.trim().toLowerCase();
    return this.data.participants.find(p => {
      const pMobile = p.mobile.replace(/\D/g, '').slice(-10);
      const pEmail = p.email.trim().toLowerCase();
      return (pMobile === cleanMobile || pEmail === cleanEmail) && p.competition_id === competition_id;
    });
  }

  public addParticipant(participant: Participant): Participant {
    this.data.participants.unshift(participant);
    this.persist();
    return participant;
  }

  public updateParticipantStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'REJECTED'): boolean {
    const p = this.data.participants.find(item => item.id === id || item.registration_id === id);
    if (p) {
      p.status = status;
      this.persist();
      return true;
    }
    return false;
  }

  public deleteParticipant(id: string): boolean {
    const initialLen = this.data.participants.length;
    this.data.participants = this.data.participants.filter(p => p.id !== id && p.registration_id !== id);
    this.data.payments = this.data.payments.filter(pay => pay.registration_id !== id);
    this.persist();
    return this.data.participants.length < initialLen;
  }

  // Payments
  public getPayments(): Payment[] {
    return this.data.payments;
  }

  public getPaymentByRegistrationId(regId: string): Payment | undefined {
    return this.data.payments.find(p => p.registration_id === regId);
  }

  public addPayment(payment: Payment): Payment {
    this.data.payments.unshift(payment);
    this.persist();
    return payment;
  }

  public verifyPayment(
    registration_id: string,
    action: 'CONFIRM' | 'REJECT' | 'PENDING',
    adminEmail: string,
    rejectionReason?: string
  ): { success: boolean; participant?: Participant; payment?: Payment } {
    const participant = this.data.participants.find(p => p.id === registration_id || p.registration_id === registration_id);
    const payment = this.data.payments.find(pay => pay.registration_id === (participant ? participant.registration_id : registration_id));

    if (!participant || !payment) {
      return { success: false };
    }

    const now = new Date().toISOString();

    if (action === 'CONFIRM') {
      participant.status = 'CONFIRMED';
      payment.payment_status = 'VERIFIED';
      payment.verified_at = now;
      payment.verified_by = adminEmail;
      payment.rejection_reason = null;
    } else if (action === 'REJECT') {
      participant.status = 'REJECTED';
      payment.payment_status = 'REJECTED';
      payment.verified_at = now;
      payment.verified_by = adminEmail;
      payment.rejection_reason = rejectionReason || 'Payment screenshot or UTR number could not be validated against bank records.';
    } else {
      participant.status = 'PENDING';
      payment.payment_status = 'PENDING';
      payment.verified_at = null;
      payment.verified_by = null;
      payment.rejection_reason = null;
    }

    this.persist();
    return { success: true, participant, payment };
  }

  // Settings
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.persist();
    return this.data.settings;
  }

  // Competitions
  public getCompetitions(): Competition[] {
    return this.data.competitions;
  }

  public updateCompetition(id: string, compData: Partial<Competition>): Competition | null {
    const comp = this.data.competitions.find(c => c.id === id);
    if (!comp) return null;
    Object.assign(comp, compData);
    this.persist();
    return comp;
  }

  public addCompetition(comp: Competition): Competition {
    this.data.competitions.push(comp);
    this.persist();
    return comp;
  }

  // Admins
  public getAdmins(): AdminUser[] {
    return this.data.admins;
  }

  public getAdminByEmail(email: string): AdminUser | undefined {
    return this.data.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  }

  public updateAdminPassword(email: string, newPassword: string): boolean {
    const admin = this.getAdminByEmail(email);
    if (!admin) return false;
    const { hash, salt } = hashPassword(newPassword);
    admin.password_hash = hash;
    admin.salt = salt;
    this.persist();
    return true;
  }

  // Stats
  public getStats() {
    const total = this.data.participants.length;
    const pending = this.data.participants.filter(p => p.status === 'PENDING').length;
    const confirmed = this.data.participants.filter(p => p.status === 'CONFIRMED').length;
    const rejected = this.data.participants.filter(p => p.status === 'REJECTED').length;
    
    // Revenue from verified payments only
    const verifiedRevenue = this.data.payments
      .filter(p => p.payment_status === 'VERIFIED')
      .reduce((sum, p) => sum + (p.amount || 50), 0);
    
    const verifiedPayments = this.data.payments.filter(p => p.payment_status === 'VERIFIED').length;

    return {
      total_registrations: total,
      pending_registrations: pending,
      confirmed_registrations: confirmed,
      rejected_registrations: rejected,
      verified_payments: verifiedPayments,
      verified_revenue: verifiedRevenue
    };
  }

  // Email Notifications
  public getEmailSettings(): EmailNotificationSettings {
    return this.data.email_settings;
  }

  public updateEmailSettings(settings: Partial<EmailNotificationSettings>): EmailNotificationSettings {
    this.data.email_settings = { ...this.data.email_settings, ...settings };
    this.persist();
    return this.data.email_settings;
  }

  public getEmailLogs(): EmailAlertLog[] {
    return this.data.email_logs || [];
  }

  public addEmailLog(log: EmailAlertLog): void {
    if (!this.data.email_logs) this.data.email_logs = [];
    this.data.email_logs.unshift(log);
    if (this.data.email_logs.length > 100) {
      this.data.email_logs = this.data.email_logs.slice(0, 100);
    }
    this.persist();
  }

  public clearEmailLogs(): void {
    this.data.email_logs = [];
    this.persist();
  }
}

export const db = new Database();
