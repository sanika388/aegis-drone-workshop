import { MapPin, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Get in Touch</h1>
        <p className="text-gray-400 mt-2">Have questions regarding batch registrations, venue, or team passes?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neon" /> Venue Location
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Guru Gobind Singh College of Engineering & Research Centre (GCOERC)<br />
              Nashik, Maharashtra
            </p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-neon" /> Official Support
            </h2>
            <p className="text-sm text-gray-400">
              Email: <span className="text-gray-200">contact@aegisdrone.com</span><br />
              Registration queries resolved within 24 hours.
            </p>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon" /> Send an Inquiry
          </h2>
          <form className="space-y-3">
            <input
              type="text"
              placeholder="Your Full Name"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-sm text-white"
            />
            <input
              type="email"
              placeholder="Your Email Address"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-sm text-white"
            />
            <textarea
              rows={4}
              placeholder="Your message or query..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-sm text-white"
            ></textarea>
            <button
              type="button"
              className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all"
            >
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}