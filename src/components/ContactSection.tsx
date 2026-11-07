import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, Headphones } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface ContactSectionProps {
  settings: WebsiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-[#050814] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 PARTICIPANT HELPLINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Need Help with <span className="gold-gradient-text">Registration?</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Our participant support desk is available to assist you with payment verification, questions, or admit pass queries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Official Support Email</h4>
                <p className="text-xs text-slate-400 mt-0.5">Average reply time under 2 hours</p>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-sm font-semibold text-amber-400 hover:underline mt-2 inline-block"
                >
                  {settings.contact_email}
                </a>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp Participant Desk</h4>
                <p className="text-xs text-slate-400 mt-0.5">Instant chat assistance & UTR verification help</p>
                <a
                  href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-400 hover:underline mt-2 inline-block"
                >
                  Chat on WhatsApp ({settings.contact_whatsapp})
                </a>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Telephone Helpline</h4>
                <p className="text-xs text-slate-400 mt-0.5">Monday to Saturday: 9:00 AM – 8:00 PM IST</p>
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="text-sm font-semibold text-blue-400 hover:underline mt-2 inline-block"
                >
                  {settings.contact_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Send Us a Quick Message</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Have an inquiry about school delegations, bulk participant registration, or exam guidelines?
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Message Received!</h4>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. Our support coordinator will connect with you via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">How can we assist you?</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter your query or UTR verification concern here..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
