import { Agent, NavItem, AgentType } from '@/types';
import { AGENT_KNOWLEDGE } from './intelligence';

export const agents: Agent[] = [
    // --- � กลุ่ม "The Strategist" (Strategy & Logic) ---
    {
        id: 'market-analyst',
        name: 'Market Analyst',
        nameTh: 'นักวิเคราะห์เจาะตลาด',
        cluster: 'strategist',
        tagline: 'SWOT Analysis · Gap Finder',
        description: 'สืบคู่แข่งเพื่อหาช่องว่าง (Gap) และวางแผนจุดยืนของแบรนด์ให้โดดเด่นกว่าใครในตลาด',
        capabilities: ['Market Gap Analysis', 'Competitor Research', 'Target Persona'],
        icon: 'TrendingUp',
        gradient: 'from-[#00D1FF] to-blue-600',
        visible: true,
        comingSoon: false,
        expertise: ['Market', 'Strategy'],
        color: '#00D1FF'
    },
    {
        id: 'business-planner',
        name: 'Business Planner',
        nameTh: 'ที่ปรึกษาการเงินและแผน',
        cluster: 'strategist',
        tagline: 'Costing · ROI · Scaling',
        description: 'คำนวณต้นทุนและตั้งราคาขายที่เหมาะสม พร้อมวางแผนขยายสาขาและจุดคุ้มทุนที่แม่นยำ',
        capabilities: ['Financial Math', 'Breakeven Point', 'Pricing Strategy'],
        icon: 'Calculator',
        gradient: 'from-amber-600 to-yellow-800',
        visible: true,
        comingSoon: false,
        expertise: ['Finance', 'Business'],
        color: '#D97706'
    },
    {
        id: 'insights-agent',
        name: 'Insights Agent',
        nameTh: 'นักวิเคราะห์สุขภาพธุรกิจ',
        cluster: 'strategist',
        tagline: 'KPI Capture · Sales Audit',
        description: 'ดักจับ KPIs สำคัญและวิเคราะห์ยอดขาย เพื่อบอกว่าแผนที่วางไว้ได้กำไรจริงหรือไม่',
        capabilities: ['Sales Dashboard', 'Performance Tracking', 'Problem Solver'],
        icon: 'BarChart',
        gradient: 'from-indigo-600 to-blue-900',
        visible: true,
        comingSoon: false,
        expertise: ['Data', 'Analytics'],
        color: '#4F46E5'
    },

    // --- 🎨 กลุ่ม "The Studio" (Branding & Aesthetics) ---
    {
        id: 'brand-builder',
        name: 'Brand Builder',
        nameTh: 'ผู้ออกแบบจิตวิญญาณแบรนด์',
        cluster: 'studio',
        tagline: 'Mood & Tone · Personality',
        description: 'กำหนดบุคลิกและ "เสียง" ของแบรนด์เพื่อให้คนจำได้และประทับใจตั้งแต่แรกเห็น',
        capabilities: ['Brand Voice', 'Mood Board', 'Forbidden Words'],
        icon: 'Zap',
        gradient: 'from-[#FFF000] to-orange-400',
        visible: true,
        comingSoon: false,
        expertise: ['Identity', 'Branding'],
        color: '#FFF000'
    },
    {
        id: 'design-agent',
        name: 'Design Agent',
        nameTh: 'ดีไซเนอร์ประจำแบรนด์',
        cluster: 'studio',
        tagline: 'Logo · CI · UI Layout',
        description: 'ผลิต Logo, Color Palette และ Art Direction เพื่อสร้างภาพลักษณ์ที่พรีเมียมและน่าเชื่อถือ',
        capabilities: ['Logo Design', 'Visual Identity', 'UX/UI Concepts'],
        icon: 'Palette',
        gradient: 'from-[#FF00FF] to-purple-600',
        visible: true,
        comingSoon: false,
        expertise: ['Design', 'Creative'],
        color: '#FF00FF'
    },

    // --- 🚀 กลุ่ม "The Agency" (Content & Growth) ---
    {
        id: 'campaign-planner',
        name: 'Campaign Planner',
        nameTh: 'นักวางแผนทัพคอนเทนต์',
        cluster: 'agency',
        tagline: '30-Day Plan · Calendar',
        description: 'วางแผน Content 30 วัน ว่าวันไหนจะโพสต์อะไร เพื่อสร้างกระแสและเปลี่ยนคนดูเป็นลูกค้า',
        capabilities: ['Content Calendar', 'Promotion Ideas', 'Trend Radar'],
        icon: 'Calendar',
        gradient: 'from-sky-500 to-blue-700',
        visible: true,
        comingSoon: false,
        expertise: ['Campaign', 'Marketing'],
        color: '#00D1FF'
    },
    {
        id: 'caption-creator',
        name: 'Caption Creator',
        nameTh: 'นักเขียนแคปชั่นหยุดโลก',
        cluster: 'agency',
        tagline: '6 Styles · 4 Languages',
        description: 'เขียนแคปชั่นด้วย Emotion Recognition ผสมผสานภาษาตามระดับความเท่ที่ต้องการ',
        capabilities: ['Copywriting', 'Language Calibration', 'Emotional Hook'],
        icon: 'MessageSquare',
        gradient: 'from-emerald-500 to-teal-700',
        visible: true,
        comingSoon: false,
        expertise: ['Copy', 'Social'],
        color: '#10B981'
    },
    {
        id: 'video-generator',
        name: 'Video Generator',
        nameTh: 'โปรดิวเซอร์วิดีโออัจฉริยะ',
        cluster: 'agency',
        tagline: 'Visual Art · Scripting',
        description: 'เขียนสคริปต์สั้น (Hook-Story-Offer) และออกแบบ Theme วิดีโอให้ดูแพงและพรีเมียม',
        capabilities: ['Script Writing', 'Visual Theme', 'Social Hype'],
        icon: 'Play',
        gradient: 'from-[#00FF9D] to-emerald-600',
        visible: true,
        comingSoon: false,
        expertise: ['Video', 'Content'],
        color: '#00FF9D'
    },
    {
        id: 'developer-agent',
        name: 'Developer Agent',
        nameTh: 'ช่างเทคนิค / Solution Engineer',
        cluster: 'agency',
        tagline: 'Smart Forms · Technical Setup',
        description: 'สร้างเครื่องมือทุ่นแรงหน้าเว็บ ระบบจอง และ Smart Forms เพื่อจัดการข้อมูลแบรนด์อย่างมีประสิทธิภาพ',
        capabilities: ['Widget Setup', 'No-code Automation', 'Data Integration'],
        icon: 'Code',
        gradient: 'from-gray-600 to-black',
        visible: true,
        comingSoon: true,
        expertise: ['Technical', 'Automation'],
        color: '#000000'
    },

    // --- 🛡️ THE CENTER (Hidden from Grid) ---
    {
        id: 'md-orchestrator',
        name: 'MD Orchestrator',
        nameTh: 'ผู้จัดการใหญ่ iDEAS 365',
        cluster: 'strategist',
        tagline: 'MD Hub · Data Traffic',
        description: 'MD ประจำแบรนด์ คอยควบคุมการส่งงานข้ามกลุ่ม จัดการความลับ และ Fact Check บริบทของแบรนด์',
        capabilities: ['Smart Routing', 'Fact Check', 'Brand Guard'],
        icon: 'Bot',
        gradient: 'from-slate-900 to-black',
        visible: false,
        comingSoon: false,
        expertise: ['Management', 'Orchestration'],
        color: '#000000'
    }
];

export const navItems: NavItem[] = [
    { id: 'home', label: 'Home', labelTh: 'หน้าแรก', icon: 'Home', path: '/' },
    { id: 'agents', label: 'AI Factory', labelTh: 'โรงงาน AI', icon: 'Bot', path: '/agents' },
    { id: 'dashboard', label: 'Dashboard', labelTh: 'แดชบอร์ด', icon: 'LayoutDashboard', path: '/dashboard' },
    { id: 'history', label: 'Logs', labelTh: 'ประวัติงาน', icon: 'History', path: '/history' },
];
