import express from "express";
import path from "path";
import fs from "fs";

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createMollieClient } from "@mollie/api-client";

dotenv.config();

const BOOKINGS_PATH = path.join(process.cwd(), "bookings.json");
const SETTINGS_PATH = path.join(process.cwd(), "settings.json");
const PRICING_PATH = path.join(process.cwd(), "pricing.json");
const SMTP_PATH = path.join(process.cwd(), "smtp.json");
const POSTS_PATH = path.join(process.cwd(), "posts.json");
const ADMINS_PATH = path.join(process.cwd(), "admins.json");
const PAGES_PATH = path.join(process.cwd(), "pages.json");

import mongoose from "mongoose";

// --- MONGODB CONNECTION & SCHEMAS ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/travelluxx";

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  passengerName: String,
  passengerEmail: String,
  passengerPhone: String,
  pickup: String,
  dropoff: String,
  date: String,
  time: String,
  distance: String,
  vehicle: String,
  price: Number,
  status: { type: String, default: "Pending" },
  paymentMethod: String,
  paymentStatus: { type: String, default: "Unpaid" },
  flightNumber: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  image: String,
  author: { type: String, default: "Travelluxx Editorial" },
  date: String,
  published: { type: Number, default: 1 },
  metaTitle: String,
  metaDescription: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const PostModel = mongoose.models.Post || mongoose.model("Post", PostSchema);

const PageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  slug: { type: String, required: true, unique: true },
  content: String,
  metaTitle: String,
  metaDescription: String,
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false });

const PageModel = mongoose.models.Page || mongoose.model("Page", PageSchema);

// Connect to MongoDB
// Connect to MongoDB
let isConnected = false;

async function runMigrations() {
  // Migrate existing bookings.json into MongoDB if empty
  try {
    const count = await BookingModel.countDocuments();
    if (count === 0 && fs.existsSync(BOOKINGS_PATH)) {
      console.log("📥 Migrating bookings.json into MongoDB...");
      const jsonBookings = JSON.parse(fs.readFileSync(BOOKINGS_PATH, "utf8"));
      await BookingModel.insertMany(jsonBookings, { ordered: false }).catch(() => {});
      console.log("✅ MongoDB populated with all historic bookings!");
    }
  } catch (err: any) {
    console.error("Error migrating bookings to MongoDB:", err.message);
  }

  // Migrate existing posts.json into MongoDB if empty
  try {
    const count = await PostModel.countDocuments();
    if (count === 0 && fs.existsSync(POSTS_PATH)) {
      console.log("📥 Migrating posts.json into MongoDB...");
      const jsonPosts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
      await PostModel.insertMany(jsonPosts, { ordered: false }).catch(() => {});
      console.log("✅ MongoDB populated with all posts!");
    }
  } catch (err: any) {
    console.error("Error migrating posts to MongoDB:", err.message);
  }

  // Migrate existing pages.json into MongoDB if empty
  try {
    const count = await PageModel.countDocuments();
    if (count === 0 && fs.existsSync(PAGES_PATH)) {
      console.log("📥 Migrating pages.json into MongoDB...");
      const jsonPages = JSON.parse(fs.readFileSync(PAGES_PATH, "utf8"));
      await PageModel.insertMany(jsonPages, { ordered: false }).catch(() => {});
      console.log("✅ MongoDB populated with all pages!");
    }
  } catch (err: any) {
    console.error("Error migrating pages to MongoDB:", err.message);
  }
}

async function connectToDatabase() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const isVercelLocalFallback = process.env.VERCEL && MONGODB_URI.includes("localhost");
  if (isVercelLocalFallback) {
    console.log("⚠️ Skipping MongoDB connection (local fallback on Vercel).");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully!");
    await runMigrations();
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}



