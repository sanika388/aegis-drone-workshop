'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Clock, 
  Search, 
  Layers, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Hash,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ResearchPublicationsPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPapers() {
      try {
        const { data } = await supabase
          .from('research_papers')
          .select('*')
          .order('published_at', { ascending: false });

        if (data && data.length > 0) {
          setPapers(data);
        }
      } catch (err) {
        console.error('Failed to load papers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPapers();
  }, []);

  const categories = ['All', 'Flight Dynamics & Control', 'Aerostructures & Propulsion'];

  const filteredPapers = papers.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AEGIS AEROSPACE & AVIONICS RESEARCH ARCHIVE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
          Aerospace Research & Technical Papers
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-3xl leading-relaxed">
          Open-access mathematical derivations, non-linear 6-DOF flight dynamics formulations, Extended Kalman Filter (EKF) sensor fusion architectures, and high-frequency deterministic real-time OS telemetry benchmarks.
        </p>
      </div>

      {/* Scientific Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-y border-[#1e2538] py-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neon text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                  : 'bg-[#10131d] text-gray-400 hover:text-white border border-[#212b3e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equations, EKF, State-Space..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#212b3e] text-white font-mono text-xs outline-none focus:border-neon"
          />
        </div>
      </div>

      {/* Publications Listing */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-gray-400">Querying research index...</p>
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="space-y-6">
          {filteredPapers.map((paper) => (
            <article
              key={paper.id}
              className="bg-[#0b0d14] border-2 border-[#1c2333] hover:border-neon/50 rounded-2xl p-6 sm:p-8 space-y-5 transition-all shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#161c29] text-neon font-mono text-[11px] font-bold border border-neon/30 uppercase">
                    {paper.category}
                  </span>
                  {paper.doi && (
                    <span className="px-2 py-0.5 rounded bg-[#10131a] text-gray-400 font-mono text-[10px] border border-[#232b3b]">
                      DOI: {paper.doi}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neon" />
                    <span>{paper.read_time_minutes} min read</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(paper.published_at || paper.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href={`/research/${paper.slug}`}>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-mono hover:text-neon transition-colors leading-snug">
                    {paper.title}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                  {paper.abstract}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#182030]">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-gray-400">
                  <span>Authors: <strong className="text-white">{(paper.authors || []).join(', ')}</strong></span>
                </div>

                <Link
                  href={`/research/${paper.slug}`}
                  className="px-4 py-2 rounded-lg bg-neon text-black font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                >
                  <span>Read Paper & Equations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-[#0e1017] border border-[#21283a] rounded-2xl p-12 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400 font-mono">No publications matched your search criteria.</p>
        </div>
      )}
    </div>
  );
}