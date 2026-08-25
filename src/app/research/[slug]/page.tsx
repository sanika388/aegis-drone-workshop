'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  FileText, 
  Quote, 
  Check, 
  Copy,
  Download,
  Building,
  Hash
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ScientificPaperReader() {
  const params = useParams();
  const rawSlug = typeof params?.slug === 'string' ? params.slug : '';

  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  useEffect(() => {
    async function fetchPaper() {
      try {
        const { data } = await supabase
          .from('research_papers')
          .select('*')
          .eq('slug', rawSlug)
          .single();

        if (data) {
          setPaper(data);
        }
      } catch (err) {
        console.error('Failed to load research paper:', err);
      } finally {
        setLoading(false);
      }
    }

    if (rawSlug) fetchPaper();
  }, [rawSlug]);

  const generateBibTeX = () => {
    if (!paper) return '';
    return `@article{aegis_${paper.slug?.replace(/-/g, '_')}_2026,
  author = {${(paper.authors || []).join(' and ')}},
  title = {${paper.title}},
  journal = {Aegis Aerospace & Avionics Technical Transactions},
  year = {2026},
  doi = {${paper.doi || '10.1109/TAES.2026.0825'}},
  institution = {Guru Gobind Singh College of Engineering and Research Centre, Nashik}
}`;
  };

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(generateBibTeX());
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Rendering high-precision mathematical telemetry...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-mono text-white">Research Publication Not Found</h2>
        <Link href="/research" className="text-xs text-neon font-mono hover:underline">
          ← Return to Research Publications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <Link
        href="/research"
        className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-neon transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO RESEARCH PUBLICATIONS</span>
      </Link>

      {/* Header Document Block */}
      <div className="space-y-4 border-b border-[#21283d] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold uppercase">
            {paper.category}
          </span>
          {paper.doi && (
            <span className="px-3 py-1 rounded-md bg-[#121622] border border-[#242e44] text-gray-300 font-mono text-xs">
              DOI: {paper.doi}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono leading-tight">
          {paper.title}
        </h1>

        <div className="space-y-2 text-xs font-mono text-gray-300">
          <div>
            Authors: <strong className="text-white">{(paper.authors || []).join(', ')}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Building className="w-3.5 h-3.5 text-neon" />
            <span>Guru Gobind Singh College of Engineering and Research Centre, Nashik, India</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-gray-400 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neon" />
              <span>{paper.read_time_minutes || 15} min read</span>
            </div>
            <span>•</span>
            <span>Published: {new Date(paper.published_at || paper.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Abstract Section */}
      <div className="bg-[#0b0e14] border-l-4 border-neon border-y border-r border-[#1e2638] p-6 rounded-r-2xl space-y-2">
        <h3 className="text-xs font-bold text-neon font-mono uppercase tracking-widest">Abstract</h3>
        <p className="text-xs sm:text-sm text-gray-200 font-sans leading-relaxed italic">
          "{paper.abstract}"
        </p>
      </div>

      {/* Peer-Reviewed Scientific Body with LaTeX Math */}
      <div className="bg-[#080a0f] border border-[#1a2133] p-8 rounded-3xl space-y-6 text-gray-200 font-sans leading-relaxed text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-bold font-mono text-white mt-8 mb-4 border-b border-[#212b40] pb-2 uppercase tracking-wide" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-bold font-mono text-neon mt-6 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 text-gray-300 leading-relaxed font-sans text-sm" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 mb-4 space-y-1.5 text-gray-300 font-sans text-sm" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="bg-[#121622] px-1.5 py-0.5 rounded text-neon font-mono text-xs border border-[#222b3e]" {...props} />
            ),
          }}
        >
          {paper.content_markdown}
        </ReactMarkdown>
      </div>

      {/* BibTeX Citation Block */}
      <div className="bg-[#0c0f17] border border-[#21283d] rounded-2xl p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs font-bold text-neon flex items-center gap-1.5">
            <Quote className="w-4 h-4 text-neon" /> Cite This Paper (BibTeX)
          </span>
          <button
            onClick={handleCopyBibtex}
            className="px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-neon hover:text-black text-gray-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBibtex ? 'Copied to Clipboard!' : 'Copy BibTeX'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-[#07090e] border border-[#1a2030] text-[11px] font-mono text-gray-300 overflow-x-auto">
          {generateBibTeX()}
        </pre>
      </div>
    </div>
  );
}