function readPages(): any[] {
  try {
    if (fs.existsSync(PAGES_PATH)) {
      return JSON.parse(fs.readFileSync(PAGES_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading pages.json:", err);
  }
  return [];
}

function writePages(pages: any[]) {
  try {
    fs.writeFileSync(PAGES_PATH, JSON.stringify(pages, null, 2));
  } catch (err) {
    console.error("Error writing pages.json:", err);
  }
}



function readPosts(): any[] {
  try {
    if (fs.existsSync(POSTS_PATH)) {
      return JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading posts.json:", err);
  }
  return [];
}

function writePosts(posts: any[]) {
  try {
    fs.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error("Error writing posts.json:", err);
  }
}


function readBookings(): any[] {
  try {
    if (fs.existsSync(BOOKINGS_PATH)) {
      return JSON.parse(fs.readFileSync(BOOKINGS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading bookings.json:", err);
  }
  return [];
}

function writeBookings(bookings: any[]) {
  try {
    fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Error writing bookings.json:", err);
  }
}

function getCurrentWebsiteSettings() {
  const defaultSettings = {
    business_name: "Travelluxx",
    business_email: "info@travelluxx.co.uk",
    whatsapp_number: "441217140876",
    office_address: "Shirley B90 Shirley, Solihull, West Midlands, UK",
    economy_price: 1.50,
    luxury_price: 2.00,
    family_price: 2.50,
    minimum_distance: 10.00,
    hero_image: "",
    logo_image: "",
    footer_info: "© 2026 Travelluxx. All rights reserved."
  };
  try {
    const webSettingsPath = path.join(process.cwd(), "website_settings.json");
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
      return { ...defaultSettings, ...data };
    } else if (fs.existsSync(webSettingsPath)) {
      const data = JSON.parse(fs.readFileSync(webSettingsPath, "utf8"));
      return { ...defaultSettings, ...data };
    }
  } catch (err) {}
  return defaultSettings;
}

function getCurrentPricingSettings() {
  const defaultPricing = {
    economy_price_per_mile: 1.50,
    luxury_price_per_mile: 2.00,
    family_price_per_mile: 2.50,
    minimum_billable_distance: 10.00,
    extra_stop_charge: 10.00,
    break_time_charge: 0.50
  };
  try {
    if (fs.existsSync(PRICING_PATH)) {
      const data = JSON.parse(fs.readFileSync(PRICING_PATH, "utf8"));
      return { ...defaultPricing, ...data };
    }
  } catch (err) {}
  return defaultPricing;
}

function readSmtpSettings(): any {
  let saved: any = {};
  try {
    if (fs.existsSync(SMTP_PATH)) {
      saved = JSON.parse(fs.readFileSync(SMTP_PATH, "utf8"));
    } else {
      const ws = getCurrentWebsiteSettings() as any;
      if (ws.smtp_host || ws.smtp_user || ws.smtpUser) {
        saved = {
          smtpHost: ws.smtp_host || ws.smtpHost,
          smtpPort: ws.smtp_port || ws.smtpPort,
          smtpUser: ws.smtp_user || ws.smtpUser,
          smtpPass: ws.smtp_pass || ws.smtpPass,
          smtpSecure: ws.smtp_secure !== undefined ? ws.smtp_secure : ws.smtpSecure,
          senderAddress: ws.business_email || ws.smtp_user || ws.smtpUser
        };
      }
    }
  } catch (err) {}

  const ws = getCurrentWebsiteSettings() as any;
  return {
    smtpHost: saved.smtpHost || process.env.SMTP_HOST || "mail.travelluxx.co.uk",
    smtpPort: saved.smtpPort || process.env.SMTP_PORT || "465",
    smtpUser: saved.smtpUser || process.env.SMTP_USER || ws.business_email || "info@travelluxx.co.uk",
    smtpPass: saved.smtpPass || process.env.SMTP_PASS || "sdjnefvpasotcja",
    smtpSecure: saved.smtpSecure !== undefined ? saved.smtpSecure : (process.env.SMTP_SECURE !== "false"),
    senderAddress: saved.senderAddress || saved.smtpUser || process.env.SMTP_USER || ws.business_email || "info@travelluxx.co.uk"
  };
}

function getMollieClient() {
  const settings = getCurrentWebsiteSettings() as any;
  const apiKey = process.env.MOLLIE_API_KEY || settings?.mollie_api_key;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return createMollieClient({ apiKey: apiKey.trim() });
}

function createTransporter() {
  const settings = readSmtpSettings();
  const port = parseInt(String(settings.smtpPort || "465"), 10);
  const secure = settings.smtpSecure !== false && (port === 465 || settings.smtpSecure === true);

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: port,
    secure: secure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

async function sendEmailSafely(mailOptions: nodemailer.SendMailOptions) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Failed to send email safely:", error);
    return { success: false, error: error?.message || String(error) };
  }
}

async function sendWhatsAppNotification(booking: any) {
  const ws = getCurrentWebsiteSettings();
  const token = process.env.WHATSAPP_TOKEN || "tJghe6OE6w1V8YclFG4onsIQgAUgx1QlZ6SIydFjoJBUw11l1PJKfOwwyoMu29Ff";
  
  const messageBody = `🚗 *Booking Confirmed - ${ws.business_name}*
Ref: ${booking.id}
Passenger: ${booking.passengerName}
Date/Time: ${booking.date} at ${booking.time}
Pickup: ${booking.pickup}
Dropoff: ${booking.dropoff}
Distance: ${Number(booking.distance || 0).toFixed(1)} miles
Vehicle: ${booking.vehicle} Class
Total: £${Number(booking.price).toFixed(2)}
Payment: ${booking.paymentMethod} (${booking.paymentStatus})

Thank you for choosing ${ws.business_name}!`;

  const phoneNumbers = [booking.passengerPhone, ws.whatsapp_number].filter(Boolean);

  for (const phone of phoneNumbers) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) continue;

    try {
      console.log(`Sending WhatsApp message to ${cleanPhone} with token prefix ${token.substring(0, 6)}...`);
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID";
      if (phoneNumberId && phoneNumberId !== "YOUR_PHONE_NUMBER_ID") {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: { body: messageBody }
          })
        });
        const resData = await response.json();
        console.log("WhatsApp API response for", cleanPhone, resData);
      } else {
        console.log("WhatsApp notification simulated successfully for", cleanPhone);
      }
    } catch (err) {
      console.error("WhatsApp notification error for", phone, err);
    }
  }
}

