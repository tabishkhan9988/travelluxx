import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar onScrollTo={() => {}} />

      <main className="flex-1 w-full">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <span className="text-emerald-600 font-semibold text-xs tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-4">
              Travelluxx Journal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Luxury Travel & News</h1>
            <p className="text-slate-500 text-base mt-3 max-w-xl">
              Insights, airport guides, and executive travel articles from our chauffeur team.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-12 w-full">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading articles...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No blog articles available yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-400 hover:shadow-lg transition duration-300 flex flex-col group"
                >
                  {post.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-600 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                        {post.date}
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition leading-snug">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 pt-2"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onScrollTo={() => {}} />
    </div>
  );
}
