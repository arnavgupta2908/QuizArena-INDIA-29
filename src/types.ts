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
  amount?: number;
  utr_number?: string;
  payment_screenshot?: string;
  payment_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
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

export interface AdminStats {
  total_registrations: number;
  pending_registrations: number;
  confirmed_registrations: number;
  rejected_registrations: number;
  verified_payments: number;
  verified_revenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
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

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];
