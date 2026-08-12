import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/posts/${slug}`)
      .then((res) => res.json())
      .then((data) => { if (!data.error) setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  // Set SEO meta tags
  useEffect(() => {
    if (post) {
      document.title = post.metaTitle || post.title || "Blog | Travelluxx";
      const meta = document.querySelector("meta[name='description']");
      if (meta) meta.setAttribute("content", post.metaDescription || post.excerpt || "");
    }
  }, [post]);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar onScrollTo={() => {}} />

      <main className="flex-1 w-full">
        {loading ? (
          <div className="text-center py-32 text-slate-400">Loading article...</div>
        ) : !post ? (
          <div className="text-center py-32 text-slate-400">
            <p className="text-2xl font-bold text-slate-600 mb-3">Article Not Found</p>
            <Link to="/blog" className="text-emerald-600 hover:underline font-semibold text-sm">← Back to Blog</Link>
          </div>
        ) : (
          <>
            {/* Hero image */}
            {post.image && (
              <div className="w-full h-72 md:h-96 overflow-hidden relative">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto px-6">
                  <div className="flex items-center gap-3 text-xs text-white/80 font-mono mb-2">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded font-bold">{post.date}</span>
                    <span>By {post.author || "Travelluxx Editorial"}</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-10 w-full">
              {/* Breadcrumb */}
              <Link to="/blog" className="text-xs text-emerald-600 hover:underline font-bold mb-6 inline-block">
                ← Back to Articles
              </Link>

              {/* Title if no image */}
              {!post.image && (
                <header className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded border border-emerald-200 font-bold">{post.date}</span>
                    <span>By {post.author || "Travelluxx Editorial"}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">{post.title}</h1>
                </header>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-slate-500 text-base italic border-l-4 border-emerald-500 pl-4 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div
                className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed 
                           prose-h2:text-slate-900 prose-h3:text-slate-800 prose-a:text-emerald-600
                           prose-strong:text-slate-900 prose-li:text-slate-600"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </>
        )}
      </main>

      <Footer onScrollTo={() => {}} />
    </div>
  );
}
