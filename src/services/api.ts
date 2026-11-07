import { WebsiteSettings, Competition, Participant, AdminStats, AdminUser, EmailNotificationSettings, EmailAlertLog } from '../types';

const ADMIN_TOKEN_KEY = 'quizarena_admin_jwt';

export const api = {
  // Public APIs
  async getSettings(): Promise<{ success: boolean; settings: WebsiteSettings }> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async getCompetitions(): Promise<{ success: boolean; competitions: Competition[] }> {
    const res = await fetch('/api/competitions');
    if (!res.ok) throw new Error('Failed to fetch competitions');
    return res.json();
  },

  async checkDuplicate(mobile: string, email: string, competitionId: string): Promise<{ duplicate: boolean; message?: string }> {
    const res = await fetch('/api/registrations/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, email, competitionId })
    });
    if (!res.ok) throw new Error('Failed to check duplicate');
    return res.json();
  },

  async submitRegistration(formData: FormData): Promise<{
    success: boolean;
    registration_id: string;
    participant: any;
    message: string;
  }> {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit registration');
    }
    return data;
  },

  async checkRegistrationStatus(query: string): Promise<{
    success: boolean;
    data: {
      registration_id: string;
      full_name: string;
      email: string;
      mobile: string;
      state: string;
      city: string;
      status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
      created_at: string;
      payment_amount: number;
      payment_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
      utr_number: string;
      rejection_reason?: string | null;
      verified_at?: string | null;
    };
  }> {
    const res = await fetch(`/api/registrations/status/${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Record not found');
    }
    return data;
  },

  // Admin APIs
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async adminLogin(email: string, password: string): Promise<{
    success: boolean;
    token: string;
    admin: AdminUser;
  }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    this.setAdminToken(data.token);
    return data;
  },

  async getAdminMe(): Promise<{ success: boolean; admin: AdminUser }> {
    const res = await fetch('/api/admin/me', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  async getAdminStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await fetch('/api/admin/stats', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  async getAdminRegistrations(status?: string, search?: string): Promise<{
    success: boolean;
    registrations: Participant[];
  }> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);

    const res = await fetch(`/api/admin/registrations?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load registrations');
    return res.json();
  },

  async verifyRegistrationPayment(
    id: string,
    action: 'CONFIRM' | 'REJECT' | 'PENDING',
    rejectionReason?: string
  ): Promise<{
    success: boolean;
    participant: Participant;
    stats: AdminStats;
    message: string;
  }> {
    const res = await fetch(`/api/admin/registrations/${id}/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification action failed');
    return data;
  },

  async deleteRegistration(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete record');
    return data;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<{
    success: boolean;
    settings: WebsiteSettings;
    message: string;
  }> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  async uploadQRCode(file: File): Promise<{
    success: boolean;
    qr_url: string;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('qrImage', file);

    const token = this.getAdminToken();
    const res = await fetch('/api/admin/upload-qr', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload QR');
    return data;
  },

  async updateCompetition(id: string, competition: Partial<Competition>): Promise<{
    success: boolean;
    competition: Competition;
  }> {
    const res = await fetch(`/api/admin/competitions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(competition)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update competition');
    return data;
  },

  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
    return data;
  },

  async getEmailSettings(): Promise<{
    success: boolean;
    emailSettings: EmailNotificationSettings;
    logs: EmailAlertLog[];
  }> {
    const res = await fetch('/api/admin/email-settings', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load email settings');
    return res.json();
  },

  async updateEmailSettings(settings: Partial<EmailNotificationSettings>): Promise<{
    success: boolean;
    emailSettings: EmailNotificationSettings;
    message: string;
  }> {
    const res = await fetch('/api/admin/email-settings', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update email settings');
    return data;
  },

  async sendTestEmailAlert(toEmail?: string): Promise<{
    success: boolean;
    status: 'SENT' | 'SIMULATED' | 'FAILED';
    message: string;
    log: EmailAlertLog;
  }> {
    const res = await fetch('/api/admin/email-test', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ toEmail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send test email');
    return data;
  },

  async clearEmailLogs(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/email-logs', {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear logs');
    return data;
  }
};