async function sendBookingEmails(booking: any) {
  const ws = getCurrentWebsiteSettings();
  const brandGreen = "#047857";
  const bgSlate = "#f8fafc";
  const borderSlate = "#e2e8f0";
  const textDark = "#0f172a";
  const textMuted = "#64748b";

  const hasStops = Array.isArray(booking.stops) && booking.stops.length > 0;
  const hasWaiting = Number(booking.waitingTime || 0) > 0;
  const paymentDisplay = booking.paymentMethod === "Pay Later"
    ? "Pay Later"
    : `${booking.paymentMethod} <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;">Paid</span>`;

  let stopsListHtml = "";
  if (hasStops) {
    stopsListHtml = booking.stops.map((s: any, i: number) => 
      `<li style="margin-bottom: 4px;"><span style="color: ${textMuted}; font-size: 11px;">Stop ${i+1}:</span> ${s.address} ${Number(s.waiting) > 0 ? `(Wait: ${s.waiting}m)` : ''}</li>`
    ).join("");
  }

  const detailsTableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Booking Reference</td><td style="padding: 10px 0; font-weight: 700; text-align: right; color: ${brandGreen}; font-family: monospace;">${booking.id}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Passenger Name</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.passengerName}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Email</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.passengerEmail}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Phone Number</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.passengerPhone}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Date &amp; Time</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.date} at ${booking.time}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Pickup Address</td><td style="padding: 10px 0; font-weight: 600; text-align: right; font-size: 13px;">${booking.pickup || "N/A"}</td></tr>
      ${hasStops ? `<tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Intermediate Stops</td><td style="padding: 10px 0; font-weight: 600; text-align: right; font-size: 13px;"><ul style="list-style: none; padding: 0; margin: 0;">${stopsListHtml}</ul></td></tr>` : ""}
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Dropoff Address</td><td style="padding: 10px 0; font-weight: 600; text-align: right; font-size: 13px;">${booking.dropoff || "N/A"}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Total Distance</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${Number(booking.distance || 0) > 0 ? Number(booking.distance).toFixed(1) + ' miles' : 'N/A'}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Vehicle Class</td><td style="padding: 10px 0; color: ${brandGreen}; font-weight: 700; text-align: right;">${booking.vehicle} Class</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Passengers / Bags</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.passengers || 1} Passengers, ${booking.luggage || 0} Bags</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Flight Number</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.flightNumber || "N/A"}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Distance Fare</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">£${Number(booking.distanceFare || booking.price).toFixed(2)}</td></tr>
      ${hasWaiting ? `
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Time</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.waitingTime} Minutes</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Charge Percentage</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${(booking.waitingPercent ? booking.waitingPercent * 100 : 0)}%</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Charge Amount</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">£${Number(booking.waitingChargeAmount || 0).toFixed(2)}</td></tr>
      ` : ""}
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Total Price</td><td style="padding: 10px 0; color: ${brandGreen}; font-weight: 800; text-align: right; font-size: 18px;">£${Number(booking.price).toFixed(2)}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Payment</td><td style="padding: 10px 0; font-weight: 700; text-align: right;">${paymentDisplay}</td></tr>
    </table>
  `;


  const commonEmailHtml = (title: string, subtitle: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${bgSlate}; padding: 40px 20px; color: ${textDark}; line-height: 1.6; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid ${borderSlate};">
      <div style="background-color: ${brandGreen}; border-radius: 12px 12px 0 0; padding: 30px; text-align: center; margin: -40px -20px 30px -20px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">${ws.business_name.toUpperCase()}</h1>
        <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">Private Hire • Airport Transfers</p>
      </div>
      <div style="padding: 0 10px;">
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: ${textDark};">${title}</h2>
        <p style="color: ${textMuted}; font-size: 14px; margin-bottom: 25px;">
          ${subtitle}
        </p>
        <div style="background: #ecfdf5; border-left: 4px solid ${brandGreen}; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${brandGreen}; font-weight: 700; display: block; margin-bottom: 4px;">Booking Reference</span>
          <strong style="font-size: 18px; color: ${brandGreen}; font-family: monospace;">${booking.id}</strong>
        </div>
        ${detailsTableHtml}
        <p style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #475569; text-align: center;">
          Need to make changes? Call us on <strong style="color: ${textDark};">${ws.whatsapp_number}</strong>.
        </p>
      </div>
    </div>
  `;

  const passengerHtml = commonEmailHtml(
    "Booking Confirmed!",
    `Hi <strong>${booking.passengerName}</strong>,<br>Your premium private hire booking is registered successfully. Please find your complete travel and fare breakdown details below:`
  );

  const operatorHtml = commonEmailHtml(
    "[NEW BOOKING RECEIVED]",
    `New booking registered by <strong>${booking.passengerName}</strong> (${booking.passengerPhone}). Complete details below:`
  );

  const smtpSettings = readSmtpSettings();
  const fromAddress = `"${ws.business_name}" <${smtpSettings.senderAddress || smtpSettings.smtpUser || ws.business_email}>`;
  const passengerEmail = booking.passengerEmail || booking.email;

  if (passengerEmail) {
    await sendEmailSafely({
      from: fromAddress,
      to: passengerEmail,
      replyTo: ws.business_email,
      subject: `Booking Confirmed: Ref ${booking.id} - ${ws.business_name}`,
      html: passengerHtml,
    });
  } else {
    console.warn("No passenger email provided for booking", booking.id);
  }

  if (ws.business_email) {
    await sendEmailSafely({
      from: fromAddress,
      to: ws.business_email,
      replyTo: passengerEmail || ws.business_email,
      subject: `[New Booking] Ref ${booking.id} - ${booking.passengerName || "Passenger"} (${booking.vehicle || "Vehicle"})`,
      html: operatorHtml,
    });
  }
}

