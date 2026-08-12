var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_api_client = require("@mollie/api-client");
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
import_dotenv.default.config();
var BOOKINGS_PATH = import_path.default.join(process.cwd(), "bookings.json");
var SETTINGS_PATH = import_path.default.join(process.cwd(), "settings.json");
var PRICING_PATH = import_path.default.join(process.cwd(), "pricing.json");
var SMTP_PATH = import_path.default.join(process.cwd(), "smtp.json");
var POSTS_PATH = import_path.default.join(process.cwd(), "posts.json");
var ADMINS_PATH = import_path.default.join(process.cwd(), "admins.json");
var PAGES_PATH = import_path.default.join(process.cwd(), "pages.json");
var SQLITE_PATH = import_path.default.join(process.cwd(), "database.sqlite");
var sqliteDb = null;
try {
  if (process.env.VERCEL) {
    console.log("\u26A0\uFE0F Vercel environment detected \u2014 skipping SQLite (not supported). Using JSON file fallback.");
  } else {
    sqliteDb = new import_better_sqlite3.default(SQLITE_PATH);
    console.log("\u2705 Local SQLite Database connected successfully:", SQLITE_PATH);
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        passengerName TEXT,
        passengerEmail TEXT,
        passengerPhone TEXT,
        pickup TEXT,
        dropoff TEXT,
        date TEXT,
        time TEXT,
        distance TEXT,
        vehicle TEXT,
        price REAL,
        status TEXT DEFAULT 'Pending',
        paymentMethod TEXT,
        paymentStatus TEXT DEFAULT 'Unpaid',
        flightNumber TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT,
        slug TEXT UNIQUE,
        excerpt TEXT,
        content TEXT,
        image TEXT,
        author TEXT,
        date TEXT,
        published INTEGER DEFAULT 1,
        metaTitle TEXT,
        metaDescription TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        slug TEXT UNIQUE,
        content TEXT,
        metaTitle TEXT,
        metaDescription TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        createdAt TEXT
      );
    `);
    const countStmt = sqliteDb.prepare("SELECT COUNT(*) as count FROM bookings");
    const rowCount = countStmt.get().count;
    if (rowCount === 0 && import_fs.default.existsSync(BOOKINGS_PATH)) {
      console.log("\u{1F4E5} Migrating bookings.json into local SQLite database...");
      const jsonBookings = JSON.parse(import_fs.default.readFileSync(BOOKINGS_PATH, "utf8"));
      const insertStmt = sqliteDb.prepare(`
        INSERT OR IGNORE INTO bookings (id, passengerName, passengerEmail, passengerPhone, pickup, dropoff, date, time, distance, vehicle, price, status, paymentMethod, paymentStatus, flightNumber, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of jsonBookings) {
        insertStmt.run(b.id, b.passengerName || "", b.passengerEmail || "", b.passengerPhone || "", b.pickup || "", b.dropoff || "", b.date || "", b.time || "", b.distance || "", b.vehicle || "Luxury", b.price || 0, b.status || "Pending", b.paymentMethod || "Pay Later", b.paymentStatus || "Unpaid", b.flightNumber || "", b.createdAt || (/* @__PURE__ */ new Date()).toISOString());
      }
      console.log("\u2705 Local SQLite database populated with all historic leads!");
    }
    const postsCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM posts").get().count;
    if (postsCount === 0 && import_fs.default.existsSync(POSTS_PATH)) {
      console.log("\u{1F4E5} Migrating posts.json into local SQLite database...");
      const jsonPosts = JSON.parse(import_fs.default.readFileSync(POSTS_PATH, "utf8"));
      const insertPost = sqliteDb.prepare(`
        INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, image, author, date, published, metaTitle, metaDescription, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of jsonPosts) {
        insertPost.run(p.id, p.title || "", p.slug || "", p.excerpt || "", p.content || "", p.image || "", p.author || "Travelluxx Editorial", p.date || "", p.published !== false ? 1 : 0, p.metaTitle || "", p.metaDescription || "", p.createdAt || (/* @__PURE__ */ new Date()).toISOString());
      }
      console.log("\u2705 Posts migrated to SQLite! (" + jsonPosts.length + " posts)");
    }
    const pagesCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM pages").get().count;
    if (pagesCount === 0 && import_fs.default.existsSync(PAGES_PATH)) {
      console.log("\u{1F4E5} Migrating pages.json into local SQLite database...");
      const jsonPages = JSON.parse(import_fs.default.readFileSync(PAGES_PATH, "utf8"));
      const insertPage = sqliteDb.prepare(`
        INSERT OR IGNORE INTO pages (id, title, slug, content, metaTitle, metaDescription, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const pg of jsonPages) {
        insertPage.run(pg.id, pg.title || "", pg.slug || "", pg.content || "", pg.metaTitle || "", pg.metaDescription || "", pg.updatedAt || (/* @__PURE__ */ new Date()).toISOString());
      }
      console.log("\u2705 Pages migrated to SQLite! (" + jsonPages.length + " pages)");
    }
    const adminsCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM admins").get().count;
    if (adminsCount === 0 && import_fs.default.existsSync(ADMINS_PATH)) {
      console.log("\u{1F4E5} Migrating admins.json into local SQLite database...");
      const jsonAdmins = JSON.parse(import_fs.default.readFileSync(ADMINS_PATH, "utf8"));
      const insertAdmin = sqliteDb.prepare(`
        INSERT OR IGNORE INTO admins (id, username, email, password, name, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const a of jsonAdmins) {
        insertAdmin.run(a.id, a.username || "", a.email || "", a.password || "", a.name || "", a.createdAt || (/* @__PURE__ */ new Date()).toISOString());
      }
      console.log("\u2705 Admins migrated to SQLite! (" + jsonAdmins.length + " admins)");
    }
  }
} catch (err) {
  console.error("Local SQLite Database initialization error:", err.message);
}
var dbPool = null;
var isDbConnected = false;
try {
  dbPool = import_promise.default.createPool({
    host: process.env.DB_HOST || "10.169.18.62",
    user: process.env.DB_USER || "travellu3_travel",
    password: process.env.DB_PASSWORD || "Admin1122@@",
    database: process.env.DB_NAME || "travellu3_travelluxx",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 4e3
  });
  (async () => {
    try {
      const conn = await dbPool.getConnection();
      console.log("\u2705 Remote MySQL Database connected:", process.env.DB_NAME);
      isDbConnected = true;
      conn.release();
    } catch (err) {
      isDbConnected = false;
    }
  })();
} catch (err) {
}
function readPages() {
  try {
    if (import_fs.default.existsSync(PAGES_PATH)) {
      return JSON.parse(import_fs.default.readFileSync(PAGES_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading pages.json:", err);
  }
  return [];
}
function writePages(pages) {
  try {
    import_fs.default.writeFileSync(PAGES_PATH, JSON.stringify(pages, null, 2));
  } catch (err) {
    console.error("Error writing pages.json:", err);
  }
}
function readPosts() {
  try {
    if (import_fs.default.existsSync(POSTS_PATH)) {
      return JSON.parse(import_fs.default.readFileSync(POSTS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading posts.json:", err);
  }
  return [];
}
function writePosts(posts) {
  try {
    import_fs.default.writeFileSync(POSTS_PATH, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error("Error writing posts.json:", err);
  }
}
function readBookings() {
  try {
    if (import_fs.default.existsSync(BOOKINGS_PATH)) {
      return JSON.parse(import_fs.default.readFileSync(BOOKINGS_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading bookings.json:", err);
  }
  return [];
}
function writeBookings(bookings) {
  try {
    import_fs.default.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
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
    economy_price: 1.5,
    luxury_price: 2,
    family_price: 2.5,
    minimum_distance: 10,
    hero_image: "",
    logo_image: "",
    footer_info: "\xA9 2026 Travelluxx. All rights reserved."
  };
  try {
    const webSettingsPath = import_path.default.join(process.cwd(), "website_settings.json");
    if (import_fs.default.existsSync(SETTINGS_PATH)) {
      const data = JSON.parse(import_fs.default.readFileSync(SETTINGS_PATH, "utf8"));
      return { ...defaultSettings, ...data };
    } else if (import_fs.default.existsSync(webSettingsPath)) {
      const data = JSON.parse(import_fs.default.readFileSync(webSettingsPath, "utf8"));
      return { ...defaultSettings, ...data };
    }
  } catch (err) {
  }
  return defaultSettings;
}
function getCurrentPricingSettings() {
  const defaultPricing = {
    economy_price_per_mile: 1.5,
    luxury_price_per_mile: 2,
    family_price_per_mile: 2.5,
    minimum_billable_distance: 10,
    extra_stop_charge: 10,
    break_time_charge: 0.5
  };
  try {
    if (import_fs.default.existsSync(PRICING_PATH)) {
      const data = JSON.parse(import_fs.default.readFileSync(PRICING_PATH, "utf8"));
      return { ...defaultPricing, ...data };
    }
  } catch (err) {
  }
  return defaultPricing;
}
function readSmtpSettings() {
  let saved = {};
  try {
    if (import_fs.default.existsSync(SMTP_PATH)) {
      saved = JSON.parse(import_fs.default.readFileSync(SMTP_PATH, "utf8"));
    } else {
      const ws2 = getCurrentWebsiteSettings();
      if (ws2.smtp_host || ws2.smtp_user || ws2.smtpUser) {
        saved = {
          smtpHost: ws2.smtp_host || ws2.smtpHost,
          smtpPort: ws2.smtp_port || ws2.smtpPort,
          smtpUser: ws2.smtp_user || ws2.smtpUser,
          smtpPass: ws2.smtp_pass || ws2.smtpPass,
          smtpSecure: ws2.smtp_secure !== void 0 ? ws2.smtp_secure : ws2.smtpSecure,
          senderAddress: ws2.business_email || ws2.smtp_user || ws2.smtpUser
        };
      }
    }
  } catch (err) {
  }
  const ws = getCurrentWebsiteSettings();
  return {
    smtpHost: saved.smtpHost || process.env.SMTP_HOST || "mail.travelluxx.co.uk",
    smtpPort: saved.smtpPort || process.env.SMTP_PORT || "465",
    smtpUser: saved.smtpUser || process.env.SMTP_USER || ws.business_email || "info@travelluxx.co.uk",
    smtpPass: saved.smtpPass || process.env.SMTP_PASS || "sdjnefvpasotcja",
    smtpSecure: saved.smtpSecure !== void 0 ? saved.smtpSecure : process.env.SMTP_SECURE !== "false",
    senderAddress: saved.senderAddress || saved.smtpUser || process.env.SMTP_USER || ws.business_email || "info@travelluxx.co.uk"
  };
}
function getMollieClient() {
  const settings = getCurrentWebsiteSettings();
  const apiKey = process.env.MOLLIE_API_KEY || settings?.mollie_api_key;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  return (0, import_api_client.createMollieClient)({ apiKey: apiKey.trim() });
}
function createTransporter() {
  const settings = readSmtpSettings();
  const port = parseInt(String(settings.smtpPort || "465"), 10);
  const secure = settings.smtpSecure !== false && (port === 465 || settings.smtpSecure === true);
  return import_nodemailer.default.createTransport({
    host: settings.smtpHost,
    port,
    secure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 1e4,
    greetingTimeout: 1e4,
    socketTimeout: 15e3
  });
}
async function sendEmailSafely(mailOptions) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email safely:", error);
    return { success: false, error: error?.message || String(error) };
  }
}
async function sendWhatsAppNotification(booking) {
  const ws = getCurrentWebsiteSettings();
  const token = process.env.WHATSAPP_TOKEN || "tJghe6OE6w1V8YclFG4onsIQgAUgx1QlZ6SIydFjoJBUw11l1PJKfOwwyoMu29Ff";
  const messageBody = `\u{1F697} *Booking Confirmed - ${ws.business_name}*
Ref: ${booking.id}
Passenger: ${booking.passengerName}
Date/Time: ${booking.date} at ${booking.time}
Pickup: ${booking.pickup}
Dropoff: ${booking.dropoff}
Distance: ${Number(booking.distance || 0).toFixed(1)} miles
Vehicle: ${booking.vehicle} Class
Total: \xA3${Number(booking.price).toFixed(2)}
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
async function sendBookingEmails(booking) {
  const ws = getCurrentWebsiteSettings();
  const brandGreen = "#047857";
  const bgSlate = "#f8fafc";
  const borderSlate = "#e2e8f0";
  const textDark = "#0f172a";
  const textMuted = "#64748b";
  const hasStops = Array.isArray(booking.stops) && booking.stops.length > 0;
  const hasWaiting = Number(booking.waitingTime || 0) > 0;
  const paymentDisplay = booking.paymentMethod === "Pay Later" ? "Pay Later" : `${booking.paymentMethod} <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;">Paid</span>`;
  let stopsListHtml = "";
  if (hasStops) {
    stopsListHtml = booking.stops.map(
      (s, i) => `<li style="margin-bottom: 4px;"><span style="color: ${textMuted}; font-size: 11px;">Stop ${i + 1}:</span> ${s.address} ${Number(s.waiting) > 0 ? `(Wait: ${s.waiting}m)` : ""}</li>`
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
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Total Distance</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${Number(booking.distance || 0) > 0 ? Number(booking.distance).toFixed(1) + " miles" : "N/A"}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Vehicle Class</td><td style="padding: 10px 0; color: ${brandGreen}; font-weight: 700; text-align: right;">${booking.vehicle} Class</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Passengers / Bags</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.passengers || 1} Passengers, ${booking.luggage || 0} Bags</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Flight Number</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.flightNumber || "N/A"}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Distance Fare</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">\xA3${Number(booking.distanceFare || booking.price).toFixed(2)}</td></tr>
      ${hasWaiting ? `
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Time</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.waitingTime} Minutes</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Charge Percentage</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${booking.waitingPercent ? booking.waitingPercent * 100 : 0}%</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Waiting Charge Amount</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">\xA3${Number(booking.waitingChargeAmount || 0).toFixed(2)}</td></tr>
      ` : ""}
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Total Price</td><td style="padding: 10px 0; color: ${brandGreen}; font-weight: 800; text-align: right; font-size: 18px;">\xA3${Number(booking.price).toFixed(2)}</td></tr>
      <tr style="border-bottom: 1px solid ${borderSlate};"><td style="padding: 10px 0; color: ${textMuted};">Payment</td><td style="padding: 10px 0; font-weight: 700; text-align: right;">${paymentDisplay}</td></tr>
    </table>
  `;
  const commonEmailHtml = (title, subtitle) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${bgSlate}; padding: 40px 20px; color: ${textDark}; line-height: 1.6; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid ${borderSlate};">
      <div style="background-color: ${brandGreen}; border-radius: 12px 12px 0 0; padding: 30px; text-align: center; margin: -40px -20px 30px -20px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">${ws.business_name.toUpperCase()}</h1>
        <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">Private Hire \u2022 Airport Transfers</p>
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
      html: passengerHtml
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
      html: operatorHtml
    });
  }
}
async function sendContactEmails(inquiry) {
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
      html: customerHtml
    });
  }
  if (ws.business_email) {
    await sendEmailSafely({
      from: fromAddress,
      to: ws.business_email,
      replyTo: inquiry.email || ws.business_email,
      subject: `[New Inquiry] ${inquiry.name} - ${inquiry.type}`,
      html: operatorHtml
    });
  }
}
var UK_LOCATIONS = {
  "shirley": { lat: 52.414, lng: -1.815, name: "Shirley, Solihull B90" },
  "solihull": { lat: 52.4135, lng: -1.778, name: "Solihull, West Midlands" },
  "birmingham": { lat: 52.4862, lng: -1.8904, name: "Birmingham, West Midlands" },
  "bhx": { lat: 52.4539, lng: -1.7481, name: "Birmingham Airport (BHX)" },
  "lhr": { lat: 51.47, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
  "lgw": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
  "man": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" }
};
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function generateFallbackRoutePoints(lat1, lng1, lat2, lng2, stepsCount = 10) {
  const points = [];
  const pLat = -(lng2 - lng1);
  const pLng = lat2 - lat1;
  const len = Math.sqrt(pLat * pLat + pLng * pLng);
  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    const midLat = lat1 + (lat2 - lat1) * ratio;
    const midLng = lng1 + (lng2 - lng1) * ratio;
    if (len > 0) {
      const wiggle = Math.sin(ratio * Math.PI) * len * 0.12;
      points.push({ lat: midLat + pLat / len * wiggle, lng: midLng + pLng / len * wiggle });
    } else {
      points.push({ lat: midLat, lng: midLng });
    }
  }
  return points;
}
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host.toLowerCase().startsWith("www.")) {
    const newHost = host.slice(4);
    return res.redirect(301, `https://${newHost}${req.originalUrl}`);
  }
  next();
});
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", import_express.default.static(import_path.default.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.post("/api/distance", async (req, res) => {
  const { pickup, dropoff, pickupCoords, dropoffCoords, stops, precalculated } = req.body;
  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "Pickup and Dropoff locations are required." });
  }
  const pricing = getCurrentPricingSettings();
  let pCoords = pickupCoords ? { lat: Number(pickupCoords.lat), lng: Number(pickupCoords.lng), name: pickup } : UK_LOCATIONS.shirley;
  let dCoords = dropoffCoords ? { lat: Number(dropoffCoords.lat), lng: Number(dropoffCoords.lng), name: dropoff } : UK_LOCATIONS.bhx;
  let distance = precalculated?.distanceMiles ? Number(precalculated.distanceMiles) : getHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng) * 1.25;
  if (isNaN(distance) || distance < 1) distance = 15;
  let duration = precalculated?.timeMinutes ? Math.round(Number(precalculated.timeMinutes)) : Math.round(distance / 45 * 60);
  const effectiveDist = Math.max(distance, pricing.minimum_billable_distance);
  const stopCount = Array.isArray(stops) ? stops.length : 0;
  const stopFee = stopCount * (pricing.extra_stop_charge || 10);
  let totalWaitingMins = 0;
  if (Array.isArray(stops)) {
    stops.forEach((s) => {
      totalWaitingMins += Number(s.waiting || 0);
    });
  }
  const waitingChargeAmount = totalWaitingMins * (pricing.break_time_charge || 0.5);
  const prices = {
    Economy: Number((effectiveDist * pricing.economy_price_per_mile + stopFee + waitingChargeAmount).toFixed(2)),
    Luxury: Number((effectiveDist * pricing.luxury_price_per_mile + stopFee + waitingChargeAmount).toFixed(2)),
    Family: Number((effectiveDist * pricing.family_price_per_mile + stopFee + waitingChargeAmount).toFixed(2))
  };
  const routePoints = precalculated?.routePoints && precalculated.routePoints.length > 0 ? precalculated.routePoints : generateFallbackRoutePoints(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
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
    const data = req.body;
    const bookingId = `WLC-2026-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newBooking = {
      id: bookingId,
      ...data,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const bookings = readBookings();
    bookings.unshift(newBooking);
    writeBookings(bookings);
    if (sqliteDb) {
      try {
        const stmt = sqliteDb.prepare(`
          INSERT OR IGNORE INTO bookings (id, passengerName, passengerEmail, passengerPhone, pickup, dropoff, date, time, distance, vehicle, price, status, paymentMethod, paymentStatus, flightNumber, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(newBooking.id, newBooking.passengerName || "", newBooking.passengerEmail || "", newBooking.passengerPhone || "", newBooking.pickup || "", newBooking.dropoff || "", newBooking.date || "", newBooking.time || "", newBooking.distance || "", newBooking.vehicle || "Luxury", newBooking.price || 0, "Pending", newBooking.paymentMethod || "Pay Later", "Unpaid", newBooking.flightNumber || "", newBooking.createdAt);
        console.log("\u{1F4BE} Saved to local SQLite Database table 'bookings'!");
      } catch (sqErr) {
        console.error("SQLite Insert error:", sqErr.message);
      }
    }
    if (dbPool && isDbConnected) {
      try {
        await dbPool.query(
          `INSERT INTO bookings (id, passengerName, passengerEmail, passengerPhone, pickup, dropoff, date, time, distance, vehicle, price, status, paymentMethod, paymentStatus, flightNumber) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newBooking.id, newBooking.passengerName || "", newBooking.passengerEmail || "", newBooking.passengerPhone || "", newBooking.pickup || "", newBooking.dropoff || "", newBooking.date || "", newBooking.time || "", newBooking.distance || "", newBooking.vehicle || "Luxury", newBooking.price || 0, "Pending", newBooking.paymentMethod || "Pay Later", "Unpaid", newBooking.flightNumber || ""]
        );
        console.log("\u{1F4BE} Booking saved to MySQL database table 'bookings'!");
      } catch (dbErr) {
      }
    }
    sendBookingEmails(newBooking).catch((err) => console.error("Booking email error:", err));
    sendWhatsAppNotification(newBooking).catch((err) => console.error("WhatsApp notification error:", err));
    return res.json({ success: true, booking: newBooking });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to create booking" });
  }
});
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const validUsers = ["admin", "info@travelluxx.co.uk", "travellu3_travel", "adminoperator"];
  const validPasswords = ["admin123", "Admin1122@@", "cefc4f9486814ea24b0675b804019577694069e33b4b38f6fece78b080d9f7f0"];
  let dbValid = false;
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM admins WHERE (username = ? OR email = ?) AND password = ?");
      const user = stmt.get(username, username, password);
      if (user) dbValid = true;
    } catch (e) {
    }
  }
  if (!dbValid && dbPool && isDbConnected) {
    try {
      const [rows] = await dbPool.query("SELECT * FROM admins WHERE (username = ? OR email = ?) AND password = ?", [username, username, password]);
      if (rows && rows.length > 0) dbValid = true;
    } catch (e) {
    }
  }
  try {
    if (!dbValid && import_fs.default.existsSync(ADMINS_PATH)) {
      const admins = JSON.parse(import_fs.default.readFileSync(ADMINS_PATH, "utf8"));
      if (Array.isArray(admins)) {
        dbValid = admins.some((a) => (a.username === username || a.email === username) && a.password === password);
      }
    }
  } catch (err) {
  }
  const isUserValid = validUsers.includes((username || "").toLowerCase().trim());
  const isPassValid = validPasswords.includes(password);
  if (isUserValid && isPassValid || dbValid) {
    return res.json({ success: true, token: "admin-auth-token-travelluxx-2026" });
  }
  return res.status(401).json({ success: false, error: "Invalid username or password" });
});
app.get("/api/admin/bookings", async (req, res) => {
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM bookings ORDER BY createdAt DESC");
      const rows = stmt.all();
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    } catch (e) {
      console.error("Error reading from SQLite bookings table:", e.message);
    }
  }
  const bookings = readBookings();
  return res.json(bookings);
});
app.put("/api/admin/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const bookings = readBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index !== -1) {
    if (status) bookings[index].status = status;
    if (paymentStatus) bookings[index].paymentStatus = paymentStatus;
    writeBookings(bookings);
    return res.json({ success: true, booking: bookings[index] });
  }
  return res.status(404).json({ error: "Booking not found" });
});
app.delete("/api/admin/bookings/:id", (req, res) => {
  const { id } = req.params;
  let bookings = readBookings();
  bookings = bookings.filter((b) => b.id !== id);
  writeBookings(bookings);
  return res.json({ success: true });
});
app.get("/api/posts", (req, res) => {
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM posts WHERE published = 1 ORDER BY createdAt DESC");
      return res.json(stmt.all());
    } catch (e) {
    }
  }
  const posts = readPosts();
  return res.json(posts.filter((p) => p.published !== false));
});
app.get("/api/posts/:slug", (req, res) => {
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM posts WHERE slug = ?");
      const post2 = stmt.get(req.params.slug);
      if (post2) return res.json(post2);
    } catch (e) {
    }
  }
  const post = readPosts().find((p) => p.slug === req.params.slug);
  if (post) return res.json(post);
  return res.status(404).json({ error: "Post not found" });
});
app.get("/api/admin/posts", (req, res) => {
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM posts ORDER BY createdAt DESC");
      const rows = stmt.all();
      if (rows && rows.length > 0) return res.json(rows);
    } catch (e) {
    }
  }
  return res.json(readPosts());
});
app.post("/api/admin/posts", (req, res) => {
  const newPost = {
    id: `post-${Date.now()}`,
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : `post-${Date.now()}`),
    title: req.body.title || "",
    excerpt: req.body.excerpt || "",
    content: req.body.content || "",
    image: req.body.image || "",
    author: req.body.author || "Travelluxx Editorial",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    published: req.body.published !== false ? 1 : 0,
    metaTitle: req.body.metaTitle || "",
    metaDescription: req.body.metaDescription || "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const posts = readPosts();
  posts.unshift(newPost);
  writePosts(posts);
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        INSERT OR REPLACE INTO posts (id, title, slug, excerpt, content, image, author, date, published, metaTitle, metaDescription, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(newPost.id, newPost.title, newPost.slug, newPost.excerpt, newPost.content, newPost.image, newPost.author, newPost.date, newPost.published, newPost.metaTitle, newPost.metaDescription, newPost.createdAt);
      console.log("\u{1F4BE} Saved Post to Local SQLite Database table 'posts'!");
    } catch (e) {
      console.error("SQLite Post error:", e.message);
    }
  }
  if (dbPool && isDbConnected) {
    try {
      dbPool.query(
        `INSERT INTO posts (id, title, slug, excerpt, content, image, author, date, published, metaTitle, metaDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newPost.id, newPost.title, newPost.slug, newPost.excerpt, newPost.content, newPost.image, newPost.author, newPost.date, newPost.published, newPost.metaTitle, newPost.metaDescription]
      );
    } catch (e) {
    }
  }
  return res.json({ success: true, post: newPost });
});
app.put("/api/admin/posts/:id", (req, res) => {
  const { id } = req.params;
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, published = ?, metaTitle = ?, metaDescription = ? WHERE id = ?
      `);
      stmt.run(req.body.title, req.body.slug, req.body.excerpt, req.body.content, req.body.image, req.body.published ? 1 : 0, req.body.metaTitle, req.body.metaDescription, id);
    } catch (e) {
    }
  }
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...req.body };
    writePosts(posts);
    return res.json({ success: true, post: posts[index] });
  }
  return res.status(404).json({ error: "Post not found" });
});
app.delete("/api/admin/posts/:id", (req, res) => {
  const { id } = req.params;
  if (sqliteDb) {
    try {
      sqliteDb.prepare("DELETE FROM posts WHERE id = ?").run(id);
    } catch (e) {
    }
  }
  let posts = readPosts();
  posts = posts.filter((p) => p.id !== id);
  writePosts(posts);
  return res.json({ success: true });
});
app.get("/api/admin/settings", (req, res) => {
  const settings = getCurrentWebsiteSettings();
  const mollieApiKey = process.env.MOLLIE_API_KEY || "";
  return res.json({ ...settings, mollie_api_key: mollieApiKey });
});
app.post("/api/admin/settings", (req, res) => {
  try {
    const { mollie_api_key, ...otherSettings } = req.body;
    import_fs.default.writeFileSync(SETTINGS_PATH, JSON.stringify(otherSettings, null, 2));
    if (mollie_api_key !== void 0) {
      process.env.MOLLIE_API_KEY = mollie_api_key;
      const envPath = import_path.default.join(process.cwd(), ".env");
      let envContent = "";
      if (import_fs.default.existsSync(envPath)) {
        envContent = import_fs.default.readFileSync(envPath, "utf8");
      }
      if (envContent.includes("MOLLIE_API_KEY=")) {
        envContent = envContent.replace(/MOLLIE_API_KEY=.*/g, `MOLLIE_API_KEY=${mollie_api_key}`);
      } else {
        envContent += `
MOLLIE_API_KEY=${mollie_api_key}
`;
      }
      import_fs.default.writeFileSync(envPath, envContent);
    }
    return res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to save settings" });
  }
});
app.get("/api/pages", (req, res) => res.json(readPages()));
app.get("/api/pages/:slug", (req, res) => {
  const page = readPages().find((p) => p.slug === req.params.slug);
  if (page) return res.json(page);
  return res.status(404).json({ error: "Page not found" });
});
app.get("/api/admin/pages", (req, res) => res.json(readPages()));
app.post("/api/admin/pages", (req, res) => {
  const pages = readPages();
  const newPage = {
    id: `page-${Date.now()}`,
    slug: req.body.slug || req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `page-${Date.now()}`,
    ...req.body,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  pages.push(newPage);
  writePages(pages);
  return res.json({ success: true, page: newPage });
});
app.put("/api/admin/pages/:id", (req, res) => {
  const pages = readPages();
  const idx = pages.findIndex((p) => p.id === req.params.id);
  if (idx !== -1) {
    pages[idx] = { ...pages[idx], ...req.body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    writePages(pages);
    return res.json({ success: true, page: pages[idx] });
  }
  return res.status(404).json({ error: "Page not found" });
});
app.delete("/api/admin/pages/:id", (req, res) => {
  writePages(readPages().filter((p) => p.id !== req.params.id));
  return res.json({ success: true });
});
var MENU_PATH = import_path.default.join(process.cwd(), "menu.json");
function readMenu() {
  try {
    if (import_fs.default.existsSync(MENU_PATH)) return JSON.parse(import_fs.default.readFileSync(MENU_PATH, "utf8"));
  } catch (e) {
  }
  return [{ id: "1", label: "Book Now", href: "/#calculator", target: "_self" }, { id: "2", label: "Blog", href: "/blog", target: "_self" }, { id: "3", label: "Contact", href: "/#contact", target: "_self" }];
}
app.get("/api/menu", (req, res) => res.json(readMenu()));
app.post("/api/admin/menu", (req, res) => {
  try {
    import_fs.default.writeFileSync(MENU_PATH, JSON.stringify(req.body, null, 2));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/upload", (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) return res.status(400).json({ error: "filename and data required" });
    const matches = data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: "Invalid base64 data" });
    const buffer = Buffer.from(matches[2], "base64");
    const uploadDir = import_path.default.join(process.cwd(), "public", "uploads");
    import_fs.default.mkdirSync(uploadDir, { recursive: true });
    const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    import_fs.default.writeFileSync(import_path.default.join(uploadDir, safeFilename), buffer);
    const distUploadDir = import_path.default.join(process.cwd(), "dist", "uploads");
    import_fs.default.mkdirSync(distUploadDir, { recursive: true });
    import_fs.default.writeFileSync(import_path.default.join(distUploadDir, safeFilename), buffer);
    return res.json({ success: true, url: `/uploads/${safeFilename}`, filename: safeFilename });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.use("/uploads", import_express.default.static(import_path.default.join(process.cwd(), "public", "uploads")));
app.post("/api/admin/register", (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: "Username, email, and password are required" });
    let admins = [];
    if (import_fs.default.existsSync(ADMINS_PATH)) admins = JSON.parse(import_fs.default.readFileSync(ADMINS_PATH, "utf8"));
    const exists = admins.some((a) => a.username === username || a.email === email);
    if (exists) return res.status(409).json({ error: "User with this username or email already exists" });
    const newAdmin = { id: `admin-${Date.now()}`, username, email, password, name: name || username, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    admins.push(newAdmin);
    import_fs.default.writeFileSync(ADMINS_PATH, JSON.stringify(admins, null, 2));
    return res.json({ success: true, token: "admin-auth-token-travelluxx-2026" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
app.post("/api/bookings/payment-simulate", async (req, res) => {
  const { bookingId } = req.body;
  const bookings = readBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.paymentStatus = "Paid";
    booking.status = "Confirmed";
    writeBookings(bookings);
  }
  return res.json({ success: true, transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}` });
});
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
    const bookingId = bookingData.id || `WLC-2026-${Math.floor(1e3 + Math.random() * 9e3)}`;
    let booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      booking = {
        id: bookingId,
        ...bookingData,
        paymentMethod: "Mollie",
        paymentStatus: "Pending (Mollie)",
        status: "Pending Payment",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
        value: amountVal
      },
      description: `TravelLuxx Booking Ref: ${bookingId}`,
      redirectUrl: `${appUrl}/?bookingStatus=success&bookingId=${bookingId}`,
      webhookUrl: `${appUrl}/api/mollie/webhook`,
      metadata: {
        bookingId,
        passengerName: booking.passengerName || booking.name || "",
        email: booking.email || ""
      }
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
  } catch (err) {
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
    const metadata = payment.metadata;
    const bookingId = metadata?.bookingId;
    if (bookingId) {
      const bookings = readBookings();
      const booking = bookings.find((b) => b.id === bookingId || b.molliePaymentId === paymentId);
      if (booking) {
        if (payment.status === "paid") {
          booking.paymentStatus = "Paid";
          booking.status = "Confirmed";
          booking.paymentMethod = "Mollie";
          writeBookings(bookings);
          sendBookingEmails(booking).catch((err) => console.error("Mollie email error:", err));
          sendWhatsAppNotification(booking).catch((err) => console.error("Mollie WhatsApp error:", err));
        } else if (payment.status === "canceled" || payment.status === "expired" || payment.status === "failed") {
          booking.paymentStatus = "Failed/Canceled";
          booking.status = "Canceled";
          writeBookings(bookings);
        }
      }
    }
    return res.status(200).send("OK");
  } catch (err) {
    console.error("Mollie webhook error:", err);
    return res.status(500).send("Webhook error");
  }
});
app.get("/api/mollie/status/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const bookings = readBookings();
  const booking = bookings.find((b) => b.id === bookingId);
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
      id: `INQ-${Math.floor(1e3 + Math.random() * 9e3)}`,
      ...req.body,
      status: "Unread",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    sendContactEmails(inquiry).catch((err) => console.error("Contact email error:", err));
    return res.json({ success: true, inquiry });
  } catch (err) {
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
    import_fs.default.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update settings" });
  }
});
app.get("/api/smtp-settings", (req, res) => {
  const smtp = readSmtpSettings();
  res.json({
    smtpHost: smtp.smtpHost,
    smtpPort: smtp.smtpPort,
    smtpUser: smtp.smtpUser,
    smtpPass: smtp.smtpPass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "",
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
      smtpPass: smtpPass && smtpPass !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" ? smtpPass : current.smtpPass,
      smtpSecure: smtpSecure !== void 0 ? smtpSecure : current.smtpSecure,
      senderAddress: senderAddress || current.senderAddress || smtpUser || current.smtpUser
    };
    import_fs.default.writeFileSync(SMTP_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, smtp: updated });
  } catch (err) {
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
      text: `Hello! This is a test email sent from ${ws.business_name} at ${(/* @__PURE__ */ new Date()).toLocaleString()}. SMTP is functioning properly.`
    });
    if (result.success) {
      return res.json({ success: true, message: `Test email sent successfully to ${target}`, messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, error: result.error || "Failed to send test email" });
    }
  } catch (err) {
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
    import_fs.default.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, logo, settings: updated });
  } catch (err) {
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
    const keyToFileMap = {
      logo: "travelluxx_logo_1786403432815.jpg",
      hero_bg: "hero_background_1786403449488.jpg",
      fleet_Economy: "fleet_economy_1786403470397.jpg",
      fleet_Luxury: "fleet_luxury_1786403483244.jpg",
      fleet_Family: "fleet_family_1786403496325.jpg",
      transfer_airport: "transfer_airport_1786403518712.jpg",
      transfer_port: "transfer_port_1786403532912.jpg",
      transfer_station: "transfer_station_1786403548164.jpg",
      transfer_city: "transfer_city_1786403562698.jpg",
      transfer_business: "transfer_business_1786403576291.jpg"
    };
    const fileName = keyToFileMap[key];
    if (!fileName) {
      return res.status(400).json({ error: "Unknown image key: " + key });
    }
    const targetPath = import_path.default.join(process.cwd(), "src", "assets", "images", fileName);
    import_fs.default.mkdirSync(import_path.default.dirname(targetPath), { recursive: true });
    import_fs.default.writeFileSync(targetPath, imageBuffer);
    const distPath = import_path.default.join(process.cwd(), "dist", "assets", "images", fileName);
    if (import_fs.default.existsSync(import_path.default.dirname(distPath))) {
      import_fs.default.writeFileSync(distPath, imageBuffer);
    }
    console.log(`[ASSETS] Successfully saved asset image key ${key} to ${targetPath}`);
    return res.json({ success: true, fileName, path: targetPath });
  } catch (err) {
    console.error("Error saving asset image:", err);
    return res.status(500).json({ error: err.message || "Failed to save asset image" });
  }
});
async function startServer() {
  const distPath = import_path.default.join(process.cwd(), "dist");
  const distIndexPath = import_path.default.join(distPath, "index.html");
  const isProduction = process.env.NODE_ENV === "production" || import_fs.default.existsSync(distIndexPath);
  if (!isProduction) {
    console.log("[MODE] Development mode: starting Vite dev server middleware.");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[MODE] Production mode: serving static files from", distPath);
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} [mode: ${isProduction ? "production" : "development"}]`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
//# sourceMappingURL=server.cjs.map
