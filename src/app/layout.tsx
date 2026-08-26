import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'Aegis Drone Workshop | Gear Up. Code It. Build It. Fly It.',
  description: 'Hands-on Quadcopter Building, Hardware Assembly & Live Flight Calibration Workshop.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className="bg-[#07090f] text-gray-200 min-h-screen flex flex-col selection:bg-neon selection:text-black antialiased" 
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: '#0c0f17',
              border: '1px solid #1e2538',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '12px',
            },
            className: 'border-neon/40 shadow-[0_0_20px_rgba(0,255,102,0.15)]',
          }}
        />
      </body>
    </html>
  );
}