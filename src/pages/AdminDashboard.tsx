import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, LayoutDashboard, FileText, Newspaper, Menu, Image, Settings, BookOpen, LogOut, Plus, Trash2, Edit2, Save, X, Upload, ChevronUp, ChevronDown, ExternalLink, Users, MessageSquare } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "leads" | "posts" | "pages" | "media" | "menus" | "settings" | "inquiries";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    ['clean']
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("travelluxx_admin_token"));
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", name: "" });

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [bookings, setBookings] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaViewMode, setMediaViewMode] = useState<"grid" | "list">("grid");
  const [saveStatus, setSaveStatus] = useState("");

  // Post editor
  const [editingPost, setEditingPost] = useState<any>(undefined);
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", content: "", image: "", published: true, metaTitle: "", metaDescription: "" });

  // Page editor
  const [editingPage, setEditingPage] = useState<any>(undefined);
  const [pageForm, setPageForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "" });

  // Media upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Menu editor
  const [newMenuItem, setNewMenuItem] = useState({ label: "", href: "", target: "_self" });

  useEffect(() => {
    if (token) {
      fetchAll();
    }
  }, [token]);

  const fetchAll = () => {
    fetchBookings(); fetchPosts(); fetchPages(); fetchSettings(); fetchMenu(); fetchInquiries(); fetchMedia();
  };

  const fetchBookings = async () => {
    const r = await fetch("/api/admin/bookings"); setBookings(await r.json());
  };
  const fetchPosts = async () => {
    const r = await fetch("/api/admin/posts"); setPosts(await r.json());
  };
  const fetchPages = async () => {
    const r = await fetch("/api/admin/pages"); setPages(await r.json());
  };
  const fetchInquiries = async () => {
    const r = await fetch("/api/admin/inquiries"); setInquiries(await r.json());
  };
  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    const r = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (r.ok) fetchInquiries();
  };
  const fetchSettings = async () => {
    const r = await fetch("/api/admin/settings"); setSettings(await r.json());
  };
  const fetchMenu = async () => {
    const r = await fetch("/api/menu"); setMenuItems(await r.json());
  };
  const fetchMedia = async () => {
    const r = await fetch("/api/admin/media"); setMedia(await r.json());
  };
  const deleteMedia = async (url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const filename = url.split("/").pop();
    const r = await fetch(`/api/admin/media/${filename}`, { method: "DELETE" });
    if (r.ok) fetchMedia();
  };

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    try {
      const url = authMode === "signin" ? "/api/admin/login" : "/api/admin/register";
      const body = authMode === "signin"
        ? { username: form.username, password: form.password }
        : { username: form.username, email: form.email, password: form.password, name: form.name };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("travelluxx_admin_token", data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || "Authentication failed");
      }
    } catch {
      setLoginError("Failed to connect to server");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem("travelluxx_admin_token"); setToken(null); };

  // ─── Bookings ────────────────────────────────────────────────────────────────
  const updateBookingStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    if (res.ok) fetchBookings();
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    const match = [b.id, b.passengerName, b.passengerEmail, b.passengerPhone, b.pickup, b.dropoff].some(v => (v || "").toLowerCase().includes(q));
    const statusMatch = statusFilter === "All" || (b.status || "Pending").toLowerCase() === statusFilter.toLowerCase();
    return match && statusMatch;
  });

  // ─── Posts ────────────────────────────────────────────────────────────────────
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({ title: "", slug: "", excerpt: "", content: "", image: "", published: true, metaTitle: "", metaDescription: "" });
  };
  const openEditPost = (post: any) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      image: post.image || "",
      published: post.published !== false,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || ""
    });
  };
  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPost ? `/api/admin/posts/${editingPost.id}` : "/api/admin/posts";
    const method = editingPost ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postForm)
    });
    if (res.ok) {
      setEditingPost(undefined);
      fetchPosts();
    }
  };
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) fetchPosts();
  };

  // ─── Pages ───────────────────────────────────────────────────────────────────
  const openNewPage = () => {
    setEditingPage(null);
    setPageForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "" });
  };
  const openEditPage = (page: any) => {
    setEditingPage(page);
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || ""
    });
  };
  const savePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPage ? `/api/admin/pages/${editingPage.id}` : "/api/admin/pages";
    const method = editingPage ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(pageForm) });
    fetchPages(); setEditingPage(undefined);
  };
  const deletePage = async (id: string) => {
    if (!confirm("Delete page?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" }); fetchPages();
  };

  // ─── Media Upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const data = await toBase64(file);
        const res = await fetch("/api/admin/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, data }) });
        const json = await res.json();
        if (json.url) setMedia(prev => [json.url, ...prev]);
      } catch (err) { console.error("Upload failed:", err); }
    }
    setUploading(false);
    fetchMedia();
  };

  // ─── Menu ─────────────────────────────────────────────────────────────────────
  const saveMenu = async () => {
    await fetch("/api/admin/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menuItems) });
    setSaveStatus("Menu saved!"); setTimeout(() => setSaveStatus(""), 3000);
  };
  const addMenuItem = () => {
    if (!newMenuItem.label || !newMenuItem.href) return;
    setMenuItems([...menuItems, { id: `menu-${Date.now()}`, ...newMenuItem }]);
    setNewMenuItem({ label: "", href: "", target: "_self" });
  };
  const moveMenuItem = (idx: number, dir: -1 | 1) => {
    const items = [...menuItems];
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    [items[idx], items[swap]] = [items[swap], items[idx]];
    setMenuItems(items);
  };
  const removeMenuItem = (id: string) => setMenuItems(menuItems.filter(m => m.id !== id));

  // ─── Settings ─────────────────────────────────────────────────────────────────
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSaveStatus("Saving...");
    const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (res.ok) { setSaveStatus("Settings saved!"); setTimeout(() => setSaveStatus(""), 4000); }
    else setSaveStatus("Failed to save.");
  };

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    leads: bookings.length,
    today: bookings.filter(b => b.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).length,
    revenue: bookings.reduce((s, b) => s + Number(b.price || 0), 0),
    inquiries: inquiries.length,
    posts: posts.length,
    pages: pages.length,
  };

  // ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f1] font-sans">
        <div className="bg-white shadow-xl rounded-sm w-full max-w-sm overflow-hidden">
          <div className="bg-[#1d2327] p-6 text-center">
            <div className="w-12 h-12 bg-[#2271b1] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <h1 className="text-white font-bold text-xl tracking-wide">Travelluxx Admin</h1>
            <p className="text-[#a7aaad] text-xs mt-1">Management Portal</p>
          </div>

          <form onSubmit={handleAuth} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1d2327] mb-1.5 uppercase tracking-wide">Username or Email</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm text-[#1d2327] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" placeholder="info@travelluxx.co.uk" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d2327] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-[#8c8f94] rounded px-3 py-2 pr-10 text-sm text-[#1d2327] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#50575e] hover:text-[#1d2327]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loginLoading}
              className="w-full bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold py-2.5 rounded transition text-sm disabled:opacity-60">
              {loginLoading ? "Please wait..." : "Log In"}
            </button>

            <p className="text-center text-xs text-[#646970]">
              Sign in with your admin credentials.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD LAYOUT ─────────────────────────────────────────────────────────
  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
    { id: "leads", icon: <BookOpen className="w-4 h-4" />, label: "Leads & Bookings" },
    { id: "inquiries", icon: <MessageSquare className="w-4 h-4" />, label: "Contact Inquiries" },
    { id: "posts", icon: <Newspaper className="w-4 h-4" />, label: "Posts (Blog)" },
    { id: "pages", icon: <FileText className="w-4 h-4" />, label: "Pages" },
    { id: "media", icon: <Image className="w-4 h-4" />, label: "Media" },
    { id: "menus", icon: <Menu className="w-4 h-4" />, label: "Menus" },
    { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f1] font-sans flex flex-col text-[#1d2327] text-sm">
      {/* WP Admin Bar */}
      <div className="bg-[#1d2327] text-[#a7aaad] text-xs flex items-center justify-between px-4 py-2 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#2271b1] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">T</span>
            </div>
            <span className="text-white font-semibold">Travelluxx</span>
          </div>
          <a href="/" target="_blank" className="flex items-center gap-1 hover:text-white transition">
            <ExternalLink className="w-3 h-3" /> Visit Site
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Administrator</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 hover:text-white transition">
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-[#1d2327] w-56 shrink-0 flex flex-col sticky top-9 h-[calc(100vh-36px)] overflow-y-auto z-40">
          <div className="py-4">
            <div className="px-4 py-2 mb-1">
              <p className="text-[#a7aaad] text-[10px] uppercase tracking-widest font-semibold">Navigation</p>
            </div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition text-[13px] font-medium ${
                  activeTab === item.id
                    ? "bg-[#2271b1] text-white"
                    : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === "leads" && bookings.length > 0 && (
                  <span className="ml-auto bg-[#2271b1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {bookings.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-0 overflow-y-auto">

          {/* ─── DASHBOARD ──────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1d2327]">Dashboard</h1>
                <p className="text-[#646970] text-xs mt-1">Welcome back! Here's an overview of your site.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Total Leads", value: stats.leads, color: "#2271b1" },
                  { label: "Today's Bookings", value: stats.today, color: "#00a32a" },
                  { label: "Total Revenue", value: `£${stats.revenue.toFixed(2)}`, color: "#d63638" },
                  { label: "Contact Inquiries", value: stats.inquiries, color: "#0284c7" },
                  { label: "Blog Posts", value: stats.posts, color: "#9c27b0" },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-[#c3c4c7] rounded shadow-sm p-5">
                    <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[#646970] text-xs mt-1 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-5">
                  <h3 className="font-semibold text-[#1d2327] mb-3 pb-2 border-b border-[#f0f0f1]">Recent Leads</h3>
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map(b => (
                      <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f0f0f1] last:border-0">
                        <div>
                          <span className="font-mono text-[#2271b1] font-bold">{b.id}</span>
                          <span className="text-[#646970] ml-2">{b.passengerName}</span>
                        </div>
                        <span className="font-bold text-[#1d2327]">£{Number(b.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-[#646970] text-xs">No leads yet.</p>}
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-5">
                  <h3 className="font-semibold text-[#1d2327] mb-3 pb-2 border-b border-[#f0f0f1]">Recent Inquiries</h3>
                  <div className="space-y-2">
                    {inquiries.slice(0, 5).map(i => (
                      <div key={i.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f0f0f1] last:border-0">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-[#1d2327]">{i.name}</span>
                          <span className="text-[#646970] text-[10px] ml-2 block truncate">{i.message}</span>
                        </div>
                        <span className="text-[#646970] text-[10px] whitespace-nowrap">{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    ))}
                    {inquiries.length === 0 && <p className="text-[#646970] text-xs">No inquiries yet.</p>}
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-5">
                  <h3 className="font-semibold text-[#1d2327] mb-3 pb-2 border-b border-[#f0f0f1]">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "+ New Post", tab: "posts" as Tab },
                      { label: "+ New Page", tab: "pages" as Tab },
                      { label: "Upload Media", tab: "media" as Tab },
                      { label: "Manage Menus", tab: "menus" as Tab },
                      { label: "Inquiries", tab: "inquiries" as Tab },
                      { label: "Settings", tab: "settings" as Tab },
                    ].map(l => (
                      <button key={l.label} onClick={() => setActiveTab(l.tab)}
                        className="block text-left text-xs text-[#2271b1] hover:text-[#135e96] py-1 hover:underline">
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── LEADS ──────────────────────────────────────────── */}
          {activeTab === "leads" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#1d2327]">Leads & Bookings</h1>
                <span className="text-[#646970] text-xs">{filteredBookings.length} of {bookings.length}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <input type="text" placeholder="Search by name, ref, location..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="border border-[#8c8f94] rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-[#2271b1]" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="border border-[#8c8f94] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#2271b1]">
                  <option value="All">All Statuses</option>
                  {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f0f0f1] text-[#646970] font-semibold uppercase text-[10px] tracking-wide border-b border-[#c3c4c7]">
                    <tr>
                      <th className="py-3 px-4 text-left">Ref #</th>
                      <th className="py-3 px-4 text-left">Passenger</th>
                      <th className="py-3 px-4 text-left">Date / Time</th>
                      <th className="py-3 px-4 text-left">Route</th>
                      <th className="py-3 px-4 text-left">Vehicle</th>
                      <th className="py-3 px-4 text-left">Fare</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-10 text-[#646970]">No leads found.</td></tr>
                    ) : filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-[#f9f9f9] transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#2271b1]">{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1d2327]">{b.passengerName}</div>
                          <div className="text-[#646970]">{b.passengerPhone}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[#646970]">{b.date}<br />{b.time}</td>
                        <td className="py-3 px-4 max-w-[180px]">
                          <div className="truncate"><span className="text-emerald-600 font-bold">↑</span> {b.pickup}</div>
                          <div className="truncate text-[#646970]"><span className="text-red-500 font-bold">↓</span> {b.dropoff}</div>
                        </td>
                        <td className="py-3 px-4 text-[#646970]">{b.vehicle}</td>
                        <td className="py-3 px-4 font-bold text-[#1d2327]">£{Number(b.price || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <select value={b.status || "Pending"} onChange={e => updateBookingStatus(b.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded border focus:outline-none ${
                              (b.status || "") === "Confirmed" ? "border-green-300 bg-green-50 text-green-700"
                              : (b.status || "") === "Completed" ? "border-blue-300 bg-blue-50 text-blue-700"
                              : (b.status || "") === "Cancelled" ? "border-red-300 bg-red-50 text-red-700"
                              : "border-yellow-300 bg-yellow-50 text-yellow-700"
                            }`}>
                            {["Pending", "Confirmed", "Completed", "Cancelled"].map(s => <option key={s} className="bg-white text-[#1d2327]">{s}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button onClick={() => setSelectedBooking(b)}
                            className="bg-[#2271b1] hover:bg-[#135e96] text-white px-2.5 py-1 rounded text-[10px] font-semibold transition">View</button>
                          <button onClick={() => deleteBooking(b.id)}
                            className="bg-[#d63638] hover:bg-[#b32d2e] text-white px-2.5 py-1 rounded text-[10px] font-semibold transition">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── POSTS ──────────────────────────────────────────── */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-4 mb-2">
                <h1 className="text-2xl font-semibold text-[#23282d] font-serif">Posts</h1>
                {editingPost === undefined && (
                  <button onClick={openNewPost}
                    className="border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fa] hover:text-[#0a4b78] px-2.5 py-1 rounded text-xs font-semibold transition bg-white shadow-sm">
                    Add New
                  </button>
                )}
              </div>

              {editingPost !== undefined ? (
                <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
                  <h2 className="font-bold text-[#1d2327] mb-4 pb-3 border-b border-[#f0f0f1]">
                    {editingPost ? "Edit Post" : "Add New Post"}
                  </h2>
                  <form onSubmit={savePost} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Main Content (3 cols) */}
                    <div className="lg:col-span-3 space-y-4">
                      <input
                        type="text"
                        placeholder="Add Title"
                        value={postForm.title}
                        onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded-sm px-3 py-2.5 text-lg font-semibold focus:outline-none focus:border-[#2271b1] bg-white text-[#2c3338]"
                        required
                      />

                      {postForm.slug && (
                        <div className="text-xs text-[#646970]">
                          <strong>Permalink:</strong> {window.location.origin}/blog/{postForm.slug}
                        </div>
                      )}

                      <div className="bg-white border border-[#c3c4c7] rounded-sm p-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1d2327] mb-2 uppercase tracking-wider text-[#646970]">Excerpt Summary</label>
                          <textarea rows={2} value={postForm.excerpt} onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })}
                            className="w-full border border-[#8c8f94] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1d2327] mb-2 uppercase tracking-wider text-[#646970]">Post Body</label>
                          <ReactQuill theme="snow" value={postForm.content} onChange={val => setPostForm({ ...postForm, content: val })} modules={quillModules} />
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar Content (1 col) */}
                    <div className="space-y-4">
                      {/* Publish Panel */}
                      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                        <div className="border-b border-[#f0f0f1] px-4 py-2.5 bg-[#f6f7f7]">
                          <h3 className="font-semibold text-xs text-[#2c3338]">Publish</h3>
                        </div>
                        <div className="p-4 space-y-3 text-xs text-[#50575e]">
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <span className="font-bold text-[#2c3338]">{postForm.published ? "Published" : "Draft"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Visibility:</span>
                            <span className="font-bold text-[#2c3338]">Public</span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <input type="checkbox" id="pub" checked={postForm.published} onChange={e => setPostForm({ ...postForm, published: e.target.checked })}
                              className="rounded border-[#8c8f94]" />
                            <label htmlFor="pub" className="text-xs font-medium text-[#1d2327]">Publish (visible on blog)</label>
                          </div>
                        </div>
                        <div className="bg-[#f6f7f7] border-t border-[#f0f0f1] px-4 py-3 flex justify-between items-center">
                          <button type="button" onClick={() => setEditingPost(undefined)}
                            className="text-[#b32d2e] hover:underline text-xs font-semibold">
                            Cancel
                          </button>
                          <button type="submit" className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition">
                            {editingPost ? "Update Post" : "Publish Post"}
                          </button>
                        </div>
                      </div>

                      {/* Featured Image Panel */}
                      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                        <div className="border-b border-[#f0f0f1] px-4 py-2.5 bg-[#f6f7f7]">
                          <h3 className="font-semibold text-xs text-[#2c3338]">Featured Image</h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex gap-2">
                            <input type="text" value={postForm.image} onChange={e => setPostForm({ ...postForm, image: e.target.value })}
                              placeholder="Image URL"
                              className="flex-1 border border-[#8c8f94] rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                            <label className="bg-[#f0f0f1] hover:bg-[#dcdcde] text-[#50575e] border border-[#c3c4c7] px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition flex items-center shadow-sm">
                              Upload
                              <input type="file" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const base64 = await toBase64(file);
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ filename: file.name, data: base64 })
                                  });
                                  const json = await res.json();
                                  if (json.url) setPostForm(prev => ({ ...prev, image: json.url }));
                                }
                              }} className="hidden" />
                            </label>
                          </div>
                          {postForm.image && (
                            <div className="relative group aspect-video rounded border border-[#c3c4c7] overflow-hidden bg-slate-50 flex items-center justify-center">
                              <img src={postForm.image} alt="preview" className="max-w-full max-h-full object-cover" />
                              <button type="button" onClick={() => setPostForm({ ...postForm, image: "" })}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-700">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SEO Settings Panel */}
                      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                        <div className="border-b border-[#f0f0f1] px-4 py-2.5 bg-[#f6f7f7]">
                          <h3 className="font-semibold text-xs text-[#2c3338]">SEO Settings</h3>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-1 uppercase tracking-wide">Meta Title</label>
                            <input type="text" value={postForm.metaTitle} onChange={e => setPostForm({ ...postForm, metaTitle: e.target.value })}
                              placeholder="Google title..."
                              className="w-full border border-[#8c8f94] rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-1 uppercase tracking-wide">Meta Description</label>
                            <textarea rows={3} value={postForm.metaDescription} onChange={e => setPostForm({ ...postForm, metaDescription: e.target.value })}
                              placeholder="Snippet description..."
                              className="w-full border border-[#8c8f94] rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-[#50575e] space-x-1.5 mb-2">
                    <span className="font-semibold text-[#000]">All ({posts.length})</span>
                    <span className="text-[#c3c4c7]">|</span>
                    <span className="text-[#2271b1] hover:underline cursor-pointer">Published ({posts.filter(p => p.published !== false).length})</span>
                    <span className="text-[#c3c4c7]">|</span>
                    <span className="text-[#2271b1] hover:underline cursor-pointer">Drafts ({posts.filter(p => p.published === false).length})</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between bg-transparent py-1 text-xs">
                    <div className="flex gap-1.5 items-center">
                      <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none">
                        <option>Bulk Actions</option>
                        <option>Delete</option>
                      </select>
                      <button className="border border-[#8c8f94] bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2c3338] px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition">
                        Apply
                      </button>

                      <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none ml-2">
                        <option>All dates</option>
                      </select>
                      <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none">
                        <option>All categories</option>
                      </select>
                      <button className="border border-[#8c8f94] bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2c3338] px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition">
                        Filter
                      </button>
                    </div>
                    <div>
                      <input type="text" placeholder="Search Posts" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs outline-none focus:border-[#2271b1]" />
                    </div>
                  </div>

                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
                    <table className="w-full text-[13px] border-collapse">
                      <thead className="bg-white border-b border-[#c3c4c7] text-[#2c3338] font-semibold text-left">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94]" /></th>
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Author</th>
                          <th className="py-2.5 px-3">Categories</th>
                          <th className="py-2.5 px-3">Tags</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f1] text-[#2c3338]">
                        {posts.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-8 text-[#646970]">No posts found.</td></tr>
                        ) : posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                          <tr key={p.id} className="hover:bg-[#f6f7f7] transition group">
                            <td className="py-3 px-3 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94]" /></td>
                            <td className="py-3 px-3 font-semibold text-[#2271b1] max-w-xs">
                              <span onClick={() => openEditPost(p)} className="hover:text-[#00a0d2] cursor-pointer text-sm block mb-1">{p.title}</span>
                              <div className="hidden group-hover:flex items-center gap-1.5 text-xs font-normal text-[#555] select-none">
                                <button onClick={() => openEditPost(p)} className="text-[#2271b1] hover:text-[#00a0d2]">Edit</button>
                                <span className="text-[#ddd]">|</span>
                                <button onClick={() => deletePost(p.id)} className="text-[#b32d2e] hover:text-[#d63638]">Trash</button>
                                <span className="text-[#ddd]">|</span>
                                <a href={`/blog/${p.slug}`} target="_blank" className="text-[#2271b1] hover:text-[#00a0d2]">View</a>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-[#50575e]">Travelluxx Admin</td>
                            <td className="py-3 px-3 text-[#2271b1] hover:underline cursor-pointer">Blog</td>
                            <td className="py-3 px-3 text-[#50575e]">—</td>
                            <td className="py-3 px-3 text-[#50575e]">
                              <span className="font-semibold text-xs text-[#2c3338]">{p.published !== false ? "Published" : "Draft"}</span><br />
                              {p.date || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── PAGES ──────────────────────────────────────────── */}
          {activeTab === "pages" && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-4 mb-2">
                <h1 className="text-2xl font-semibold text-[#23282d] font-serif">Pages</h1>
                {editingPage === undefined && (
                  <button onClick={openNewPage}
                    className="border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fa] hover:text-[#0a4b78] px-2.5 py-1 rounded text-xs font-semibold transition bg-white shadow-sm">
                    Add New
                  </button>
                )}
              </div>

              {editingPage !== undefined ? (
                <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
                  <h2 className="font-bold text-[#1d2327] mb-4 pb-3 border-b border-[#f0f0f1]">
                    {editingPage ? "Edit Page" : "Add New Page"}
                  </h2>
                  <form onSubmit={savePage} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Main Content (3 cols) */}
                    <div className="lg:col-span-3 space-y-4">
                      <input
                        type="text"
                        placeholder="Add Title"
                        value={pageForm.title}
                        onChange={e => setPageForm({ ...pageForm, title: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded-sm px-3 py-2.5 text-lg font-semibold focus:outline-none focus:border-[#2271b1] bg-white text-[#2c3338]"
                        required
                      />

                      {pageForm.slug && (
                        <div className="text-xs text-[#646970]">
                          <strong>Permalink:</strong> {window.location.origin}/page/{pageForm.slug}
                        </div>
                      )}

                      <div className="bg-white border border-[#c3c4c7] rounded-sm p-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1d2327] mb-2 uppercase tracking-wider text-[#646970]">Page Content</label>
                          <ReactQuill theme="snow" value={pageForm.content} onChange={val => setPageForm({ ...pageForm, content: val })} modules={quillModules} />
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar Content (1 col) */}
                    <div className="space-y-4">
                      {/* Publish Panel */}
                      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                        <div className="border-b border-[#f0f0f1] px-4 py-2.5 bg-[#f6f7f7]">
                          <h3 className="font-semibold text-xs text-[#2c3338]">Publish</h3>
                        </div>
                        <div className="p-4 space-y-3 text-xs text-[#50575e]">
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <span className="font-bold text-[#2c3338]">Published</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Visibility:</span>
                            <span className="font-bold text-[#2c3338]">Public</span>
                          </div>
                        </div>
                        <div className="bg-[#f6f7f7] border-t border-[#f0f0f1] px-4 py-3 flex justify-between items-center">
                          <button type="button" onClick={() => setEditingPage(undefined)}
                            className="text-[#b32d2e] hover:underline text-xs font-semibold">
                            Cancel
                          </button>
                          <button type="submit" className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition">
                            {editingPage ? "Update Page" : "Publish Page"}
                          </button>
                        </div>
                      </div>

                      {/* SEO Settings Panel */}
                      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm">
                        <div className="border-b border-[#f0f0f1] px-4 py-2.5 bg-[#f6f7f7]">
                          <h3 className="font-semibold text-xs text-[#2c3338]">SEO Settings</h3>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-1 uppercase tracking-wide">Meta Title</label>
                            <input type="text" value={pageForm.metaTitle} onChange={e => setPageForm({ ...pageForm, metaTitle: e.target.value })}
                              placeholder="Google title..."
                              className="w-full border border-[#8c8f94] rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#646970] mb-1 uppercase tracking-wide">Meta Description</label>
                            <textarea rows={3} value={pageForm.metaDescription} onChange={e => setPageForm({ ...pageForm, metaDescription: e.target.value })}
                              placeholder="Snippet description..."
                              className="w-full border border-[#8c8f94] rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2271b1] text-[#2c3338]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-[#50575e] space-x-1.5 mb-2">
                    <span className="font-semibold text-[#000]">All ({pages.length})</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between bg-transparent py-1 text-xs">
                    <div className="flex gap-1.5 items-center">
                      <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none">
                        <option>Bulk Actions</option>
                        <option>Delete</option>
                      </select>
                      <button className="border border-[#8c8f94] bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[#2c3338] px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition">
                        Apply
                      </button>
                    </div>
                    <div>
                      <input type="text" placeholder="Search Pages" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs outline-none focus:border-[#2271b1]" />
                    </div>
                  </div>

                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
                    <table className="w-full text-[13px] border-collapse">
                      <thead className="bg-white border-b border-[#c3c4c7] text-[#2c3338] font-semibold text-left">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94]" /></th>
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Slug / URL</th>
                          <th className="py-2.5 px-3">Author</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f1] text-[#2c3338]">
                        {pages.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-8 text-[#646970]">No pages found.</td></tr>
                        ) : pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                          <tr key={p.id} className="hover:bg-[#f6f7f7] transition group">
                            <td className="py-3 px-3 text-center"><input type="checkbox" className="rounded-sm border-[#8c8f94]" /></td>
                            <td className="py-3 px-3 font-semibold text-[#2271b1] max-w-xs">
                              <span onClick={() => openEditPage(p)} className="hover:text-[#00a0d2] cursor-pointer text-sm block mb-1">{p.title}</span>
                              <div className="hidden group-hover:flex items-center gap-1.5 text-xs font-normal text-[#555] select-none">
                                <button onClick={() => openEditPage(p)} className="text-[#2271b1] hover:text-[#00a0d2]">Edit</button>
                                <span className="text-[#ddd]">|</span>
                                <button onClick={() => deletePage(p.id)} className="text-[#b32d2e] hover:text-[#d63638]">Trash</button>
                                <span className="text-[#ddd]">|</span>
                                <a href={`/page/${p.slug}`} target="_blank" className="text-[#2271b1] hover:text-[#00a0d2]">View</a>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[#2271b1]">/page/{p.slug}</td>
                            <td className="py-3 px-3 text-[#50575e]">Travelluxx Admin</td>
                            <td className="py-3 px-3 text-[#50575e]">Published</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── INQUIRIES ───────────────────────────────────────── */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#1d2327]">Contact Inquiries</h1>
                <span className="text-[#646970] text-xs">{inquiries.length} total inquiries</span>
              </div>
              <div className="bg-white border border-[#c3c4c7] rounded shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f0f0f1] text-[#646970] font-semibold uppercase text-[10px] tracking-wide border-b border-[#c3c4c7]">
                    <tr>
                      <th className="py-3 px-4 text-left">Sender Details</th>
                      <th className="py-3 px-4 text-left">Message</th>
                      <th className="py-3 px-4 text-left">Type / Subject</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f1]">
                    {inquiries.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-[#646970]">No contact inquiries found.</td></tr>
                    ) : inquiries.map(i => (
                      <tr key={i.id} className="hover:bg-[#f9f9f9] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1d2327]">{i.name}</div>
                          <div className="text-[#646970] font-mono">{i.email}</div>
                          {i.phone && <div className="text-[#646970]">{i.phone}</div>}
                        </td>
                        <td className="py-3 px-4 max-w-[280px]">
                          <p className="whitespace-pre-line text-[#1d2327]">{i.message}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#2271b1] font-semibold">{i.type || "General Inquiry"}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[#646970]">
                          {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "N/A"}<br />
                          {i.createdAt ? new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button onClick={() => setSelectedInquiry(i)}
                            className="bg-[#2271b1] hover:bg-[#135e96] text-white px-2.5 py-1 rounded text-[10px] font-semibold transition">
                            View
                          </button>
                          <button onClick={() => deleteInquiry(i.id)}
                            className="bg-[#d63638] hover:bg-[#b32d2e] text-white px-2.5 py-1 rounded text-[10px] font-semibold transition">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── MEDIA ──────────────────────────────────────────── */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-4 mb-2">
                <h1 className="text-2xl font-semibold text-[#23282d] font-serif">Media Library</h1>
                <button onClick={() => fileInputRef.current?.click()}
                  className="border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fa] hover:text-[#0a4b78] px-2.5 py-1 rounded text-xs font-semibold transition bg-white shadow-sm">
                  Add New
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => handleFileUpload(e.target.files)} />
              </div>

              {/* WordPress style filters and View Switcher */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-transparent py-1 text-xs">
                <div className="flex gap-2 items-center">
                  {/* Grid view icon */}
                  <button onClick={() => setMediaViewMode("grid")} className={`p-1.5 border rounded-sm ${mediaViewMode === "grid" ? "bg-[#e0e0e0] border-[#8c8f94]" : "bg-white border-[#c3c4c7]"} hover:bg-slate-50 transition`}>
                    <svg className="w-3.5 h-3.5 text-[#2c3338]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
                  </button>
                  {/* List view icon */}
                  <button onClick={() => setMediaViewMode("list")} className={`p-1.5 border rounded-sm ${mediaViewMode === "list" ? "bg-[#e0e0e0] border-[#8c8f94]" : "bg-white border-[#c3c4c7]"} hover:bg-slate-50 transition`}>
                    <svg className="w-3.5 h-3.5 text-[#2c3338]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"/></svg>
                  </button>

                  <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none ml-2">
                    <option>All media items</option>
                  </select>
                  <select className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs text-[#2c3338] outline-none">
                    <option>All dates</option>
                  </select>
                </div>
                <div>
                  <input type="text" placeholder="Search media items" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="border border-[#8c8f94] bg-white rounded px-2.5 py-1 text-xs outline-none focus:border-[#2271b1]" />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition ${uploading ? "border-[#2271b1] bg-blue-50" : "border-[#c3c4c7] hover:border-[#2271b1] bg-white"}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-[#8c8f94]" />
                <p className="text-[#646970] font-medium text-xs">{uploading ? "Uploading files..." : "Drag & drop images here to upload, or click to browse"}</p>
              </div>

              {media.length > 0 ? (
                mediaViewMode === "grid" ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 bg-white border border-[#c3c4c7] p-4 rounded-sm shadow-sm">
                    {media.filter(url => url.toLowerCase().includes(searchQuery.toLowerCase())).map((url, i) => (
                      <div key={i} onClick={() => setSelectedMedia(url)} className="aspect-square bg-slate-50 border border-[#c3c4c7] hover:border-[#2271b1] cursor-pointer relative overflow-hidden group shadow-sm">
                        <img src={url} alt={`media-${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[#2c3338] font-semibold">
                        <tr>
                          <th className="py-2 px-3 w-16">File</th>
                          <th className="py-2 px-3">Name / URL</th>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f1] text-[#50575e]">
                        {media.filter(url => url.toLowerCase().includes(searchQuery.toLowerCase())).map((url, i) => {
                          const filename = url.split("/").pop() || "";
                          return (
                            <tr key={i} className="hover:bg-[#f6f7f7] transition group">
                              <td className="py-2 px-3">
                                <img src={url} alt="" className="w-10 h-10 object-cover border border-[#c3c4c7] rounded-sm" />
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-semibold text-[#2c3338]">{filename}</div>
                                <div className="font-mono text-[#2271b1] text-[10px] select-all">{window.location.origin + url}</div>
                              </td>
                              <td className="py-2 px-3 text-[#646970]">Uploaded</td>
                              <td className="py-2 px-3 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + url);
                                    alert("Image URL copied!");
                                  }}
                                  className="text-[#2271b1] hover:underline"
                                >
                                  Copy Link
                                </button>
                                <span className="text-[#ddd]">|</span>
                                <button
                                  onClick={() => deleteMedia(url)}
                                  className="text-[#b32d2e] hover:underline"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-10 bg-white border border-[#c3c4c7] rounded-sm text-slate-400 text-xs shadow-sm">
                  No uploaded files found. Upload some images to display them here!
                </div>
              )}
            </div>
          )}

          {/* ─── MENUS ──────────────────────────────────────────── */}
          {activeTab === "menus" && (
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-2xl font-bold text-[#1d2327]">Menu Manager</h1>
              <p className="text-[#646970] text-xs">Manage the navigation links shown in the website header. Reorder by using the arrows. Changes saved to database.</p>

              {saveStatus && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-xs font-medium">{saveStatus}</div>
              )}

              <div className="bg-white border border-[#c3c4c7] rounded shadow-sm">
                <div className="px-5 py-3 border-b border-[#f0f0f1]">
                  <h3 className="font-semibold text-[#1d2327] text-sm">Header Navigation Items</h3>
                </div>
                <div className="divide-y divide-[#f0f0f1]">
                  {menuItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveMenuItem(idx, -1)} disabled={idx === 0}
                          className="p-0.5 hover:bg-[#f0f0f1] rounded disabled:opacity-30 disabled:cursor-not-allowed">
                          <ChevronUp className="w-3.5 h-3.5 text-[#646970]" />
                        </button>
                        <button onClick={() => moveMenuItem(idx, 1)} disabled={idx === menuItems.length - 1}
                          className="p-0.5 hover:bg-[#f0f0f1] rounded disabled:opacity-30 disabled:cursor-not-allowed">
                          <ChevronDown className="w-3.5 h-3.5 text-[#646970]" />
                        </button>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input type="text" value={item.label} onChange={e => {
                          const updated = [...menuItems]; updated[idx] = { ...updated[idx], label: e.target.value }; setMenuItems(updated);
                        }} placeholder="Label" className="border border-[#8c8f94] rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#2271b1]" />
                        <input type="text" value={item.href} onChange={e => {
                          const updated = [...menuItems]; updated[idx] = { ...updated[idx], href: e.target.value }; setMenuItems(updated);
                        }} placeholder="Link e.g. /blog or /#calculator" className="border border-[#8c8f94] rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#2271b1]" />
                      </div>
                      <select value={item.target} onChange={e => {
                        const updated = [...menuItems]; updated[idx] = { ...updated[idx], target: e.target.value }; setMenuItems(updated);
                      }} className="border border-[#8c8f94] rounded px-2 py-1.5 text-xs focus:outline-none">
                        <option value="_self">Same tab</option>
                        <option value="_blank">New tab</option>
                      </select>
                      <button onClick={() => removeMenuItem(item.id)}
                        className="text-[#d63638] hover:text-[#b32d2e] p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new item */}
                <div className="px-5 py-3 border-t border-[#f0f0f1] bg-[#f9f9f9]">
                  <div className="flex items-center gap-3">
                    <input type="text" value={newMenuItem.label} onChange={e => setNewMenuItem({ ...newMenuItem, label: e.target.value })}
                      placeholder="Label" className="border border-[#8c8f94] rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#2271b1] flex-1" />
                    <input type="text" value={newMenuItem.href} onChange={e => setNewMenuItem({ ...newMenuItem, href: e.target.value })}
                      placeholder="/blog or /#section" className="border border-[#8c8f94] rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#2271b1] flex-1" />
                    <button onClick={addMenuItem}
                      className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={saveMenu}
                className="bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2 rounded text-sm font-semibold flex items-center gap-2 transition">
                <Save className="w-4 h-4" /> Save Menu Changes
              </button>
            </div>
          )}

          {/* ─── SETTINGS ─────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-2xl font-bold text-[#1d2327]">Settings</h1>

              {saveStatus && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm font-medium">{saveStatus}</div>
              )}

              <form onSubmit={saveSettings} className="space-y-6">
                {/* Mollie */}
                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-6">
                  <h2 className="font-bold text-[#1d2327] text-sm mb-4 pb-2 border-b border-[#f0f0f1] flex items-center gap-2">
                    💳 Mollie Payment Gateway
                  </h2>
                  <div>
                    <label className="block text-xs font-semibold text-[#1d2327] mb-1">Mollie API Key (Live / Test)</label>
                    <input type="password" value={settings.mollie_api_key || ""}
                      onChange={e => setSettings({ ...settings, mollie_api_key: e.target.value })}
                      placeholder="live_... or test_..."
                      className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2271b1]" />
                    <p className="text-[#646970] text-xs mt-1">This updates your local .env file MOLLIE_API_KEY automatically.</p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-6">
                  <h2 className="font-bold text-[#1d2327] text-sm mb-4 pb-2 border-b border-[#f0f0f1]">
                    🏢 Business Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1d2327] mb-1">Business Name</label>
                      <input type="text" value={settings.business_name || ""}
                        onChange={e => setSettings({ ...settings, business_name: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d2327] mb-1">Business Email</label>
                      <input type="email" value={settings.business_email || ""}
                        onChange={e => setSettings({ ...settings, business_email: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d2327] mb-1">WhatsApp Number</label>
                      <input type="text" value={settings.whatsapp_number || ""}
                        onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1d2327] mb-1">Office Address</label>
                      <input type="text" value={settings.office_address || ""}
                        onChange={e => setSettings({ ...settings, office_address: e.target.value })}
                        className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#1d2327] mb-1">Footer Copyright Line</label>
                      <input type="text" value={settings.footer_info || ""}
                        onChange={e => setSettings({ ...settings, footer_info: e.target.value })}
                        placeholder="© 2026 Travelluxx. All rights reserved."
                        className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                      <p className="text-[#646970] text-xs mt-1">This text displays in the website footer.</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white border border-[#c3c4c7] rounded shadow-sm p-6">
                  <h2 className="font-bold text-[#1d2327] text-sm mb-4 pb-2 border-b border-[#f0f0f1]">
                    🚖 Default Pricing Rates (£ per mile)
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "economy_price", label: "Economy" },
                      { key: "luxury_price", label: "Luxury" },
                      { key: "family_price", label: "Family" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-[#1d2327] mb-1">{f.label} (£)</label>
                        <input type="number" step="0.10" value={settings[f.key] || ""}
                          onChange={e => setSettings({ ...settings, [f.key]: parseFloat(e.target.value) })}
                          className="w-full border border-[#8c8f94] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2271b1]" />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit"
                  className="bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2.5 rounded text-sm font-semibold flex items-center gap-2 transition">
                  <Save className="w-4 h-4" /> Save All Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#f0f0f1]">
              <div>
                <span className="font-mono text-[#2271b1] font-bold text-sm">{selectedBooking.id}</span>
                <h3 className="font-bold text-[#1d2327]">Lead Details</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-[#646970] hover:text-[#1d2327] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Passenger</span>
                  <span className="text-[#1d2327] font-bold">{selectedBooking.passengerName}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Phone</span>
                  <span className="text-[#1d2327] font-bold">{selectedBooking.passengerPhone}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1] col-span-2">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Email</span>
                  <span className="text-[#1d2327]">{selectedBooking.passengerEmail}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1] col-span-2">
                  <span className="text-emerald-600 font-bold block">Pickup: </span>{selectedBooking.pickup}
                  <span className="text-red-500 font-bold block mt-1">Dropoff: </span>{selectedBooking.dropoff}
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Date & Time</span>
                  <span className="text-[#1d2327] font-bold">{selectedBooking.date} {selectedBooking.time}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Total Fare</span>
                  <span className="text-[#2271b1] font-extrabold text-base">£{Number(selectedBooking.price || 0).toFixed(2)}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Vehicle</span>
                  <span className="text-[#1d2327] font-bold">{selectedBooking.vehicle} Class</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Payment</span>
                  <span className="text-[#1d2327]">{selectedBooking.paymentMethod} ({selectedBooking.paymentStatus || "Unpaid"})</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#f0f0f1] flex justify-end">
              <button onClick={() => setSelectedBooking(null)}
                className="bg-[#f0f0f1] hover:bg-[#dcdcde] text-[#50575e] px-4 py-2 rounded text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white shadow-xl rounded-sm w-full max-w-lg border border-[#c3c4c7]">
            <div className="bg-[#1d2327] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Contact Inquiry Details</h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-[#a7aaad] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Sender Name</span>
                  <span className="text-[#1d2327] font-bold">{selectedInquiry.name}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Phone Number</span>
                  <span className="text-[#1d2327] font-bold">{selectedInquiry.phone || "N/A"}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1] col-span-2">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Email Address</span>
                  <span className="text-[#1d2327]">{selectedInquiry.email}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Type / Subject</span>
                  <span className="text-[#2271b1] font-semibold">{selectedInquiry.type || "General Inquiry"}</span>
                </div>
                <div className="bg-[#f9f9f9] p-3 rounded border border-[#f0f0f1]">
                  <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Received At</span>
                  <span className="text-[#1d2327]">{selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>
              <div className="bg-[#f9f9f9] p-4 rounded border border-[#f0f0f1]">
                <span className="text-[#646970] text-[10px] uppercase font-semibold block mb-1">Message</span>
                <p className="text-[#1d2327] whitespace-pre-wrap text-sm leading-relaxed">{selectedInquiry.message}</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#f0f0f1] flex justify-end gap-2">
              <button
                onClick={async () => {
                  await deleteInquiry(selectedInquiry.id);
                  setSelectedInquiry(null);
                }}
                className="bg-[#d63638] hover:bg-[#b32d2e] text-white px-4 py-2 rounded text-sm font-semibold transition"
              >
                Delete Inquiry
              </button>
              <button onClick={() => setSelectedInquiry(null)}
                className="bg-[#f0f0f1] hover:bg-[#dcdcde] text-[#50575e] px-4 py-2 rounded text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white shadow-xl rounded-sm w-full max-w-3xl border border-[#c3c4c7] flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            {/* Left side preview */}
            <div className="flex-1 bg-[#f1f1f1] flex items-center justify-center p-6 min-h-[300px] max-h-[500px]">
              <img src={selectedMedia} alt="media preview" className="max-w-full max-h-full object-contain border border-[#c3c4c7] bg-white shadow-sm" />
            </div>

            {/* Right side metadata/actions */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#c3c4c7] p-5 flex flex-col justify-between bg-[#f6f7f7] text-xs">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-[#ddd] pb-2">
                  <h3 className="font-bold text-[#2c3338] text-sm">Attachment Details</h3>
                  <button onClick={() => setSelectedMedia(null)} className="text-[#a7aaad] hover:text-[#2c3338] transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-[#50575e]">
                  <div>
                    <span className="font-semibold block text-[#2c3338]">File name:</span>
                    <span className="break-all font-mono text-[11px]">{selectedMedia.split("/").pop()}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-[#2c3338]">File type:</span>
                    <span>image/jpeg</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-[#2c3338]">URL:</span>
                    <input
                      type="text"
                      readOnly
                      value={window.location.origin + selectedMedia}
                      onClick={e => (e.target as HTMLInputElement).select()}
                      className="w-full border border-[#8c8f94] bg-white rounded-sm px-2 py-1.5 mt-1 font-mono text-[11px] outline-none text-[#2c3338]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ddd] pt-4 mt-6 flex justify-between items-center gap-2">
                <button
                  onClick={async () => {
                    await deleteMedia(selectedMedia);
                    setSelectedMedia(null);
                  }}
                  className="text-[#b32d2e] hover:text-[#d63638] font-semibold hover:underline"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + selectedMedia);
                    alert("Image URL copied!");
                  }}
                  className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1.5 rounded-sm text-xs font-semibold shadow-sm transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
