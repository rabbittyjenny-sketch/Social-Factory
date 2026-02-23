import { AgentType } from '@/types';

/**
 * iDEAS 365 Intelligence System (The Master Brain)
 * Updated to Cluster-based Architecture: The Strategist | The Studio | The Agency
 */

export const INTELLIGENCE_CONFIG = {
    // 🎭 Caption / Multilingual Logic
    multilingualLevels: {
        light: { range: [0, 25], ratio: 'Thai 90% / Foreign 10%', focus: 'ทับศัพท์ง่ายๆ' },
        medium: { range: [26, 50], ratio: 'Thai 70% / Foreign 30%', focus: 'ประโยคสั้นๆ + ตัวอักษรต้นฉบับ' },
        high: { range: [51, 75], ratio: 'Thai 50% / Foreign 50%', focus: 'International Vibes' },
        heavy: { range: [76, 100], ratio: 'Thai 20% / Foreign 80%', focus: 'Cool & Niche' }
    },

    // 🧠 Sales Psychology Rules (from iDEAS365-main)
    salesRules: {
        urgency: 'เหลือเพียง [X] ชิ้นสุดท้าย!',
        socialProof: 'สินค้ายอดนิยมประจำสัปดาห์',
        upselling: 'เพิ่มเพียง [X] บาท รับความคุ้มค่าเพิ่มขึ้น [Y] เท่า',
        minimalist: 'ตอบสั้น กระชับ ไม่เกิน 5 บรรทัด'
    }
};

/**
 * 🛠️ Agent Knowledge Enrichment
 * แกนหลักทั้ง 7+ ตัว ตามกลุ่มแผนก (Layer 3)
 */
export const AGENT_KNOWLEDGE: Record<AgentType, string[]> = {
    // --- 🎯 กลุ่ม "The Strategist" (Strategy & Logic) ---
    'market-analyst': [
        'สืบคู่แข่งเพื่อหาช่องว่างตลาด (Market Gap)',
        'วิเคราะห์ SWOT และจุดแข็ง-จุดอ่อนของธุรกิจ',
        'ค้นหา Target Audience เชิงลึกตามเทรนด์ประจำวัน'
    ],
    'business-planner': [
        'คำนวณต้นทุน (Cost Structure) และตั้งราคาขายที่เหมาะสม',
        'วางแผนขยายอาณาจักรธุรกิจและคำนวณจุดคุ้มทุน (Breakeven)',
        'ช่วยตัดสินใจเรื่องการลงทุนหรือขยายสาขาด้วยตัวเลข'
    ],
    'insights-agent': [
        'ดักจับ KPIs สำคัญและวิเคราะห์ยอดขายที่เกิดขึ้นจริง',
        'สรุปภาพรวมธุรกิจผ่าน Dashboard และแจ้งเตือนเมื่อยอดขายตก',
        'วิเคราะห์ความคุ้มค่าของแคมเปญโฆษณา (ROI)'
    ],

    // --- 🎨 กลุ่ม "The Studio" (Branding & Aesthetics) ---
    'brand-builder': [
        'กำหนด Mood & Tone และบุคลิกของแบรนด์ (Brand Persona)',
        'สร้างกฎเหล็กห้ามพูด (Forbidden Words) และเสียงของแบรนด์',
        'วางแนวทางการสื่อสารให้เป็นมิตรและน่าประทับใจ'
    ],
    'design-agent': [
        'ผลิต Logo, Color Palette และ Brand Identity (CI)',
        'ออกแบบ Visual Art Direction และหน้า Landing Page',
        'คุมโทนงานดีไซน์ให้ตรงตามหลักจิตวิทยาสี'
    ],

    // --- 🚀 กลุ่ม "The Agency" (Content & Growth) ---
    'caption-creator': [
        'เขียนแคปชั่น 6 สไตล์ 4 ภาษา ด้วยระบบ Emotion Recognition',
        'ใช้คำต้องห้ามและแฮชแท็กตามที่แบรนด์กำหนดอัตโนมัติ',
        'ผสมผสานคำกวนๆ หรือเป็นทางการตามระดับที่ลูกค้าเลือก'
    ],
    'campaign-planner': [
        'วางแผน Content Calendar 30 วัน (Promotion/Viral/Education)',
        'แนะนำเทมเพลตตามเทศกาลและเทรนด์รายวัน',
        'วางแผนแคมเปญเพื่อเปลี่ยนคนดูให้กลายเป็นลูกค้า'
    ],
    'video-generator': [
        'Studio Focus: ออกแบบ Theme วิดีโอให้ดูแพงและพรีเมียม',
        'Agency Focus: เขียนสคริปต์สั้น (Hook-Story-Offer) และตัดต่อตามกระแส',
        'ทำวิดีโอสร้าง Hype ในโซเชียลตามเทรนด์ TikTok/Reels'
    ],
    'developer-agent': [
        'Solution Engineer: สร้าง Smart Forms และเชื่อมต่อระบบหลังบ้าน',
        'ติดตั้งเครื่องมือทุ่นแรง (Widgets) เช่น ระบบจองหน้าเว็บ',
        'ทำ Automation ผูกยอดการทำงานเข้ากับ Database'
    ],

    // --- 🛡️ THE CENTER ---
    'md-orchestrator': [
        'Managing Director (MD): ผู้จัดการ IQ 500 ควบคุมการส่งสารข้ามกลุ่ม',
        'ทำหน้าที่เป็น Hub กลาง: ดักกรองข้อมูลความลับก่อนส่งให้ Agent ตัวอื่น',
        'Fact Check: ตรวจสอบผลลัพธ์ให้ตรงกับ Core USP และ Brand Voice 100%'
    ]
};