async function sendContactEmails(inquiry: any) {
  const ws = getCurrentWebsiteSettings();
  const smtpSettings = readSmtpSettings();
  const fromAddress = `"${ws.business_name}" <${smtpSettings.senderAddress || smtpSettings.smtpUser || ws.business_email}>`;

  const customerHtml = `
    <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px;">
      <h2>Inquiry Received</h2>
      <p>Hi ${inquiry.name}, we have received your message and will get back to you under 15 minutes.</p>
      <p><em>"${inquiry.message}"</em></p>
    </div>
  `;
  const operatorHtml = `
    <div style="font-family: sans-serif; background: #0f172a; color: #fff; padding: 20px; border-radius: 12px;">
      <h2>[NEW CONTACT INQUIRY]</h2>
      <p><strong>Name:</strong> ${inquiry.name} (${inquiry.email}, ${inquiry.phone})</p>
      <p><strong>Type:</strong> ${inquiry.type}</p>
      <p><strong>Message:</strong> ${inquiry.message}</p>
    </div>
  `;

  if (inquiry.email) {
    await sendEmailSafely({
      from: fromAddress,
      to: inquiry.email,
      replyTo: ws.business_email,
      subject: `We have received your inquiry - ${ws.business_name}`,
      html: customerHtml,
    });
  }

  if (ws.business_email) {
    await sendEmailSafely({
      from: fromAddress,
      to: ws.business_email,
      replyTo: inquiry.email || ws.business_email,
      subject: `[New Inquiry] ${inquiry.name} - ${inquiry.type}`,
      html: operatorHtml,
    });
  }
}

const UK_LOCATIONS: { [key: string]: { lat: number; lng: number; name: string } } = {
  "shirley": { lat: 52.4140, lng: -1.8150, name: "Shirley, Solihull B90" },
  "solihull": { lat: 52.4135, lng: -1.7780, name: "Solihull, West Midlands" },
  "birmingham": { lat: 52.4862, lng: -1.8904, name: "Birmingham, West Midlands" },
  "bhx": { lat: 52.4539, lng: -1.7481, name: "Birmingham Airport (BHX)" },
  "lhr": { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
  "lgw": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
  "man": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" }
};

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function generateFallbackRoutePoints(lat1: number, lng1: number, lat2: number, lng2: number, stepsCount = 10) {
  const points = [];
  const pLat = -(lng2 - lng1);
  const pLng = (lat2 - lat1);
  const len = Math.sqrt(pLat * pLat + pLng * pLng);
  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    const midLat = lat1 + (lat2 - lat1) * ratio;
    const midLng = lng1 + (lng2 - lng1) * ratio;
    if (len > 0) {
      const wiggle = Math.sin(ratio * Math.PI) * len * 0.12;
      points.push({ lat: midLat + (pLat/len)*wiggle, lng: midLng + (pLng/len)*wiggle });
    } else {
      points.push({ lat: midLat, lng: midLng });
    }
  }
  return points;
}

const app = express();
const PORT = 3000;

// www ko non-www par 301 redirect karo (yeh sabse pehle chalna chahiye)
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host.toLowerCase().startsWith("www.")) {
    const newHost = host.slice(4);
    return res.redirect(301, `https://${newHost}${req.originalUrl}`);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// API Endpoints
app.post("/api/distance", async (req, res) => {
  const { pickup, dropoff, pickupCoords, dropoffCoords, stops, precalculated } = req.body;
  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "Pickup and Dropoff locations are required." });
  }

  const pricing = getCurrentPricingSettings();
  let pCoords = pickupCoords ? { lat: Number(pickupCoords.lat), lng: Number(pickupCoords.lng), name: pickup } : UK_LOCATIONS.shirley;
  let dCoords = dropoffCoords ? { lat: Number(dropoffCoords.lat), lng: Number(dropoffCoords.lng), name: dropoff } : UK_LOCATIONS.bhx;

  let distance = precalculated?.distanceMiles ? Number(precalculated.distanceMiles) : (getHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng) * 1.25);
  if (isNaN(distance) || distance < 1) distance = 15.0;
  let duration = precalculated?.timeMinutes ? Math.round(Number(precalculated.timeMinutes)) : Math.round((distance / 45) * 60);

  const effectiveDist = Math.max(distance, pricing.minimum_billable_distance);
  const stopCount = Array.isArray(stops) ? stops.length : 0;
  const stopFee = stopCount * (pricing.extra_stop_charge || 10.00);

  let totalWaitingMins = 0;
  if (Array.isArray(stops)) {
    stops.forEach((s: any) => {
      totalWaitingMins += Number(s.waiting || 0);
    });
  }
  const waitingChargeAmount = totalWaitingMins * (pricing.break_time_charge || 0.50);

  const prices = {
    Economy: Number((effectiveDist * pricing.economy_price_per_mile + stopFee + waitingChargeAmount).toFixed(2)),
    Luxury: Number((effectiveDist * pricing.luxury_price_per_mile + stopFee + waitingChargeAmount).toFixed(2)),
    Family: Number((effectiveDist * pricing.family_price_per_mile + stopFee + waitingChargeAmount).toFixed(2))
  };

  const routePoints = precalculated?.routePoints && precalculated.routePoints.length > 0
    ? precalculated.routePoints
    : generateFallbackRoutePoints(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);

  return res.json({
    distance: Number(distance.toFixed(1)),
    duration,
    prices,
    routePoints,
    pickupCoords: pCoords,
    dropoffCoords: dCoords,
    waitingTime: totalWaitingMins,
    waitingChargeAmount: Number(waitingChargeAmount.toFixed(2))
  });
});

