import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { db, verifyPassword, Participant, Payment } from './server/db.ts';
import { triggerNewRegistrationEmailAlert, sendTestEmailAlert } from './server/email.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'quizarena_super_secret_jwt_key_2026';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directories
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded payment screenshots and QR codes
app.use('/uploads', express.static(uploadsDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, JPEG, PNG, WEBP) are allowed!'));
    }
  }
});

// Admin authentication middleware
export interface AuthRequest extends express.Request {
  admin?: {
    email: string;
    role: string;
    id: string;
  };
}

function requireAdminAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string; id: string };
    const admin = db.getAdminByEmail(decoded.email);
    if (!admin) {
      res.status(401).json({ error: 'Unauthorized: Admin not found' });
      return;
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// 1. Get Website Settings
app.get('/api/settings', (_req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// 2. Get Competitions
app.get('/api/competitions', (_req, res) => {
  const competitions = db.getCompetitions();
  res.json({ success: true, competitions });
});

// 3. Check duplicate registration
app.post('/api/registrations/check-duplicate', (req, res) => {
  const { mobile, email, competitionId } = req.body;
  if (!mobile || !email) {
    res.status(400).json({ error: 'Mobile and email are required' });
    return;
  }
  const existing = db.findParticipantByMobileOrEmail(mobile, email, competitionId || 'comp_national_2026');
  if (existing) {
    res.json({
      duplicate: true,
      message: `A registration (${existing.registration_id}) with this mobile number or email already exists for this competition.`
    });
    return;
  }
  res.json({ duplicate: false });
});

// 4. Submit Registration (Step 2 completion)
app.post('/api/registrations', upload.single('paymentScreenshot'), (req, res) => {
  try {
    const settings = db.getSettings();
    if (!settings.registrations_open) {
      res.status(403).json({ error: 'Registrations are currently closed by the administration.' });
      return;
    }

    const {
      fullName,
      mobile,
      email,
      age,
      state,
      city,
      schoolName,
      gender,
      competitionId,
      utrNumber,
      amount
    } = req.body;

    if (!fullName || !mobile || !email || !age || !state || !city || !utrNumber) {
      res.status(400).json({ error: 'Please provide all required participant and payment details.' });
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      res.status(400).json({ error: 'Please enter a valid UPI Transaction ID / UTR number.' });
      return;
    }

    const targetCompId = competitionId || 'comp_national_2026';
    const existing = db.findParticipantByMobileOrEmail(cleanMobile, email, targetCompId);
    if (existing) {
      res.status(409).json({
        error: `A registration (${existing.registration_id}) already exists with this mobile number or email.`
      });
      return;
    }

    // Determine screenshot URL
    let screenshotUrl = '';
    if (req.file) {
      screenshotUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.screenshotBase64) {
      // Support base64 upload fallback
      const base64Data = req.body.screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
      const filename = `screenshot-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      screenshotUrl = `/uploads/${filename}`;
    }

    // Generate unique Registration ID e.g. QAI-2026-78421
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const regId = `QAI-2026-${randomSuffix}`;
    const participantId = `part_${Date.now()}_${randomSuffix}`;
    const paymentId = `pay_${Date.now()}_${randomSuffix}`;
    const now = new Date().toISOString();

    const participant: Participant = {
      id: participantId,
      registration_id: regId,
      full_name: fullName.trim(),
      mobile: cleanMobile,
      email: email.trim().toLowerCase(),
      age: parseInt(age, 10) || 18,
      state: state.trim(),
      city: city.trim(),
      school_name: schoolName ? schoolName.trim() : undefined,
      gender: gender || undefined,
      competition_id: targetCompId,
      status: 'PENDING', // ALWAYS PENDING - manual verification strictly required!
      created_at: now
    };

    const payment: Payment = {
      id: paymentId,
      registration_id: regId,
      amount: parseInt(amount, 10) || settings.registration_fee || 50,
      utr_number: cleanUtr,
      payment_screenshot: screenshotUrl,
      payment_status: 'PENDING', // NEVER mark as verified automatically
      verified_at: null,
      verified_by: null,
      rejection_reason: null
    };

    db.addParticipant(participant);
    db.addPayment(payment);

    // Trigger Email Notification Alert to Admin for Timely Verification
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    triggerNewRegistrationEmailAlert(participant, payment, baseUrl).catch(err => {
      console.error('Email alert trigger error:', err);
    });

    res.status(201).json({
      success: true,
      registration_id: regId,
      participant: {
        registration_id: participant.registration_id,
        full_name: participant.full_name,
        email: participant.email,
        mobile: participant.mobile,
        created_at: participant.created_at,
        status: participant.status
      },
      message: 'Your registration has been submitted successfully! Your payment is currently awaiting verification by the QUIZARENA INDIA administration team.'
    });
  } catch (error: any) {
    console.error('Registration submission error:', error);
    res.status(500).json({ error: error.message || 'Server error processing registration' });
  }
});

// 5. Check Registration Status (Participant lookup)
app.get('/api/registrations/status/:query', (req, res) => {
  const query = req.params.query.trim();
  const participant = db.getParticipantById(query) || 
    db.getParticipants().find(p => p.mobile.replace(/\D/g, '').slice(-10) === query.replace(/\D/g, '').slice(-10));

  if (!participant) {
    res.status(404).json({ error: 'No registration record found matching the provided Registration ID or Mobile Number.' });
    return;
  }

  const payment = db.getPaymentByRegistrationId(participant.registration_id);
  const settings = db.getSettings();

  // Return strictly participant-facing info
  res.json({
    success: true,
    data: {
      registration_id: participant.registration_id,
      full_name: participant.full_name,
      email: participant.email,
      mobile: participant.mobile,
      state: participant.state,
      city: participant.city,
      status: participant.status,
      created_at: participant.created_at,
      payment_amount: payment ? payment.amount : settings.registration_fee,
      payment_status: payment ? payment.payment_status : 'PENDING',
      utr_number: payment ? payment.utr_number : '',
      rejection_reason: payment ? payment.rejection_reason : null,
      verified_at: payment ? payment.verified_at : null
    }
  });
});

/* ==========================================================================
   ADMIN AUTHENTICATION & DASHBOARD APIS (PRIVATE ACCESS)
   ========================================================================== */

// 6. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Admin email and password are required' });
    return;
  }

  const admin = db.getAdminByEmail(email);
  if (!admin) {
    res.status(401).json({ error: 'Invalid administrator credentials' });
    return;
  }

  const isValid = verifyPassword(password, admin.password_hash, admin.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid administrator credentials' });
    return;
  }

  const token = jwt.sign(
    { email: admin.email, role: admin.role, id: admin.id, name: admin.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

// 7. Verify Admin Session
app.get('/api/admin/me', requireAdminAuth, (req: AuthRequest, res) => {
  const admin = db.getAdminByEmail(req.admin!.email);
  if (!admin) {
    res.status(401).json({ error: 'Admin not found' });
    return;
  }
  res.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

// 8. Admin Statistics Overview
app.get('/api/admin/stats', requireAdminAuth, (_req, res) => {
  const stats = db.getStats();
  res.json({ success: true, stats });
});

// 9. Manage Registrations (List with filter, search)
app.get('/api/admin/registrations', requireAdminAuth, (req, res) => {
  const { status, search } = req.query;
  let list = db.getParticipants().map(p => {
    const payment = db.getPaymentByRegistrationId(p.registration_id);
    return {
      ...p,
      amount: payment ? payment.amount : 50,
      utr_number: payment ? payment.utr_number : '',
      payment_screenshot: payment ? payment.payment_screenshot : '',
      payment_status: payment ? payment.payment_status : 'PENDING',
      verified_at: payment ? payment.verified_at : null,
      verified_by: payment ? payment.verified_by : null,
      rejection_reason: payment ? payment.rejection_reason : null
    };
  });

  // Filter by status
  if (status && status !== 'ALL') {
    list = list.filter(item => item.status === status);
  }

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    list = list.filter(item =>
      item.registration_id.toLowerCase().includes(q) ||
      item.full_name.toLowerCase().includes(q) ||
      item.mobile.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.utr_number.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, registrations: list });
});

// 10. Manual Payment Verification (CONFIRM / REJECT / KEEP PENDING)
app.post('/api/admin/registrations/:id/verify', requireAdminAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body;

  if (!['CONFIRM', 'REJECT', 'PENDING'].includes(action)) {
    res.status(400).json({ error: 'Action must be CONFIRM, REJECT, or PENDING' });
    return;
  }

  const result = db.verifyPayment(id, action as any, req.admin!.email, rejectionReason);
  if (!result.success) {
    res.status(404).json({ error: 'Registration or payment record not found' });
    return;
  }

  const updatedStats = db.getStats();
  res.json({
    success: true,
    participant: result.participant,
    payment: result.payment,
    stats: updatedStats,
    message: action === 'CONFIRM' 
      ? 'Payment verified successfully! Participant is now CONFIRMED.'
      : action === 'REJECT'
      ? 'Registration marked as REJECTED with specified reason.'
      : 'Registration status reverted to PENDING.'
  });
});

// 11. Delete Registration
app.delete('/api/admin/registrations/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const success = db.deleteParticipant(id);
  if (!success) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }
  res.json({ success: true, message: 'Registration record removed successfully' });
});

// 12. Export Registrations to CSV
app.get('/api/admin/registrations/export', requireAdminAuth, (_req, res) => {
  const list = db.getParticipants().map(p => {
    const pay = db.getPaymentByRegistrationId(p.registration_id);
    return {
      'Registration ID': p.registration_id,
      'Full Name': `"${p.full_name.replace(/"/g, '""')}"`,
      'Mobile Number': p.mobile,
      'Email': p.email,
      'Age': p.age,
      'State': `"${p.state}"`,
      'City': `"${p.city}"`,
      'School/College': p.school_name ? `"${p.school_name.replace(/"/g, '""')}"` : 'N/A',
      'Gender': p.gender || 'N/A',
      'Registration Status': p.status,
      'UTR Number': pay ? pay.utr_number : '',
      'Amount (INR)': pay ? pay.amount : 50,
      'Payment Status': pay ? pay.payment_status : 'PENDING',
      'Verified At': pay && pay.verified_at ? pay.verified_at : '',
      'Verified By': pay && pay.verified_by ? pay.verified_by : '',
      'Rejection Reason': pay && pay.rejection_reason ? `"${pay.rejection_reason.replace(/"/g, '""')}"` : '',
      'Registration Date': p.created_at
    };
  });

  if (list.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quizarena_registrations.csv"');
    res.send('Registration ID,Full Name,Mobile Number,Email,Age,State,City,School/College,Gender,Registration Status,UTR Number,Amount,Payment Status,Verified At,Verified By,Rejection Reason,Registration Date\n');
    return;
  }

  const headers = Object.keys(list[0]).join(',');
  const rows = list.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="quizarena_registrations_${Date.now()}.csv"`);
  res.send(csv);
});

// 13. Update Website Settings
app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated, message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// 14. Upload New Payment QR Code
app.post('/api/admin/upload-qr', requireAdminAuth, upload.single('qrImage'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No QR image file uploaded' });
    return;
  }

  const qrUrl = `/uploads/${req.file.filename}`;
  db.updateSettings({ payment_qr_image: qrUrl });

  res.json({
    success: true,
    qr_url: qrUrl,
    message: 'Payment QR code updated successfully! New QR is now active on the public registration portal.'
  });
});

// 15. Manage Competitions
app.put('/api/admin/competitions/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const updated = db.updateCompetition(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }
  res.json({ success: true, competition: updated });
});

// 16. Change Admin Password
app.post('/api/admin/change-password', requireAdminAuth, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long' });
    return;
  }

  const admin = db.getAdminByEmail(req.admin!.email);
  if (!admin) {
    res.status(401).json({ error: 'Admin not found' });
    return;
  }

  const isCurrentValid = verifyPassword(currentPassword, admin.password_hash, admin.salt);
  if (!isCurrentValid) {
    res.status(400).json({ error: 'Current password is incorrect' });
    return;
  }

  db.updateAdminPassword(admin.email, newPassword);
  res.json({ success: true, message: 'Password updated successfully' });
});

// 17. Get Email Notification Settings & Logs
app.get('/api/admin/email-settings', requireAdminAuth, (_req, res) => {
  const emailSettings = db.getEmailSettings();
  const logs = db.getEmailLogs();
  res.json({ success: true, emailSettings, logs });
});

// 18. Update Email Notification Settings
app.put('/api/admin/email-settings', requireAdminAuth, (req, res) => {
  try {
    const updated = db.updateEmailSettings(req.body);
    res.json({ success: true, emailSettings: updated, message: 'Email alert settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update email settings' });
  }
});

// 19. Send Test Email Alert
app.post('/api/admin/email-test', requireAdminAuth, async (req, res) => {
  try {
    const { toEmail } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await sendTestEmailAlert(toEmail, baseUrl);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to dispatch test email alert' });
  }
});

// 20. Clear Email Logs
app.delete('/api/admin/email-logs', requireAdminAuth, (_req, res) => {
  db.clearEmailLogs();
  res.json({ success: true, message: 'Email alert logs cleared' });
});

/* ==========================================================================
   FRONTEND INTEGRATION (Vite Middlewares in Dev / Static files in Prod)
   ========================================================================== */

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QUIZARENA INDIA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
