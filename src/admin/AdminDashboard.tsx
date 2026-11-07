import React, { useState, useEffect } from 'react';
import {
  Trophy,
  LayoutDashboard,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Settings,
  QrCode,
  Calendar,
  Lock,
  LogOut,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  FileText,
  Save,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  Mail,
  Bell,
  Send,
  CheckCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, Participant, WebsiteSettings, Competition, AdminUser, EmailNotificationSettings, EmailAlertLog } from '../types';

interface AdminDashboardProps {
  admin: AdminUser;
  onLogout: () => void;
  onViewWebsite: () => void;
  settings: WebsiteSettings;
  onSettingsUpdate: (newSettings: WebsiteSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  onLogout,
  onViewWebsite,
  settings,
  onSettingsUpdate
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'email' | 'qr' | 'content' | 'competition' | 'security'>('overview');

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    total_registrations: 0,
    pending_registrations: 0,
    confirmed_registrations: 0,
    rejected_registrations: 0,
    verified_payments: 0,
    verified_revenue: 0
  });

  // Registrations Table State
  const [registrations, setRegistrations] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Verification Modal State
  const [selectedReg, setSelectedReg] = useState<Participant | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Screenshot Zoom Modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Email Notifications State
  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>({
    enabled: true,
    admin_notification_email: 'arnavgupta2580@gmail.com',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    from_email: 'alerts@quizarena.in'
  });
  const [emailLogs, setEmailLogs] = useState<EmailAlertLog[]>([]);
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [emailSettingsNotice, setEmailSettingsNotice] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailAlertLog | null>(null);

  // Content Settings Form State
  const [contentForm, setContentForm] = useState<WebsiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState('');

  // QR Code Upload State
  const [newQrFile, setNewQrFile] = useState<File | null>(null);
  const [newQrPreview, setNewQrPreview] = useState<string | null>(null);
  const [qrUploadLoading, setQrUploadLoading] = useState(false);
  const [qrNotice, setQrNotice] = useState('');

  // Competition Form State
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activeComp, setActiveComp] = useState<Competition | null>(null);
  const [savingComp, setSavingComp] = useState(false);
  const [compNotice, setCompNotice] = useState('');

  // Security (Change Password) State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load Initial Data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, regsRes, compsRes, emailRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRegistrations(),
        api.getCompetitions(),
        api.getEmailSettings().catch(() => ({ success: false, emailSettings: null, logs: [] }))
      ]);
      setStats(statsRes.stats);
      setRegistrations(regsRes.registrations);
      setCompetitions(compsRes.competitions);
      if (compsRes.competitions.length > 0) {
        setActiveComp(compsRes.competitions[0]);
      }
      if (emailRes.emailSettings) {
        setEmailSettings(emailRes.emailSettings);
      }
      if (emailRes.logs) {
        setEmailLogs(emailRes.logs);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Registrations
  const filteredRegistrations = registrations
    .filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.registration_id.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.utr_number && r.utr_number.toLowerCase().includes(q)) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Open Verification Modal
  const handleOpenVerify = (reg: Participant) => {
    setSelectedReg(reg);
    setRejectionReason(reg.rejection_reason || '');
    setActionSuccessMsg('');
    setVerifyModalOpen(true);
  };

  // Handle Verify Action (CONFIRM / REJECT / PENDING)
  const handleExecuteVerification = async (action: 'CONFIRM' | 'REJECT' | 'PENDING') => {
    if (!selectedReg) return;

    if (action === 'REJECT' && !rejectionReason.trim()) {
      alert('Please specify a rejection reason to inform the participant.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.verifyRegistrationPayment(
        selectedReg.registration_id,
        action,
        action === 'REJECT' ? rejectionReason.trim() : undefined
      );

      // Update local stats and registration lists
      setStats(res.stats);
      setRegistrations(prev =>
        prev.map(item =>
          item.registration_id === selectedReg.registration_id ? { ...item, ...res.participant } : item
        )
      );
      setSelectedReg(prev => (prev ? { ...prev, ...res.participant } : null));
      setActionSuccessMsg(res.message);

      setTimeout(() => {
        setVerifyModalOpen(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Record
  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete registration ${id}?`)) {
      return;
    }
    try {
      await api.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.registration_id !== id && r.id !== id));
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const token = api.getAdminToken();
    const url = `/api/admin/registrations/export`;
    // Trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `quizarena_registrations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert('Failed to download CSV: ' + err.message));
  };

  // Save Website Content Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsNotice('');
      const res = await api.updateSettings(contentForm);
      onSettingsUpdate(res.settings);
      setSettingsNotice('Website content & settings updated successfully!');
      setTimeout(() => setSettingsNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // QR Code File Upload
  const handleQrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewQrFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setNewQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrFile) return;

    try {
      setQrUploadLoading(true);
      setQrNotice('');
      const res = await api.uploadQRCode(newQrFile);
      const updated = { ...settings, payment_qr_image: res.qr_url };
      onSettingsUpdate(updated);
      setContentForm(prev => ({ ...prev, payment_qr_image: res.qr_url }));
      setNewQrFile(null);
      setNewQrPreview(null);
      setQrNotice('QR code updated successfully! The new QR is now live on the public payment page.');
      setTimeout(() => setQrNotice(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to upload QR code');
    } finally {
      setQrUploadLoading(false);
    }
  };

  // Reset to default cropped QR
  const handleResetDefaultQr = async () => {
    if (!window.confirm('Reset payment QR code to default cropped PhonePe QR?')) return;
    try {
      const defaultQrPath = '/assets/aistudio/qr_code_cropped.png';
      const res = await api.updateSettings({ payment_qr_image: defaultQrPath });
      onSettingsUpdate(res.settings);
      setContentForm(prev => ({ ...prev, payment_qr_image: defaultQrPath }));
      setQrNotice('Reset to default cropped QR image successfully!');
    } catch (err: any) {
      alert('Failed to reset QR: ' + err.message);
    }
  };

  // Save Email Notification Settings
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingEmailSettings(true);
      setEmailSettingsNotice('');
      const res = await api.updateEmailSettings(emailSettings);
      setEmailSettings(res.emailSettings);
      setEmailSettingsNotice('Email notification settings saved successfully!');
      setTimeout(() => setEmailSettingsNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update email settings');
    } finally {
      setSavingEmailSettings(false);
    }
  };

  // Trigger Test Email Alert
  const handleSendTestEmail = async () => {
    try {
      setTestEmailLoading(true);
      setTestEmailFeedback(null);
      const res = await api.sendTestEmailAlert(emailSettings.admin_notification_email);
      setTestEmailFeedback({
        type: res.status === 'FAILED' ? 'error' : 'success',
        message: res.message
      });
      const updated = await api.getEmailSettings();
      if (updated.logs) setEmailLogs(updated.logs);
    } catch (err: any) {
      setTestEmailFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch test email alert'
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Clear Email Alert Logs
  const handleClearEmailLogs = async () => {
    if (!window.confirm('Clear all email alert audit logs?')) return;
    try {
      await api.clearEmailLogs();
      setEmailLogs([]);
    } catch (err: any) {
      alert(err.message || 'Failed to clear logs');
    }
  };

  // Save Competition Changes
  const handleSaveCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComp) return;

    try {
      setSavingComp(true);
      setCompNotice('');
      const res = await api.updateCompetition(activeComp.id, activeComp);
      setCompetitions(prev => prev.map(c => (c.id === activeComp.id ? res.competition : c)));
      setCompNotice('Competition details updated successfully!');
      setTimeout(() => setCompNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update competition');
    } finally {
      setSavingComp(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      setPasswordNotice('Administrator password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordNotice(''), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#080d24] border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Admin Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-wider uppercase">
                    QUIZARENA INDIA
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">{admin.email}</p>
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={onViewWebsite}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>View Public Website</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-white/5 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manage Registrations</span>
              {stats.pending_registrations > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {stats.pending_registrations}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Alerts</span>
              {emailSettings.enabled ? (
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                  ACTIVE
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full border border-slate-700 font-bold">
                  OFF
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Manage Payment QR</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Content</span>
            </button>

            <button
              onClick={() => setActiveTab('competition')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'competition'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Competition Details</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Password</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= SECTION A: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Administrator Overview</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Real-time participant counts, pending verifications, and verified registration revenue.
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 w-fit border border-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Statistics</span>
              </button>
            </div>

            {/* 6 Real-Time Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Total Registrations */}
              <div className="glass-card rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Registrations
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.total_registrations}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">All participant submissions</span>
              </div>

              {/* Pending Registrations */}
              <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Pending
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {stats.pending_registrations}
                </div>
                <span className="text-[10px] text-amber-400/80 mt-1 block font-semibold">
                  Awaiting manual verification
                </span>
              </div>

              {/* Confirmed Registrations */}
              <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Confirmed
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {stats.confirmed_registrations}
                </div>
                <span className="text-[10px] text-emerald-400/80 mt-1 block font-semibold">
                  Officially registered quizzers
                </span>
              </div>

              {/* Rejected Registrations */}
              <div className="glass-card rounded-2xl p-5 border border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Rejected
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                  {stats.rejected_registrations}
                </div>
                <span className="text-[10px] text-rose-400/80 mt-1 block">Invalid UTR / Proofs</span>
              </div>

              {/* Total Verified Payments */}
              <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    Verified Payments
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-200 font-mono">
                  {stats.verified_payments}
                </div>
                <span className="text-[10px] text-purple-400/80 mt-1 block">Manually approved</span>
              </div>

              {/* Total Verified Revenue */}
              <div className="glass-card-gold rounded-2xl p-5 border border-amber-400/50 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Verified Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  ₹{stats.verified_revenue}
                </div>
                <span className="text-[10px] text-amber-200/80 mt-1 block font-semibold">
                  From verified entries only
                </span>
              </div>
            </div>

            {/* Quick Actions & Pending Attention Strip */}
            {stats.pending_registrations > 0 ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {stats.pending_registrations} New Registration{stats.pending_registrations > 1 ? 's' : ''} Awaiting Manual Verification!
                    </h4>
                    <p className="text-xs text-slate-300">
                      Check payment UTR numbers and screenshots to confirm or reject participant applications.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('PENDING');
                    setActiveTab('registrations');
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-xs shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Pending Payments</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
                  <p className="text-xs text-slate-300">
                    There are no pending registrations waiting for manual verification at this moment.
                  </p>
                </div>
              </div>
            )}

            {/* Recent Registrations Quick Table */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  View All ({registrations.length}) →
                </button>
              </div>

              {registrations.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No registrations have been submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-3 font-semibold">Reg ID</th>
                        <th className="pb-3 font-semibold">Participant</th>
                        <th className="pb-3 font-semibold">Mobile</th>
                        <th className="pb-3 font-semibold">State</th>
                        <th className="pb-3 font-semibold">UTR Number</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {registrations.slice(0, 5).map(r => (
                        <tr key={r.registration_id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono font-bold text-amber-400">{r.registration_id}</td>
                          <td className="py-3 font-semibold text-white">{r.full_name}</td>
                          <td className="py-3 font-mono text-slate-300">{r.mobile}</td>
                          <td className="py-3 text-slate-300">{r.state}</td>
                          <td className="py-3 font-mono text-slate-400">{r.utr_number || 'N/A'}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                r.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : r.status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleOpenVerify(r)}
                              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] border border-slate-700 cursor-pointer"
                            >
                              Inspect / Verify
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION B: MANAGE REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Manage Registrations</h2>
                <p className="text-xs text-slate-400">
                  Search, inspect payment proofs, verify or reject participants, and export records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile, Reg ID, UTR number or City..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Registrations Full Table */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 font-semibold">Reg ID</th>
                      <th className="py-3.5 px-4 font-semibold">Participant Name</th>
                      <th className="py-3.5 px-4 font-semibold">Mobile & Email</th>
                      <th className="py-3.5 px-4 font-semibold">Age & State</th>
                      <th className="py-3.5 px-4 font-semibold">UTR / Trans ID</th>
                      <th className="py-3.5 px-4 font-semibold">Payment Proof</th>
                      <th className="py-3.5 px-4 font-semibold">Registration Date</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          No registrations found matching the specified search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map(r => (
                        <tr key={r.registration_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {r.registration_id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                            {r.full_name}
                            {r.school_name && (
                              <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                                {r.school_name}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono text-slate-200 block">+91 {r.mobile}</span>
                            <span className="text-[10px] text-slate-400">{r.email}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-slate-200 block">{r.state}</span>
                            <span className="text-[10px] text-slate-400">{r.city} • Age {r.age}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700/60 block w-fit">
                              {r.utr_number || 'N/A'}
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">₹{r.amount || 50}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {r.payment_screenshot ? (
                              <div
                                onClick={() => setZoomedImage(r.payment_screenshot!)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-amber-400 cursor-pointer relative group shrink-0"
                              >
                                <img
                                  src={r.payment_screenshot}
                                  alt="Proof thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px]">No image</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                            {new Date(r.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                r.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : r.status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenVerify(r)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleDeleteRegistration(r.registration_id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: EMAIL NOTIFICATION ALERTS ================= */}
        {activeTab === 'email' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-white">Email Notification Alerts</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    ⚡ Instant Trigger
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Receive instant email alerts whenever a new participant submits registration and UPI payment details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${testEmailLoading ? 'animate-spin' : ''}`} />
                  <span>{testEmailLoading ? 'Sending Alert...' : 'Send Test Alert'}</span>
                </button>
              </div>
            </div>

            {/* Feedback Notifications */}
            {emailSettingsNotice && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{emailSettingsNotice}</span>
              </div>
            )}

            {testEmailFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                  testEmailFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testEmailFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed">{testEmailFeedback.message}</div>
              </div>
            )}

            {/* Settings Form */}
            <form onSubmit={handleSaveEmailSettings} className="space-y-6">
              <div className="glass-card-gold rounded-2xl p-6 border border-amber-500/30 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Trigger Email on New Registration</h3>
                      <p className="text-[11px] text-slate-400">
                        Dispatches immediate notification alert with participant contact & UTR details
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.enabled}
                      onChange={e => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Alert Recipient Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arnavgupta2580@gmail.com"
                      value={emailSettings.admin_notification_email}
                      onChange={e =>
                        setEmailSettings({ ...emailSettings, admin_notification_email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      New registration notifications will be delivered to this email address immediately.
                    </p>
                  </div>
                </div>

                {/* SMTP Server Configuration (Optional) */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        SMTP Mail Server Credentials (Optional for Direct External Mail)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Leave blank to use the built-in system dispatcher, or enter your Gmail/SendGrid SMTP credentials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. smtp.gmail.com"
                        value={emailSettings.smtp_host || ''}
                        onChange={e => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        placeholder="587 or 465"
                        value={emailSettings.smtp_port || 587}
                        onChange={e =>
                          setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value, 10) || 587 })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        From Email Name/Address
                      </label>
                      <input
                        type="text"
                        placeholder="alerts@quizarena.in"
                        value={emailSettings.from_email || ''}
                        onChange={e => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Username / Email
                      </label>
                      <input
                        type="text"
                        placeholder="your-email@gmail.com"
                        value={emailSettings.smtp_user || ''}
                        onChange={e => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Password / App Password
                      </label>
                      <input
                        type="password"
                        placeholder="App password generated from your email provider"
                        value={emailSettings.smtp_pass || ''}
                        onChange={e => setEmailSettings({ ...emailSettings, smtp_pass: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingEmailSettings}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingEmailSettings ? 'Saving Settings...' : 'Save Email Notification Settings'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Email Notification Audit Log / History */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Triggered Notification Audit History</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time log of every alert dispatched for new participant registrations
                  </p>
                </div>

                {emailLogs.length > 0 && (
                  <button
                    onClick={handleClearEmailLogs}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {emailLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-white/5">
                  No email notification alerts recorded yet. Click "Send Test Alert" above to trigger a test!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-2.5 px-3 font-semibold">Time</th>
                        <th className="pb-2.5 px-3 font-semibold">Registration ID</th>
                        <th className="pb-2.5 px-3 font-semibold">Participant</th>
                        <th className="pb-2.5 px-3 font-semibold">Recipient</th>
                        <th className="pb-2.5 px-3 font-semibold">Delivery Status</th>
                        <th className="pb-2.5 px-3 font-semibold text-right">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {emailLogs.map(log => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                            {new Date(log.sent_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {log.registration_id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                            {log.participant_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                            {log.recipient_email}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                log.status === 'SENT'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : log.status === 'FAILED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {log.status === 'SENT' ? '✓ SENT (SMTP)' : log.status === 'FAILED' ? '✗ FAILED' : '⚡ DISPATCHED'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedEmailLog(log)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold border border-slate-700 cursor-pointer"
                            >
                              View Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION E: MANAGE PAYMENT QR CODE ================= */}
        {activeTab === 'qr' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-black text-white">Manage Payment QR Code</h2>
              <p className="text-xs text-slate-400">
                Upload and replace the official UPI QR code displayed on the public payment page.
              </p>
            </div>

            {qrNotice && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{qrNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Current Active QR Preview */}
              <div className="glass-card-gold rounded-2xl p-6 border border-amber-500/30 text-center space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Currently Active Public Payment QR
                </span>

                <div className="p-4 bg-black rounded-2xl border-2 border-amber-400 inline-block shadow-2xl">
                  <img
                    src={settings.payment_qr_image || '/assets/aistudio/qr_code_cropped.png'}
                    alt="Active QR Code"
                    className="w-56 h-56 object-contain rounded-xl mx-auto"
                  />
                </div>

                <div className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm">
                  Pay {settings.registration_fee} rupees here ☝️
                </div>

                <p className="text-[11px] text-slate-400">
                  This image is currently shown to every participant at Step 2 of registration.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleResetDefaultQr}
                    className="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer"
                  >
                    Reset to Default Cropped PhonePe QR
                  </button>
                </div>
              </div>

              {/* Upload New QR Box */}
              <form onSubmit={handleUploadQrSubmit} className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                <h3 className="text-base font-bold text-white">Upload New QR Code Image</h3>
                <p className="text-xs text-slate-400">
                  Upload your customized UPI QR image (JPG, PNG). The newly uploaded image will immediately replace the old QR across the entire portal.
                </p>

                <div className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-5 text-center bg-slate-900/50">
                  <input
                    type="file"
                    id="newQrInput"
                    accept="image/*"
                    onChange={handleQrFileSelect}
                    className="hidden"
                  />

                  {newQrPreview ? (
                    <div className="space-y-3">
                      <img
                        src={newQrPreview}
                        alt="New QR Preview"
                        className="w-44 h-44 object-contain mx-auto rounded-lg border border-white/10 bg-black p-2"
                      />
                      <label
                        htmlFor="newQrInput"
                        className="text-xs text-amber-400 hover:underline cursor-pointer block"
                      >
                        Choose Different Image
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="newQrInput"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        Click to select new QR code image
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Supported: PNG, JPG, JPEG (Square ratio recommended)
                      </span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!newQrFile || qrUploadLoading}
                  className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{qrUploadLoading ? 'Uploading New QR...' : 'Save & Publish New QR Code'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= SECTION D: MANAGE WEBSITE CONTENT ================= */}
        {activeTab === 'content' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Manage Website Content</h2>
                <p className="text-xs text-slate-400">
                  Update text, titles, contact details, registration fees, and legal policies without touching code.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save All Changes'}</span>
              </button>
            </div>

            {settingsNotice && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{settingsNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Core Brand & Headings */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Brand & Header Content
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Website Title</label>
                    <input
                      type="text"
                      value={contentForm.website_title}
                      onChange={e => setContentForm({ ...contentForm, website_title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={contentForm.tagline}
                      onChange={e => setContentForm({ ...contentForm, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Main Heading</label>
                    <input
                      type="text"
                      value={contentForm.hero_heading}
                      onChange={e => setContentForm({ ...contentForm, hero_heading: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Subheading Text</label>
                    <textarea
                      rows={3}
                      value={contentForm.hero_subheading}
                      onChange={e => setContentForm({ ...contentForm, hero_subheading: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Top Announcement Banner</label>
                    <input
                      type="text"
                      value={contentForm.announcement_banner}
                      onChange={e => setContentForm({ ...contentForm, announcement_banner: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Fee & Availability */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Registration Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registration Fee (in Rupees ₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={contentForm.registration_fee}
                      onChange={e => setContentForm({ ...contentForm, registration_fee: parseInt(e.target.value, 10) || 50 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Changing this updates all ₹50 references across hero, pricing cards, and payment QR.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registration Portal Status
                    </label>
                    <div className="pt-2">
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contentForm.registrations_open}
                          onChange={e => setContentForm({ ...contentForm, registrations_open: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-xs font-bold text-white">
                          {contentForm.registrations_open ? '✅ Registrations are ACTIVE & OPEN' : '❌ Registrations are CLOSED'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Contact Details */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Contact & Support Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={contentForm.contact_email}
                      onChange={e => setContentForm({ ...contentForm, contact_email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={contentForm.contact_phone}
                      onChange={e => setContentForm({ ...contentForm, contact_phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={contentForm.contact_whatsapp}
                      onChange={e => setContentForm({ ...contentForm, contact_whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Policies */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Legal Documentation & Policies
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Terms & Conditions</label>
                    <textarea
                      rows={5}
                      value={contentForm.terms_and_conditions}
                      onChange={e => setContentForm({ ...contentForm, terms_and_conditions: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Privacy Policy</label>
                    <textarea
                      rows={4}
                      value={contentForm.privacy_policy}
                      onChange={e => setContentForm({ ...contentForm, privacy_policy: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Refund Policy</label>
                    <textarea
                      rows={3}
                      value={contentForm.refund_policy}
                      onChange={e => setContentForm({ ...contentForm, refund_policy: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? 'Saving Content Changes...' : 'Save & Publish All Content Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= SECTION F: COMPETITION MANAGEMENT ================= */}
        {activeTab === 'competition' && activeComp && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Competition Management</h2>
                <p className="text-xs text-slate-400">
                  Update active championship title, exam schedule dates, and syllabus topics.
                </p>
              </div>

              <button
                onClick={handleSaveCompetition}
                disabled={savingComp}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingComp ? 'Saving...' : 'Save Competition'}</span>
              </button>
            </div>

            {compNotice && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{compNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveCompetition} className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Competition Title</label>
                    <input
                      type="text"
                      value={activeComp.title}
                      onChange={e => setActiveComp({ ...activeComp, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={activeComp.subtitle}
                      onChange={e => setActiveComp({ ...activeComp, subtitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={activeComp.status}
                      onChange={e => setActiveComp({ ...activeComp, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={activeComp.description}
                      onChange={e => setActiveComp({ ...activeComp, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingComp}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                {savingComp ? 'Saving...' : 'Update Competition Details'}
              </button>
            </form>
          </div>
        )}

        {/* ================= SECTION G: SECURITY & PASSWORD ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-md">
            <div>
              <h2 className="text-2xl font-black text-white">Administrator Security</h2>
              <p className="text-xs text-slate-400">
                Update your administrative login password.
              </p>
            </div>

            {passwordNotice && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordNotice}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Min 8 characters)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md text-xs cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL C: MANUAL PAYMENT VERIFICATION ================= */}
      {verifyModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-[#090e24] border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0b1333] via-[#101a42] to-[#0b1333] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Manual Payment Verification
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Registration ID: {selectedReg.registration_id}
                </p>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {actionSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Participant Details Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate</span>
                  <span className="font-bold text-white text-sm">{selectedReg.full_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Mobile Number</span>
                  <span className="font-mono text-white">+91 {selectedReg.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                  <span className="text-white truncate block">{selectedReg.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">State / City</span>
                  <span className="text-white">{selectedReg.state}, {selectedReg.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Registration Date</span>
                  <span className="text-white font-mono">
                    {new Date(selectedReg.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Current Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                      selectedReg.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedReg.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {selectedReg.status}
                  </span>
                </div>
              </div>

              {/* Payment Details & Screenshot */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">
                      Submitted UPI Transaction ID (UTR)
                    </span>
                    <span className="text-xl font-mono font-black text-amber-400">
                      {selectedReg.utr_number || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">
                      Amount Paid
                    </span>
                    <span className="text-xl font-mono font-black text-white">
                      ₹{selectedReg.amount || 50}
                    </span>
                  </div>
                </div>

                {/* Uploaded Payment Screenshot Proof */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Uploaded Payment Proof:
                  </span>
                  {selectedReg.payment_screenshot ? (
                    <div className="relative group text-center bg-black/60 p-3 rounded-xl border border-white/10">
                      <img
                        src={selectedReg.payment_screenshot}
                        alt="Payment Receipt Proof"
                        className="max-h-64 mx-auto rounded-lg object-contain cursor-pointer"
                        onClick={() => setZoomedImage(selectedReg.payment_screenshot!)}
                      />
                      <button
                        type="button"
                        onClick={() => setZoomedImage(selectedReg.payment_screenshot!)}
                        className="mt-2 text-xs text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Click to view full resolution image</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl">
                      No screenshot was uploaded.
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason Input (shown for reject or editing) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection Reason (if rejecting payment):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Screenshot blurry, UTR not credited in merchant account, duplicate payment"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* THE THREE ADMIN CONTROLS AS REQUIRED */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. CONFIRM PAYMENT */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteVerification('CONFIRM')}
                  className="py-3 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>CONFIRM PAYMENT</span>
                </button>

                {/* 2. REJECT PAYMENT */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteVerification('REJECT')}
                  className="py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT PAYMENT</span>
                </button>

                {/* 3. KEEP PENDING */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteVerification('PENDING')}
                  className="py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  <span>KEEP PENDING</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox for Proofs */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <img
              src={zoomedImage}
              alt="Payment Proof Full"
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="mt-4 px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
            >
              Close Fullscreen Preview
            </button>
          </div>
        </div>
      )}

      {/* Email Alert Preview Modal */}
      {selectedEmailLog && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-xl bg-[#090e24] border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="bg-[#0b1333] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Dispatched Email Notification Preview</h3>
              </div>
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedEmailLog.recipient_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(selectedEmailLog.sent_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="text-white font-bold">{selectedEmailLog.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400">{selectedEmailLog.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Email Body Content:</span>
                <pre className="p-4 bg-slate-950 rounded-xl border border-white/10 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedEmailLog.content}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedEmailLog(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
