import React from 'react';
import { Mail, ExternalLink, Sparkles } from 'lucide-react';

interface BrandingBadgeProps {
  variant?: 'footer' | 'compact' | 'card';
  developerEmail?: string;
  developerPhone?: string;
  developerWhatsApp?: string;
}

export default function BrandingBadge({
  variant = 'footer',
  developerEmail = 'dusanesanika9@gmail.com',
  developerWhatsApp = '917620350524',
}: BrandingBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-mono py-3">
        <span>Architected & Built with precision by</span>
        <span className="font-bold text-neon tracking-wide">Irisforge</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-[#0c0f17] border border-[#1e2538] hover:border-neon/40 rounded-2xl p-5 space-y-3 transition-all font-mono">
        <div className="flex items-center gap-2.5 text-neon text-xs font-bold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Irisforge Engineering</span>
        </div>
        <p className="text-xs text-gray-300">
          High-performance digital systems, telemetry web applications, and custom avionics platforms.
        </p>
        <div className="flex items-center gap-2 pt-1 text-xs">
          {developerEmail && (
            <a
              href={`mailto:${developerEmail}?subject=Engineering%20Inquiry%20via%20Aegis%20Portal`}
              className="px-3 py-1.5 rounded-lg bg-[#141824] border border-[#232b3d] hover:border-neon text-gray-200 hover:text-neon transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>
          )}
          {developerWhatsApp && (
            <a
              href={`https://wa.me/${developerWhatsApp}?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Portal%20and%20want%20to%20collaborate.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-neon/10 border border-neon/30 hover:bg-neon/20 text-neon font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-t border-[#1e2538] bg-[#07090f]/90 backdrop-blur-md py-6 px-4 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Attribution */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="h-8 w-8 rounded-lg bg-[#161c2c] border border-neon/40 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(0,255,102,0.15)] shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-wide">
              Designed, Engineered & Deployed by <span className="text-neon">Irisforge</span>
            </p>
            <p className="text-[11px] text-gray-400">
              High-performance digital systems & full-stack development
            </p>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {developerEmail && (
            <a
              href={`mailto:${developerEmail}?subject=Inquiry%20via%20Aegis%20Drone%20Portal`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2133] text-gray-300 hover:text-white border border-[#232b3d] hover:border-neon transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-neon" />
              <span>Contact Irisforge</span>
            </a>
          )}

          {developerWhatsApp && (
            <a
              href={`https://wa.me/${developerWhatsApp}?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Workshop%20portal%20and%20want%20to%20inquire.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon/10 hover:bg-neon/20 text-neon font-bold border border-neon/30 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>WhatsApp Us</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}