import React from 'react';
import Link from 'next/link';
import { Mail, Phone, ExternalLink, Sparkles } from 'lucide-react';

interface BrandingBadgeProps {
  variant?: 'footer' | 'compact' | 'card';
  developerEmail?: string;
  developerPhone?: string;
  developerWhatsApp?: string;
}

export default function BrandingBadge({
  variant = 'footer',
  developerEmail = 'irisforge.studio@gmail.com', // update with your contact email
  developerPhone = '+919876543210',             // update with your phone
  developerWhatsApp = '919876543210',          // update with WhatsApp number
}: BrandingBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 py-3">
        <span>Architected & Built with precision by</span>
        <span className="font-semibold text-zinc-100 tracking-wide">Irisforge</span>
      </div>
    );
  }

  return (
    <div className="w-full border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Attribution */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Designed, Engineered & Deployed by <span className="font-semibold text-white tracking-tight">Irisforge</span>
            </p>
            <p className="text-xs text-zinc-500">
              High-performance digital systems & full-stack development
            </p>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {developerEmail && (
            <a
              href={`mailto:${developerEmail}?subject=Inquiry%20via%20Aegis%20Drone%20Portal`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>Contact Irisforge</span>
            </a>
          )}

          {developerWhatsApp && (
            <a
              href={`https://wa.me/${developerWhatsApp}?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Workshop%20portal%20and%20want%20to%20inquire.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}