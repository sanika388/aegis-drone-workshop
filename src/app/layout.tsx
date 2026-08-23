import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-gray-200 min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}