import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Rocket, MessageCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ⚡ Hero Section (Guided UX)
 * Updated to: The Strategist | The Studio | The Agency
 */

interface HeroProps {
  onSelectCluster: (clusterId: 'strategist' | 'studio' | 'agency') => void;
}

export function Hero({ onSelectCluster }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const guideOptions = [
    {
      id: 'strategist' as const,
      icon: BarChart3,
      title: "The Strategist",
      desc: "(A) วางรากฐานธุรกิจให้รอดและรวย",
      color: "bg-[#00D1FF]"
    },
    {
      id: 'studio' as const,
      icon: Rocket,
      title: "The Studio",
      desc: "(B) สร้างแบรนด์ให้คนจำและดูพรีเมียม",
      color: "bg-[#FF00FF]"
    },
    {
      id: 'agency' as const,
      icon: MessageCircle,
      title: "The Agency",
      desc: "(C) ปั่นคอนเทนต์และกระตุ้นยอดขาย",
      color: "bg-[#00FF9D]"
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 overflow-hidden bg-[#FFF7E1]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-32 h-32 bg-[#FF00FF] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl rotate-12" />
        <div className="absolute bottom-40 right-[15%] w-48 h-48 bg-[#00D1FF] border-[4px] border-black shadow-[12px_12px_0px_0px_#000] rounded-[3rem] -rotate-6" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className={cn(
          'inline-flex items-center gap-4 px-8 py-3 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl mb-12',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}>
          <Zap className="w-6 h-6 text-black" />
          <span className="text-sm font-black tracking-widest text-black uppercase italic">iDEAS 365 FACTORY</span>
        </div>

        {!showGuided ? (
          <div className={isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}>
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic mb-10">
              The Factory of<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF00FF] to-[#00D1FF] stroke-black stroke-[2px] drop-shadow-[8px_8px_0px_#000]">
                AI AGENCY
              </span>
            </h1>
            <div className="max-w-2xl mx-auto mb-16">
              <p className="text-xl font-bold bg-white border-[4px] border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_#000]">
                ระบบพนักงาน AI อัจฉริยะแบบ "Smart Lazy Style"<br />
                บริหารแบรนด์ครบวงจร กลยุทธ์-ดีไซน์-คอนเทนต์ ในที่เดียว
              </p>
            </div>
            <button
              onClick={() => setShowGuided(true)}
              className="h-20 px-12 bg-[#FF00FF] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-2xl flex items-center justify-center gap-4 text-2xl font-black text-white uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              START CONSULTATION <ArrowRight />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-5xl font-black text-black uppercase tracking-tighter italic mb-4">
              วันนี้ให้เรา <span className="bg-[#FFF000] px-3 border-[3px] border-black">ช่วยเรื่องไหน</span> คะ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {guideOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectCluster(opt.id)}
                  className={cn(
                    "p-8 border-[4px] border-black rounded-[2.5rem] text-left transition-all hover:scale-105 active:scale-95 flex flex-col items-center text-center",
                    opt.color,
                    "shadow-[10px_10px_0px_0px_#000]"
                  )}
                >
                  <div className="w-16 h-16 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl flex items-center justify-center mb-6">
                    <opt.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-2">{opt.title}</h3>
                  <p className="text-xs font-bold text-black/70 italic px-2">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
