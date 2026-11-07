import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Upload,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  ZoomIn
} from 'lucide-react';
import { WebsiteSettings, Competition, INDIAN_STATES } from '../types';
import { api } from '../services/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WebsiteSettings;
  competition: Competition | undefined;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  settings,
  competition,
  onOpenTerms,
  onOpenPrivacy
}) => {
  // Step: 1 = Details, 2 = Payment QR, 3 = Submitted (Pending)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gender, setGender] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Payment State
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [paymentConfirmedCheckbox, setPaymentConfirmedCheckbox] = useState(false);

  // Submission / Status state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    registration_id: string;
    full_name: string;
    email: string;
    mobile: string;
    created_at: string;
    status: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);

  const fee = competition?.registration_fee || settings.registration_fee || 50;

  // Reset modal when opened fresh
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP 1 VALIDATION & ADVANCE
  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 8 || ageNum > 80) {
      setErrorMessage('Please enter a valid age between 8 and 80.');
      return;
    }

    if (!state) {
      setErrorMessage('Please select your state or union territory.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your city.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    // Check duplicate registrations
    try {
      setLoading(true);
      const dupCheck = await api.checkDuplicate(cleanMobile, email, competition?.id || 'comp_national_2026');
      if (dupCheck.duplicate) {
        setErrorMessage(dupCheck.message || 'A registration already exists with this mobile number or email.');
        setLoading(false);
        return;
      }
      setLoading(false);
      setStep(2);
    } catch (err: any) {
      setLoading(false);
      // If offline or check fails, allow proceeding with backend final validation
      setStep(2);
    }
  };

  // HANDLE SCREENSHOT SELECT
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image file (JPG, JPEG, or PNG).');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 2 SUBMIT REGISTRATION
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!utrNumber.trim()) {
      setErrorMessage('Please enter the 12-digit UPI Transaction ID / UTR number.');
      return;
    }

    if (utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid UPI Transaction ID / UTR number.');
      return;
    }

    if (!screenshotFile && !screenshotPreview) {
      setErrorMessage('Please upload your payment screenshot proof.');
      return;
    }

    if (!paymentConfirmedCheckbox) {
      setErrorMessage('Please check the confirmation box verifying that you have completed the UPI payment.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('mobile', mobile.replace(/\D/g, '').slice(-10));
      formData.append('email', email.trim());
      formData.append('age', age);
      formData.append('state', state);
      formData.append('city', city.trim());
      if (schoolName.trim()) formData.append('schoolName', schoolName.trim());
      if (gender) formData.append('gender', gender);
      formData.append('competitionId', competition?.id || 'comp_national_2026');
      formData.append('utrNumber', utrNumber.trim());
      formData.append('amount', String(fee));

      if (screenshotFile) {
        formData.append('paymentScreenshot', screenshotFile);
      } else if (screenshotPreview) {
        formData.append('screenshotBase64', screenshotPreview);
      }

      const res = await api.submitRegistration(formData);
      setSubmittedData({
        registration_id: res.registration_id,
        full_name: fullName.trim(),
        email: email.trim(),
        mobile: mobile.replace(/\D/g, '').slice(-10),
        created_at: new Date().toISOString(),
        status: 'PENDING'
      });
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#090e24] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0b1333] via-[#101a42] to-[#0b1333] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                QUIZARENA INDIA REGISTRATION
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 && 'Step 1 of 2: Participant Information'}
                {step === 2 && 'Step 2 of 2: UPI Payment & Verification'}
                {step === 3 && 'Registration Submitted (Pending Manual Verification)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="bg-[#060a1c] px-6 py-3 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <span className={step >= 1 ? 'text-white font-bold' : 'text-slate-400'}>Participant Details</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={step >= 2 ? 'text-white font-bold' : 'text-slate-400'}>Pay ₹{fee} & UTR</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-amber-400 font-bold' : 'text-slate-400'}>Pending Verification</span>
          </div>
        </div>

        {/* Error message callout */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: PARTICIPANT DETAILS ================= */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arnav Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile Number *</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-amber-400/90 border-r border-slate-700 pr-2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Admit pass & exam link will be sent to this number.</p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. participant@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Age *</span>
                </label>
                <input
                  type="number"
                  required
                  min={8}
                  max={80}
                  placeholder="e.g. 19"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Gender (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>State / UT *</span>
                </label>
                <select
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>City *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow, Pune, Indore"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* School / College (Optional) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>School / College / Institution Name (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Public School / IIT Delhi / Freelancer"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Checkbox for accepting Terms & Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                  >
                    Privacy Policy
                  </button>
                  . I understand that QuizArena India is a skill-based competition and registration fees are non-refundable.
                </span>
              </label>
            </div>

            {/* Bottom: Next Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Fee payable at Step 2: <strong className="text-amber-400">₹{fee}</strong>
              </span>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'NEXT'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: PAYMENT INSTRUCTIONS & QR CODE ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmitRegistration} className="p-6 space-y-6">
            {/* Registration Fee Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                  Registration Fee
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹{fee}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 font-semibold block">{fullName}</span>
                <span className="text-[11px] text-slate-400 font-mono">+91 {mobile}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="text-center py-2">
              <h4 className="text-sm sm:text-base font-extrabold text-white mb-3">
                Scan the QR Code Below to Pay
              </h4>

              {/* THE ADMIN-UPLOADED PAYMENT QR CODE IMAGE */}
              <div className="relative inline-block mx-auto p-4 bg-black rounded-2xl border-2 border-amber-400 shadow-xl shadow-amber-500/20">
                <img
                  src={settings.payment_qr_image || '/assets/aistudio/qr_code_cropped.png'}
                  alt="Official QUIZARENA INDIA Payment QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl mx-auto cursor-pointer"
                  onClick={() => setQrZoomOpen(true)}
                  onError={(e) => {
                    // Fallback to default cropped QR
                    (e.target as HTMLImageElement).src = '/assets/aistudio/qr_code_cropped.png';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQrZoomOpen(true)}
                  className="absolute bottom-2 right-2 bg-slate-900/80 text-amber-400 p-1.5 rounded-lg border border-white/10 hover:bg-slate-800 text-xs flex items-center gap-1"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Zoom</span>
                </button>
              </div>

              {/* IMMEDIATELY BELOW THE QR CODE IMAGE: EXACT TEXT REQUIRED */}
              <div className="mt-3">
                <div className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg tracking-wide shadow-lg shadow-amber-500/25 animate-pulse">
                  Pay {fee} rupees here ☝️
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Accepted: PhonePe • Google Pay • Paytm • BHIM • Cred • Any Banking UPI
              </p>
            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
                Payment Instructions:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Open your UPI App (PhonePe, GPay, Paytm, etc.).</li>
                <li>Scan the QR code above and transfer exact <strong>₹{fee}</strong>.</li>
                <li>After payment, copy the <strong>12-digit UPI Transaction ID / UTR number</strong>.</li>
                <li>Take a clear screenshot of the completed payment receipt and upload it below.</li>
              </ol>
            </div>

            {/* Field: UTR Number */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>UPI Transaction ID / UTR Number *</span>
                <span className="text-[10px] text-amber-400 font-normal">12-digit number found on receipt</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 431289567812 or UPI Ref No"
                value={uttrCleaner(utrNumber)}
                onChange={e => setUtrNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Upload Payment Screenshot */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Upload Payment Screenshot as Proof *</span>
                <span className="text-[10px] text-slate-400">JPG, JPEG, PNG (Max 10MB)</span>
              </label>

              <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 text-center bg-slate-900/50 transition-all">
                <input
                  type="file"
                  id="paymentScreenshotInput"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />

                {screenshotPreview ? (
                  <div className="space-y-3">
                    <img
                      src={screenshotPreview}
                      alt="Uploaded Screenshot Proof"
                      className="max-h-48 mx-auto rounded-lg border border-white/10 shadow-md"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Proof Attached
                      </span>
                      <label
                        htmlFor="paymentScreenshotInput"
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        Change Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="paymentScreenshotInput"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Click to Browse or Upload Payment Receipt
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Screenshot showing ₹{fee} debited and UTR number
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Checkbox confirming payment */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={paymentConfirmedCheckbox}
                  onChange={e => setPaymentConfirmedCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>
                  I confirm that I have made the payment of <strong>₹{fee}</strong> via UPI to QUIZARENA INDIA and the UTR / Transaction ID provided above is genuine.
                </span>
              </label>
            </div>

            {/* Action Buttons: Back + SUBMIT REGISTRATION */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <span>{loading ? 'Submitting Registration...' : 'SUBMIT REGISTRATION'}</span>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: REGISTRATION SUBMITTED – PENDING VERIFICATION ================= */}
        {step === 3 && submittedData && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Pending Verification Notice */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Your registration has been submitted successfully!
              </h3>
              <p className="text-sm font-semibold text-amber-300/90 max-w-lg mx-auto">
                Your payment is currently awaiting verification by the QUIZARENA INDIA administration team.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your participation will be confirmed only after successful payment verification.
              </p>
            </div>

            {/* Registration Details Card */}
            <div className="max-w-md mx-auto bg-slate-950/80 rounded-2xl p-5 border border-amber-500/20 text-left space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Registration ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-mono font-black text-amber-400">
                    {submittedData.registration_id}
                  </span>
                  <button
                    onClick={() => handleCopyId(submittedData.registration_id)}
                    className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                    title="Copy Registration ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Participant Name:</span>
                <span className="text-white font-bold">{submittedData.full_name}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Registered Mobile:</span>
                <span className="text-white font-mono">+91 {submittedData.mobile}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Submission Date:</span>
                <span className="text-white font-mono">
                  {new Date(submittedData.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-slate-400">Payment Status:</span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
                  PENDING
                </span>
              </div>
            </div>

            {/* Note to Save ID */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 max-w-md mx-auto">
              <strong className="text-amber-400 block mb-1">📌 Please Save Your Registration ID:</strong>
              Take a screenshot of this screen. You can check your verification status anytime using the "Check Status" button on the website.
            </div>

            {/* Done Button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all text-sm cursor-pointer"
              >
                Close & Save Confirmation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Fullscreen Lightbox Modal */}
      {qrZoomOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setQrZoomOpen(false)}
        >
          <div className="relative max-w-sm w-full bg-black p-6 rounded-3xl border-2 border-amber-400 text-center space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              QUIZARENA INDIA Payment QR
            </h4>
            <img
              src={settings.payment_qr_image || '/assets/aistudio/qr_code_cropped.png'}
              alt="Enlarged QR Code"
              className="w-full max-h-80 object-contain mx-auto rounded-xl"
            />
            <div className="text-base font-black text-amber-400">
              Pay {fee} rupees here ☝️
            </div>
            <button
              onClick={() => setQrZoomOpen(false)}
              className="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function uttrCleaner(str: string): string {
  return str.trim();
}