app.post("/api/bookings", async (req, res) => {
  try {
    await connectToDatabase();
    const data = req.body;
    const bookingId = `WLC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      ...data,
      createdAt: new Date().toISOString()
    };

    // Save to local JSON as fallback
    const bookings = readBookings();
    bookings.unshift(newBooking);
    writeBookings(bookings);

    // Save to MongoDB
    try {
      const dbBooking = new BookingModel(newBooking);
      await dbBooking.save();
      console.log("💾 Saved booking to MongoDB!");
    } catch (dbErr: any) {
      console.error("MongoDB Insert error:", dbErr.message);
    }

    sendBookingEmails(newBooking).catch(err => console.error("Booking email error:", err));
    sendWhatsAppNotification(newBooking).catch(err => console.error("WhatsApp notification error:", err));

    return res.json({ success: true, booking: newBooking });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create booking" });
  }
});

// --- ADMIN & BLOG API ENDPOINTS ---

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const envEmail = (process.env.ADMIN_EMAIL || "info@travelluxx.co.uk").toLowerCase().trim();
  const envPassword = process.env.ADMIN_PASSWORD || "Travelluxx2026@";

  const inputUser = (username || "").toLowerCase().trim();
  if ((inputUser === envEmail || inputUser === "admin") && password === envPassword) {
    return res.json({ success: true, token: "admin-auth-token-travelluxx-2026" });
  }
  return res.status(401).json({ success: false, error: "Invalid username or password" });
});


// Admin Bookings / Leads CRUD
app.get("/api/admin/bookings", async (req, res) => {
  try {
    await connectToDatabase();
    const rows = await BookingModel.find().sort({ createdAt: -1 });
    if (rows && rows.length > 0) {
      return res.json(rows);
    }
  } catch (e: any) {
    console.error("Error reading from MongoDB bookings:", e.message);
  }
  const bookings = readBookings();
  return res.json(bookings);
});

app.put("/api/admin/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  
  try {
    await connectToDatabase();
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    await BookingModel.findOneAndUpdate({ id }, { $set: updateData });
  } catch (e: any) {
    console.error("Error updating MongoDB booking:", e.message);
  }

  const bookings = readBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    if (status) bookings[index].status = status;
    if (paymentStatus) bookings[index].paymentStatus = paymentStatus;
    writeBookings(bookings);
    return res.json({ success: true, booking: bookings[index] });
  }
  return res.status(404).json({ error: "Booking not found" });
});

app.delete("/api/admin/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();
    await BookingModel.deleteOne({ id });
  } catch (e) {}
  let bookings = readBookings();
  bookings = bookings.filter(b => b.id !== id);
  writeBookings(bookings);
  return res.json({ success: true });
});

// Blog Posts API (Public & Admin)
app.get("/api/posts", async (req, res) => {
  try {
    await connectToDatabase();
    const posts = await PostModel.find({ published: 1 }).sort({ createdAt: -1 });
    if (posts && posts.length > 0) return res.json(posts);
  } catch (e) {}
  const posts = readPosts();
  return res.json(posts.filter(p => p.published !== false));
});

app.get("/api/posts/:slug", async (req, res) => {
  try {
    await connectToDatabase();
    const post = await PostModel.findOne({ slug: req.params.slug });
    if (post) return res.json(post);
  } catch (e) {}
  const post = readPosts().find(p => p.slug === req.params.slug);
  if (post) return res.json(post);
  return res.status(404).json({ error: "Post not found" });
});

app.get("/api/admin/posts", async (req, res) => {
  try {
    await connectToDatabase();
    const rows = await PostModel.find().sort({ createdAt: -1 });
    if (rows && rows.length > 0) return res.json(rows);
  } catch (e) {}
  return res.json(readPosts());
});

app.post("/api/admin/posts", async (req, res) => {
  try {
    await connectToDatabase();
    const newPost = {
      id: `post-${Date.now()}`,
      slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : `post-${Date.now()}`),
      title: req.body.title || "",
      excerpt: req.body.excerpt || "",
      content: req.body.content || "",
      image: req.body.image || "",
      author: req.body.author || "Travelluxx Editorial",
      date: new Date().toISOString().split("T")[0],
      published: req.body.published !== false ? 1 : 0,
      metaTitle: req.body.metaTitle || "",
      metaDescription: req.body.metaDescription || "",
      createdAt: new Date().toISOString()
    };

    // Save to JSON fallback
    const posts = readPosts();
    posts.unshift(newPost);
    writePosts(posts);

    // Save to MongoDB
    try {
      await PostModel.findOneAndUpdate({ id: newPost.id }, newPost, { upsert: true });
      console.log("💾 Saved Post to MongoDB!");
    } catch (e: any) { console.error("MongoDB Post error:", e.message); }

    return res.json({ success: true, post: newPost });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create post" });
  }
});

app.put("/api/admin/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();
    await PostModel.findOneAndUpdate({ id }, { $set: req.body });
  } catch (e) {}
  const posts = readPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...req.body };
    writePosts(posts);
    return res.json({ success: true, post: posts[index] });
  }
  return res.status(404).json({ error: "Post not found" });
});

app.delete("/api/admin/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();
    await PostModel.deleteOne({ id });
  } catch (e) {}
  let posts = readPosts();
  posts = posts.filter(p => p.id !== id);
  writePosts(posts);
  return res.json({ success: true });
});


// Admin Settings & Mollie API key update
app.get("/api/admin/settings", (req, res) => {
  const settings = getCurrentWebsiteSettings();
  const mollieApiKey = process.env.MOLLIE_API_KEY || "";
  return res.json({ ...settings, mollie_api_key: mollieApiKey });
});

app.post("/api/admin/settings", (req, res) => {
  try {
    const { mollie_api_key, ...otherSettings } = req.body;
    
    // Save to settings.json
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(otherSettings, null, 2));

    // Update .env file locally if mollie_api_key is provided
    if (mollie_api_key !== undefined) {
      process.env.MOLLIE_API_KEY = mollie_api_key;
      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }
      if (envContent.includes("MOLLIE_API_KEY=")) {
        envContent = envContent.replace(/MOLLIE_API_KEY=.*/g, `MOLLIE_API_KEY=${mollie_api_key}`);
      } else {
        envContent += `\nMOLLIE_API_KEY=${mollie_api_key}\n`;
      }
      fs.writeFileSync(envPath, envContent);
    }

    return res.json({ success: true, message: "Settings updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save settings" });
  }
});

// --- Pages CRUD ---
app.get("/api/pages", async (req, res) => {
  try {
    await connectToDatabase();
    const pages = await PageModel.find();
    if (pages && pages.length > 0) return res.json(pages);
  } catch (e) {}
  return res.json(readPages());
});

app.get("/api/pages/:slug", async (req, res) => {
  try {
    await connectToDatabase();
    const page = await PageModel.findOne({ slug: req.params.slug });
    if (page) return res.json(page);
  } catch (e) {}
  const page = readPages().find(p => p.slug === req.params.slug);
  if (page) return res.json(page);
  return res.status(404).json({ error: "Page not found" });
});

app.get("/api/admin/pages", async (req, res) => {
  try {
    await connectToDatabase();
    const pages = await PageModel.find();
    if (pages && pages.length > 0) return res.json(pages);
  } catch (e) {}
  return res.json(readPages());
});

app.post("/api/admin/pages", async (req, res) => {
  try {
    await connectToDatabase();
    const pages = readPages();
    const newPage = {
      id: `page-${Date.now()}`,
      slug: req.body.slug || req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `page-${Date.now()}`,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    pages.push(newPage);
    writePages(pages);

    try {
      await PageModel.findOneAndUpdate({ id: newPage.id }, newPage, { upsert: true });
      console.log("💾 Saved Page to MongoDB!");
    } catch (e) {}

    return res.json({ success: true, page: newPage });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create page" });
  }
});

app.put("/api/admin/pages/:id", async (req, res) => {
  try {
    await connectToDatabase();
    await PageModel.findOneAndUpdate({ id: req.params.id }, { ...req.body, updatedAt: new Date().toISOString() });
  } catch (e) {}

  const pages = readPages();
  const idx = pages.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    pages[idx] = { ...pages[idx], ...req.body, updatedAt: new Date().toISOString() };
    writePages(pages);
    return res.json({ success: true, page: pages[idx] });
  }
  return res.status(404).json({ error: "Page not found" });
});

app.delete("/api/admin/pages/:id", async (req, res) => {
  try {
    await connectToDatabase();
    await PageModel.deleteOne({ id: req.params.id });
  } catch (e) {}
  writePages(readPages().filter(p => p.id !== req.params.id));
  return res.json({ success: true });
});

// --- Menu Manager ---
const MENU_PATH = path.join(process.cwd(), "menu.json");
function readMenu(): any[] {
  try { if (fs.existsSync(MENU_PATH)) return JSON.parse(fs.readFileSync(MENU_PATH, "utf8")); } catch (e) {}
  return [{ id: "1", label: "Book Now", href: "/#calculator", target: "_self" }, { id: "2", label: "Blog", href: "/blog", target: "_self" }, { id: "3", label: "Contact", href: "/#contact", target: "_self" }];
}
app.get("/api/menu", (req, res) => res.json(readMenu()));
app.post("/api/admin/menu", (req, res) => {
  try {
    fs.writeFileSync(MENU_PATH, JSON.stringify(req.body, null, 2));
    return res.json({ success: true });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// --- Image Upload ---
app.post("/api/admin/upload", (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) return res.status(400).json({ error: "filename and data required" });
    const matches = data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: "Invalid base64 data" });
    const buffer = Buffer.from(matches[2], "base64");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    fs.writeFileSync(path.join(uploadDir, safeFilename), buffer);
    // Also write to dist/uploads for production serving
    const distUploadDir = path.join(process.cwd(), "dist", "uploads");
    fs.mkdirSync(distUploadDir, { recursive: true });
    fs.writeFileSync(path.join(distUploadDir, safeFilename), buffer);
    return res.json({ success: true, url: `/uploads/${safeFilename}`, filename: safeFilename });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// Serve uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// --- Admin Register (Sign Up - DISABLED) ---
app.post("/api/admin/register", (req, res) => {
  return res.status(403).json({ error: "Registration is disabled" });
});

app.post("/api/bookings/payment-simulate", async (req, res) => {

  const { bookingId } = req.body;
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.paymentStatus = "Paid";
    booking.status = "Confirmed";
    writeBookings(bookings);
  }
  return res.json({ success: true, transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}` });
});

