import {
  TrendingUp, Zap, Palette, MessageSquare, Play,
  Code, Calculator, BarChart, Calendar, ArrowRight, Bot,
  Rocket, MessageCircle, BarChart3
} from 'lucide-react';
import { agents } from '@/data/agents';
import { cn } from '@/lib/utils';
import type { ClusterType, AgentType } from '@/types';

/**
 * 🏢 AgentsGrid (The Cluster Architecture)
 * 3 Departments: The Strategist | The Studio | The Agency
 */

const iconMap: Record<AgentType, React.ElementType> = {
  'market-analyst': TrendingUp,
  'business-planner': Calculator,
  'insights-agent': BarChart,
  'brand-builder': Zap,
  'design-agent': Palette,
  'video-generator': Play,
  'caption-creator': MessageSquare,
  'campaign-planner': Calendar,
  'developer-agent': Code,
  'md-orchestrator': Bot
};

interface AgentsGridProps {
  onSelectAgent: (agentId: string) => void;
  selectedCluster: ClusterType | null;
  onSelectCluster: (clusterId: ClusterType | null) => void;
}

export function AgentsGrid({ onSelectAgent, selectedCluster, onSelectCluster }: AgentsGridProps) {

  const departments = [
    {
      id: 'strategist' as ClusterType,
      name: 'The Strategist',
      nameTh: 'ฝ่ายบริหารและกลยุทธ์',
      desc: 'เน้น Logic & Numbers (Market, Business, Insights)',
      color: 'bg-[#00D1FF]',
      icon: BarChart3
    },
    {
      id: 'studio' as ClusterType,
      name: 'The Studio',
      nameTh: 'ฝ่ายสร้างภาพลักษณ์',
      desc: 'เน้น Branding & Aesthetics (Brand, Design, Art Visual)',
      color: 'bg-[#FF00FF]',
      icon: Rocket
    },
    {
      id: 'agency' as ClusterType,
      name: 'The Agency',
      nameTh: 'ฝ่ายสื่อสารและยอดขาย',
      desc: 'เน้น Content & Hype (Caption, Campaign, Script Video)',
      color: 'bg-[#00FF9D]',
      icon: MessageCircle
    }
  ];

  const filteredAgents = agents.filter(a => a.visible && (!selectedCluster || a.cluster === selectedCluster));

  return (
    <section id="agents" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#FFF7E1] border-t-[8px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-7xl font-black text-black mb-6 uppercase tracking-tighter italic">
            THE <span className="bg-[#FFF000] px-4 border-[4px] border-black shadow-[8px_8px_0px_0px_#000]">DEPARTMENTS</span>
          </h2>
          <p className="text-2xl text-black/60 font-bold italic">
            เลือกแผนกที่ต้องการเพื่อเริ่มขับเคลื่อนธุรกิจของคุณ
          </p>
        </div>

        {/* Department Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          <button
            onClick={() => onSelectCluster(null)}
            className={cn(
              "p-6 border-[4px] border-black rounded-[1.5rem] font-black uppercase text-xl transition-all shadow-[6px_6px_0px_0px_#000]",
              !selectedCluster ? "bg-black text-white shadow-[#FF00FF]" : "bg-white text-black"
            )}
          >
            ALL DEPARTMENTS
          </button>

          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => onSelectCluster(dept.id)}
              className={cn(
                "p-6 border-[4px] border-black rounded-[1.5rem] text-left transition-all relative overflow-hidden group shadow-[6px_6px_0px_0px_#000]",
                selectedCluster === dept.id ? `${dept.color} translate-x-1 translate-y-1 shadow-none` : "bg-white"
              )}
            >
              <div className="text-[10px] font-black uppercase opacity-50">{dept.name}</div>
              <div className="text-xl font-black">{dept.nameTh}</div>
              <dept.icon className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 rotate-12 group-hover:scale-125 transition-transform" />
            </button>
          ))}
        </div>

        {/* Agents List (Horizontal Box Style for Factory feel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredAgents.map((agent) => {
            const Icon = iconMap[agent.id] || Bot;
            return (
              <div
                key={agent.id}
                className={cn(
                  'bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] p-8 rounded-[2.5rem] transition-all flex flex-col relative overflow-hidden',
                  agent.comingSoon ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-2 hover:shadow-[14px_14px_0px_0px_#000] cursor-pointer'
                )}
                onClick={() => !agent.comingSoon && onSelectAgent(agent.id)}
              >
                {agent.comingSoon && (
                  <div className="absolute top-6 -right-12 bg-[#FF00FF] text-white font-black text-[10px] py-1 w-48 text-center rotate-45 border-y-[2px] border-black z-20">
                    COMING SOON
                  </div>
                )}

                <div className="flex items-start gap-5 mb-8">
                  <div className={cn("w-20 h-20 rounded-2xl border-[3px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#000]", agent.color ? `bg-[${agent.color}]` : 'bg-gray-100')}
                    style={{ backgroundColor: agent.color }}>
                    <Icon className="w-10 h-10 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black leading-none uppercase italic">{agent.nameTh}</h3>
                    <p className="text-[10px] font-black text-black/30 uppercase mt-2">{agent.name}</p>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <div className="inline-block bg-black text-white px-2 py-1 text-[9px] font-black uppercase rounded mb-3 italic">
                    {agent.tagline}
                  </div>
                  <p className="text-xs font-bold leading-relaxed">{agent.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <span key={i} className="px-2 py-1 bg-[#FFF7E1] border-[2px] border-black text-[8px] font-black uppercase italic">
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t-[3px] border-black flex items-center justify-between">
                  <span className="text-xs font-black uppercase italic">
                    {agent.comingSoon ? "In Training..." : "Consult MD"}
                  </span>
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#00FF9D]">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
