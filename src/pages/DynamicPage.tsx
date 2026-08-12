import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/pages/${slug}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setPage(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle || page.title || "Travelluxx";
      const meta = document.querySelector("meta[name='description']");
      if (meta) meta.setAttribute("content", page.metaDescription || "");
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar onScrollTo={() => {}} />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading page...</div>
        ) : !page ? (
          <div className="text-center py-20 text-slate-400">Page not found.</div>
        ) : (
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-8">{page.title}</h1>
            <div
              className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        )}
      </main>
      <Footer onScrollTo={() => {}} />
    </div>
  );
}