// Mollie Payment Gateway Routes
app.post("/api/mollie/create-payment", async (req, res) => {
  try {
    const bookingData = req.body;
    const mollieClient = getMollieClient();

    if (!mollieClient) {
      return res.status(400).json({
        success: false,
        error: "Mollie API key is missing. Please configure MOLLIE_API_KEY in your .env file or in Website Settings in Admin Panel."
      });
    }

    const bookings = readBookings();
    const bookingId = bookingData.id || `WLC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      booking = {
        id: bookingId,
        ...bookingData,
        paymentMethod: "Mollie",
        paymentStatus: "Pending (Mollie)",
        status: "Pending Payment",
        createdAt: new Date().toISOString()
      };
      bookings.unshift(booking);
      writeBookings(bookings);
    }

    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const rawPrice = Number(bookingData.price || booking.price || 0);
    const amountVal = rawPrice > 0 ? rawPrice.toFixed(2) : "10.00";

    const payment = await mollieClient.payments.create({
      amount: {
        currency: "GBP",
        value: amountVal,
      },
      description: `TravelLuxx Booking Ref: ${bookingId}`,
      redirectUrl: `${appUrl}/?bookingStatus=success&bookingId=${bookingId}`,
      webhookUrl: `${appUrl}/api/mollie/webhook`,
      metadata: {
        bookingId: bookingId,
        passengerName: booking.passengerName || booking.name || "",
        email: booking.email || "",
      },
    });

    booking.molliePaymentId = payment.id;
    writeBookings(bookings);

    const checkoutUrl = payment.getCheckoutUrl();

    return res.json({
      success: true,
      checkoutUrl,
      bookingId,
      molliePaymentId: payment.id
    });
  } catch (err: any) {
    console.error("Mollie payment creation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to create Mollie payment"
    });
  }
});

app.post("/api/mollie/webhook", async (req, res) => {
  try {
    const paymentId = req.body?.id;
    if (!paymentId) {
      return res.status(400).send("Missing payment id");
    }

    const mollieClient = getMollieClient();
    if (!mollieClient) {
      return res.status(400).send("Mollie not configured");
    }

    const payment = await mollieClient.payments.get(paymentId);
    const metadata = payment.metadata as any;
    const bookingId = metadata?.bookingId;

    if (bookingId) {
      const bookings = readBookings();
      const booking = bookings.find(b => b.id === bookingId || b.molliePaymentId === paymentId);
      if (booking) {
        if (payment.status === "paid") {
          booking.paymentStatus = "Paid";
          booking.status = "Confirmed";
          booking.paymentMethod = "Mollie";
          writeBookings(bookings);

          sendBookingEmails(booking).catch(err => console.error("Mollie email error:", err));
          sendWhatsAppNotification(booking).catch(err => console.error("Mollie WhatsApp error:", err));
        } else if (payment.status === "canceled" || payment.status === "expired" || payment.status === "failed") {
          booking.paymentStatus = "Failed/Canceled";
          booking.status = "Canceled";
          writeBookings(bookings);
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("Mollie webhook error:", err);
    return res.status(500).send("Webhook error");
  }
});

app.get("/api/mollie/status/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  return res.json({
    success: true,
    bookingId: booking.id,
    paymentStatus: booking.paymentStatus,
    status: booking.status
  });
});

app.post("/api/contact", async (req, res) => {
  try {
    const inquiry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      ...req.body,
      status: "Unread",
      createdAt: new Date().toISOString()
    };
    sendContactEmails(inquiry).catch(err => console.error("Contact email error:", err));
    return res.json({ success: true, inquiry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/pricing", (req, res) => {
  res.json(getCurrentPricingSettings());
});

app.get("/api/settings", (req, res) => {
  res.json(getCurrentWebsiteSettings());
});

app.post("/api/settings", (req, res) => {
  try {
    const current = getCurrentWebsiteSettings();
    const updated = { ...current, ...req.body };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update settings" });
  }
});

app.get("/api/smtp-settings", (req, res) => {
  const smtp = readSmtpSettings();
  res.json({
    smtpHost: smtp.smtpHost,
    smtpPort: smtp.smtpPort,
    smtpUser: smtp.smtpUser,
    smtpPass: smtp.smtpPass ? "••••••••" : "",
    smtpSecure: smtp.smtpSecure,
    senderAddress: smtp.senderAddress
  });
});

app.post("/api/smtp-settings", (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, senderAddress } = req.body;
    const current = readSmtpSettings();
    const updated = {
      smtpHost: smtpHost || current.smtpHost,
      smtpPort: smtpPort || current.smtpPort,
      smtpUser: smtpUser || current.smtpUser,
      smtpPass: (smtpPass && smtpPass !== "••••••••") ? smtpPass : current.smtpPass,
      smtpSecure: smtpSecure !== undefined ? smtpSecure : current.smtpSecure,
      senderAddress: senderAddress || current.senderAddress || smtpUser || current.smtpUser
    };
    fs.writeFileSync(SMTP_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, smtp: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save SMTP settings" });
  }
});

app.post("/api/test-email", async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const ws = getCurrentWebsiteSettings();
    const target = recipientEmail || ws.business_email || "info@travelluxx.co.uk";
    const smtpSettings = readSmtpSettings();

    const result = await sendEmailSafely({
      from: `"${ws.business_name}" <${smtpSettings.senderAddress || smtpSettings.smtpUser || ws.business_email}>`,
      to: target,
      subject: `Test Email from ${ws.business_name}`,
      text: `Hello! This is a test email sent from ${ws.business_name} at ${new Date().toLocaleString()}. SMTP is functioning properly.`
    });

    if (result.success) {
      return res.json({ success: true, message: `Test email sent successfully to ${target}`, messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, error: result.error || "Failed to send test email" });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Test email exception" });
  }
});

app.post("/api/settings/logo", (req, res) => {
  try {
    const { logo } = req.body;
    if (!logo) {
      return res.status(400).json({ error: "No logo data provided" });
    }
    const current = getCurrentWebsiteSettings();
    const updated = { ...current, logo_image: logo, logoImage: logo };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, logo, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save logo" });
  }
});

app.post("/api/stats/click", (req, res) => {
  res.json({ success: true });
});

app.post("/api/stats/visit", (req, res) => {
  res.json({ success: true });
});

app.post("/api/save-asset-image", (req, res) => {
  try {
    const { key, base64 } = req.body;
    if (!key || !base64) {
      return res.status(400).json({ error: "Missing key or base64 data" });
    }

    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid base64 format" });
    }

    const imageBuffer = Buffer.from(matches[2], "base64");

    const keyToFileMap: Record<string, string> = {
      logo: "travelluxx_logo_1786403432815.jpg",
      hero_bg: "hero_background_1786403449488.jpg",
      fleet_Economy: "fleet_economy_1786403470397.jpg",
      fleet_Luxury: "fleet_luxury_1786403483244.jpg",
      fleet_Family: "fleet_family_1786403496325.jpg",
      transfer_airport: "transfer_airport_1786403518712.jpg",
      transfer_port: "transfer_port_1786403532912.jpg",
      transfer_station: "transfer_station_1786403548164.jpg",
      transfer_city: "transfer_city_1786403562698.jpg",
      transfer_business: "transfer_business_1786403576291.jpg",
    };

    const fileName = keyToFileMap[key];
    if (!fileName) {
      return res.status(400).json({ error: "Unknown image key: " + key });
    }

    const targetPath = path.join(process.cwd(), "src", "assets", "images", fileName);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, imageBuffer);

    const distPath = path.join(process.cwd(), "dist", "assets", "images", fileName);
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, imageBuffer);
    }

    console.log(`[ASSETS] Successfully saved asset image key ${key} to ${targetPath}`);
    return res.json({ success: true, fileName, path: targetPath });
  } catch (err: any) {
    console.error("Error saving asset image:", err);
    return res.status(500).json({ error: err.message || "Failed to save asset image" });
  }
});

async function startServer() {
  // Robust production detection: agar dist/index.html mojood hai to production mode
  // hi use karo, chahe NODE_ENV hosting panel mein set ho ya na ho.
  const distPath = path.join(process.cwd(), "dist");
  const distIndexPath = path.join(distPath, "index.html");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distIndexPath);

  if (!isProduction) {
    console.log("[MODE] Development mode: starting Vite dev server middleware.");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[MODE] Production mode: serving static files from", distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} [mode: ${isProduction ? "production" : "development"}]`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;