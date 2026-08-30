'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Cpu, 
  Shield, 
  Radio, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  Maximize2,
  PackageCheck,
  ChevronDown,
  Code2,
  Activity,
  Award,
  BookOpen,
  Wrench,
  FileCode2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutShowcasePage() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const loadShowcase = async () => {
    try {
      const { data } = await supabase
        .from('workshops')
        .select('gallery_images')
        .not('gallery_images', 'is', null);

      if (data && data.length > 0) {
        const allImages = Array.from(
          new Set(
            data
              .flatMap((w) => w.gallery_images || [])
              .filter((url) => typeof url === 'string' && url.trim().length > 0)
          )
        );
        setGalleryImages(allImages);
      }
    } catch (err) {
      console.error('Failed to load showcase gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowcase();

    const channel = supabase
      .channel('about_gallery_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        () => {
          loadShowcase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const hardwareSpecs = [
    {
      title: 'Flight Controller (FC)',
      spec: 'ESP32 Dual-Core (240MHz)',
      detail: 'Bare-silicon custom firmware programming with real-time interrupt processing for motor PWM output.',
      icon: Cpu,
    },
    {
      title: 'Inertial Measurement (IMU)',
      spec: 'MPU6050 6-Axis MotionTracking',
      detail: 'Combines 3-axis gyroscope and 3-axis accelerometer with I2C communication and digital filtering.',
      icon: Activity,
    },
    {
      title: 'ESC & Propulsion',
      spec: '40A Brushless ESCs + High-KV Motors',
      detail: 'High-discharge electronic speed controllers running calibrated PWM signal lines for dynamic thrust modulation.',
      icon: Radio,
    },
    {
      title: 'Chassis Geometry',
      spec: '3D Printed High-Impact Frame',
      detail: 'Modular quadcopter arm architecture designed for rapid field maintenance and dynamic center-of-gravity balance.',
      icon: Layers,
    },
    {
      title: 'Flight Stabilization',
      spec: 'Closed-Loop PID Controller',
      detail: 'Proportional-Integral-Derivative math loops written from scratch to eliminate drift and ensure level hover.',
      icon: Code2,
    },
    {
      title: 'Avionics Power Rail',
      spec: 'Isolated 5V / 3.3V Regulators',
      detail: 'Filtered voltage distribution protecting the micro-controller logic from high-current motor back-EMF spikes.',
      icon: Shield,
    },
  ];

  const takeaways = [
    {
      title: 'Official Certified Completion Pass',
      desc: 'Aegis Avionics Master Workshop Certificate',
      icon: Award,
    },
    {
      title: 'Full ESP32 Flight Firmware Codebase',
      desc: 'Complete, commented source code for sensor reading, gyro filtering, PID loops, and wireless control.',
      icon: FileCode2,
    },
    {
      title: 'Live Drone Hardware Assembly Experience',
      desc: 'Hands-on practical soldering, wiring, motor testing, and safety protocol calibration on real quadcopters.',
      icon: Wrench,
    },
    {
      title: 'Aerodynamics & PID Tuning Knowledge',
      desc: 'In-depth engineering understanding of thrust-to-weight ratios, CoG balancing, and stabilization theory.',
      icon: BookOpen,
    },
  ];

  const faqs = [
    {
      q: 'Do I need prior experience in drone building or electronics?',
      a: 'No prior drone or avionics experience is required. The masterclass starts from the ground up—covering basic micro-controller wiring, sensor integration, code logic, and flight dynamics step-by-step.',
    },
    {
      q: 'What should I bring to the workshop?',
      a: 'Bringing a laptop is optional, you may bring one if you wish to configure software, take notes, or save code directly on your machine. All drone frames, flight controller components, sensors, tools, and testing rigs are provided in the lab, so a laptop is not compulsory to participate.',
    },
    {
      q: 'How are the batches and cohorts organized?',
      a: 'To guarantee hands-on workbench access and direct mentor guidance, each cohort is strictly capped per batch. Attendees work in collaborative engineering squads.',
    },
    {
      q: 'Will I get to fly the drone during the workshop?',
      a: 'Yes! The final stage of the masterclass includes motor arming tests, bench PID calibration, tethered hover stabilization, and a live demonstration flight.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
      {/* Student Initiative & Mission Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0c0f17] border border-neon/30 p-8 md:p-10 shadow-[0_0_40px_rgba(0,255,102,0.08)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold uppercase tracking-wider">
            <span>STUDENT-LED INITIATIVE</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white font-mono uppercase tracking-tight">
            Built by Students, for Future Engineers.
          </h2>

          <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed">
            Aegis Drones was founded on a simple conviction: the best way to master avionics and aerospace hardware is through uncompromised, peer-to-peer practical execution. We demystify flight controllers, firmware calibration, and aerodynamics through hands-on collaboration.
          </p>

          <blockquote className="border-l-2 border-neon pl-4 py-1 text-xs md:text-sm font-mono text-neon/90 italic">
            “Learn relentlessly. Build fearlessly. Elevate each other.”
          </blockquote>
        </div>
      </div>

      {/* Header Section */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <span>AEGIS AUTONOMOUS FLIGHT LAB</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
          Avionics & Lab Engineering
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-3xl leading-relaxed">
          Hardware-in-the-loop firmware programming, high-discharge ESC telemetry calibration, and heavy-payload modular airframe assembly.
        </p>
      </div>

      {/* Hardware Specs Grid */}
      <div className="space-y-6">
        <div className="border-b border-[#202738] pb-4">
          <h2 className="text-xl font-bold text-white font-mono uppercase flex items-center gap-2">
            <span>Hardware Architecture & Telemetry Specs</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hardwareSpecs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0e1017] border border-[#21283a] hover:border-neon/40 p-5 rounded-2xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">
                    SPEC 0{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neon" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{item.title}</h3>
                  <p className="text-xs text-neon font-mono font-semibold mt-0.5">{item.spec}</p>
                </div>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Lab Showcase Gallery */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#202738] pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase flex items-center gap-2">
              <span>Live Lab Showcase & Flight Testing</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Field tests, avionics bench setups, and workshop moments.
            </p>
          </div>
          <span className="font-mono text-xs text-neon font-semibold self-start sm:self-auto">
            {galleryImages.length} Asset{galleryImages.length === 1 ? '' : 's'} Published
          </span>
        </div>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((src, index) => (
              <div
                key={index}
                onClick={() => setActiveImage(src)}
                className="group relative aspect-video rounded-2xl overflow-hidden border border-[#242c3f] bg-[#0c0e14] cursor-pointer hover:border-neon/60 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,255,102,0.15)]"
              >
                <img
                  src={src}
                  alt={`Lab Asset ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                  <span className="font-mono text-[10px] text-neon uppercase font-bold">Inspect Asset</span>
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0e1017] border border-[#21283a] rounded-2xl p-10 text-center space-y-3">
            <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400 font-mono">
              Showcase photos will appear here as images are added in the <strong>Admin Control Room &gt; Showcase</strong> tab.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#10131a] border border-neon/40 rounded-2xl overflow-hidden shadow-2xl p-2"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-neon hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImage}
              alt="Expanded Hardware Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Take Home Section */}
      <div className="space-y-6">
        <div className="border-b border-[#202738] pb-4">
          <h2 className="text-xl font-bold text-white font-mono uppercase flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-neon" />
            <span>What You Will Take Home</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {takeaways.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0e1017] border border-[#21283a] p-5 rounded-2xl flex items-start gap-4 hover:border-neon/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-neon" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-mono">{item.title}</h3>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student FAQs Section */}
      <div className="space-y-6">
        <div className="border-b border-[#202738] pb-4">
          <h2 className="text-xl font-bold text-white font-mono uppercase flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neon" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Common questions regarding prerequisites, equipment, and session structure.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#0e1017] border border-[#21283a] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#12151f] transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-neon">Q{idx + 1}.</span> {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neon shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#1a202e] text-xs text-gray-300 font-mono leading-relaxed bg-[#0b0d13]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action Bar */}
      <div className="bg-gradient-to-r from-[#0c1410] to-[#0e1017] border border-neon/30 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold font-mono text-white">Join the Next Flight Intake</h3>
          <p className="text-xs text-gray-400 font-mono">
            Hands-on benches are partitioned into small batches for focused mentorship.
          </p>
        </div>
        <Link
          href="/workshops"
          className="px-6 py-3 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] shrink-0 cursor-pointer"
        >
          <span>Claim Your Seat</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}