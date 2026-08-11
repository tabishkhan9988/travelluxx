import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle } from "lucide-react";
import { trackClick } from "../utils/analytics";

interface ContactFormProps {
  settings?: any;
}

export default function ContactForm({ settings }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const officeAddress = settings?.office_address || settings?.officeAddress || "Shirley B90 Shirley, Solihull, West Midlands, UK";
  const businessEmail = settings?.business_email || settings?.businessEmail || "info@travelluxx.co.uk";
  const whatsappNum = settings?.whatsapp_number || "441217140876";

  const formattedPhone = whatsappNum.startsWith("44") 
    ? `+44 ${whatsappNum.substring(2, 6)} ${whatsappNum.substring(6)}` 
    : whatsappNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message })
      });

      if (res.ok) {
        trackClick("contact_submit");
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        alert("Submission failed. Please check inputs.");
      }
    } catch (err) {
      alert("Submission failed due to connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white border-t border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/35 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Block: Contact coordinates */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-emerald-700 font-sans text-xs tracking-widest uppercase block font-semibold">Get In Touch</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Connect With Our Dispatch Office
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Have custom itinerary requests, multiple-day travel arrangements, or corporate accounts inquiry? Drop us a line or connect instantly on WhatsApp. Our dispatch operators are active 24/7.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block tracking-wider">Office Address</span>
                  <span className="text-sm text-slate-600 mt-1 block leading-relaxed font-medium">
                    {officeAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block tracking-wider">Email Dispatch</span>
                  <a href={`mailto:${businessEmail}`} className="text-sm text-emerald-700 mt-1 block hover:underline font-semibold">
                    {businessEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block tracking-wider">WhatsApp & Telephone Hotline</span>
                  <a href={`tel:${whatsappNum}`} className="text-sm text-slate-700 font-sans font-bold mt-1 block hover:text-emerald-700 transition">
                    {formattedPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: General Inquiry submit card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm">
            
            {success ? (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900">Message Dispatched Successfully</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  We have received your general inquiry! A Travelluxx operator will email or text back under 15 minutes.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs rounded-xl text-slate-600 font-semibold transition cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900 mb-4 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-emerald-700" />
                  <span>Submit Customized Inquiry</span>
                </h3>

                <div>
                  <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Richard Sterling"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 transition placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. sterling@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 transition placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0121 714 0876"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-2">Message Description</label>
                  <textarea
                    rows={4}
                    placeholder="Specify dates, route points, passenger details, or custom chauffeur demands..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 px-4 text-xs text-slate-800 transition placeholder:text-slate-400 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/10 flex justify-center items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Inquiry Sheet</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
