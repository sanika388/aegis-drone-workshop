import { Shield, Zap, Target, Award } from 'lucide-react';

export default function AboutPage() {
  const highlights = [
    {
      icon: Shield,
      title: 'Real Hardware Mastery',
      desc: 'No theoretical simulations. Work directly with STM32 flight controllers, ESCs, brushless motors, and telemetry.',
    },
    {
      icon: Zap,
      title: 'Rapid Prototyping',
      desc: 'Understand 3D quadcopter frame geometry, weight distribution, and component soldering.',
    },
    {
      icon: Target,
      title: 'Live Flight Trials',
      desc: 'Calibrate gyros, bind receivers, configure fail-safes, and take your drone to the sky on flight day.',
    },
    {
      icon: Award,
      title: 'Industry Certification',
      desc: 'Receive verified workshop completion credentials issued by Aegis Drones.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-white">About Aegis Drones</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Aegis Drones is dedicated to training the next generation of aerospace and embedded engineers through intensive, hands-on workshop bootcamps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#2e2e2e] flex items-center justify-center text-neon">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">{item.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}