import { MasterContext } from '../data/intelligence';
import { db, brands, swotAnalyses, captions, designAssets, automatedTools, messages, agentLearnings, videoTasks, campaignSchedules, contentFactorySubmissions, captionFactorySubmissions, makecomIntegrationLogs, automationSchedules } from '../db/client';
import { eq, desc } from 'drizzle-orm';

/**
 * Database Service - Handles all database operations
 * This service acts as a bridge between the app and Drizzle ORM
 * Automatically uses Neon PostgreSQL if DATABASE_URL is set, otherwise falls back to localStorage
 */

// Type definitions for database operations
export interface BrandRecord {
  id?: number;
  brandNameEn: string;
  brandNameTh: string;
  industry: string;
  coreUsp: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  moodKeywords?: string[];
  toneOfVoice?: string;
  multilingualLevel?: string;
  brandHashtags?: string[];
  logoUrl?: string;
}

export interface SwotRecord {
  id?: number;
  brandId: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketTrends?: string;
  competitorAnalysis?: string;
  confidence: number;
  generatedBy: string;
}

export interface CaptionRecord {
  id?: number;
  brandId: number;
  caption: string;
  captionTh?: string;
  platform?: string;
  contentType?: string;
  hashtags?: string[];
  engagementTips?: string;
  confidence: number;
  generatedBy: string;
}

export interface DesignAssetRecord {
  id?: number;
  brandId: number;
  assetType: string;
  assetDescription?: string;
  colorScheme?: { primary: string; secondary: string; accent?: string };
  typography?: { fontFamily: string; sizes: Record<string, string> };
  dimensions?: string;
  imageUrl?: string;
  cssCode?: string;
  generatedBy: string;
}

export interface AutomationRecord {
  id?: number;
  brandId: number;
  toolName: string;
  toolType: string;
  isActive: boolean;
  configuration?: Record<string, any>;
  scheduleFrequency?: string;
  automationScript?: string;
}

export interface MessageRecord {
  id?: number;
  brandId: number;
  role: 'user' | 'agent';
  agentId?: string;
  agentName?: string;
  content: string;
  attachments?: Array<{ name: string; type: string; size: number }>;
  confidence?: number;
  validationResults?: Record<string, any>;
  createdAt?: Date;
}

export interface AgentLearningRecord {
  id?: number;
  brandId: number;
  agentId: string;
  agentName: string;
  insight: string;
  insightType: string;
  dataUsed?: string[];
  confidence: number;
  actionable: boolean;
}

export interface VideoTaskRecord {
  id?: number;
  brandId: number;
  taskType: 'art' | 'script';
  videoTitle?: string;
  scriptContent?: string;
  artPrompt?: string;
  platform?: string;
  duration?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  generatedBy: string;
}

export interface CampaignRecord {
  id?: number;
  brandId: number;
  campaignName: string;
  campaignObjective?: string;
  targetAudience?: string;
  platforms?: string[];
  contentCalendar?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  budget?: number;
  estimatedReach?: number;
}

/**
 * Video Production Records - For tracking video generation
 */
export interface VideoProductionLog {
  id?: number;
  contentId: string; // Item ID from Content_Log
  userEmail: string;
  rawText: string;
  finalScript: string;
  generatedBy: string;
  platform: string;
  videoUrl: string; // YouTube/TikTok URL
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt?: Date;
  completedAt?: Date;
}

export interface CaptionFactorySubmission {
  id?: number;
  brandId?: number;
  lineUserId: string;
  displayName?: string;
  imageData: string; // Base64
  mood?: string;
  userWords?: string;
  multilingualLevel?: number;
  status: 'draft' | 'pending' | 'completed' | 'failed';
  generatedCaption?: string;
  generatedCaptionTh?: string;
  hashtags?: string[];
  moodAnalysis?: string;
  makeWebhookUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContentFactoryRecord {
  id?: number;
  mainCategory: string;
  userEmail: string;
  category: string; // 'Short Clip Video', etc.
  postFormat: string;
  itemId: string;
  rawText: string;
  platform: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt?: Date;
}

class DatabaseService {
  private isReady = false;
  private localStoragePrefix = 'socialFactory_db_';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if we can connect to the database (browser-safe)
    const dbUrl = (import.meta as any).env?.VITE_DATABASE_URL || '';

    if (!dbUrl || dbUrl.includes('[user]')) {
      console.warn('⚠️  DATABASE_URL not configured or using placeholder. Using localStorage as fallback.');
      this.isReady = false;
    } else {
      console.log('✅ Database service initialized with Neon PostgreSQL');
      this.isReady = true;
    }
  }

  /**
   * Create or update a brand
   */
  async saveBrand(brand: BrandRecord): Promise<BrandRecord> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage
        const key = `${this.localStoragePrefix}brands_${brand.brandNameEn}`;
        const data = { ...brand, id: 1, createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      // Implement actual database save
      const values = {
        brandNameEn: brand.brandNameEn,
        brandNameTh: brand.brandNameTh,
        industry: brand.industry,
        coreUsp: brand.coreUsp,
        targetAudience: brand.targetAudience,
        primaryColor: brand.primaryColor,
        toneOfVoice: brand.toneOfVoice,
        multilingualLevel: brand.multilingualLevel,
        brandHashtags: brand.brandHashtags,
        logoUrl: brand.logoUrl,
        moodKeywords: brand.moodKeywords,
      };

      const result = await db.insert(brands).values(values as any).onConflictDoUpdate({
        target: brands.brandNameEn,
        set: values as any
      }).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving brand:', error);
      throw error;
    }
  }

  /**
   * Get brand by ID or name
   */
  async getBrand(identifier: string | number): Promise<BrandRecord | null> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage
        const key = `${this.localStoragePrefix}brands_${identifier}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }

      // Implement actual database query
      let result;
      if (typeof identifier === 'number') {
        result = await db.select().from(brands).where(eq(brands.id, identifier));
      } else {
        result = await db.select().from(brands).where(eq(brands.brandNameEn, identifier));
      }

      return (result[0] as any) || null;
    } catch (error) {
      console.error('Error getting brand:', error);
      return null;
    }
  }

  /**
   * Save SWOT analysis
   */
  async saveSwotAnalysis(swot: SwotRecord): Promise<SwotRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}swot_${swot.brandId}_${Date.now()}`;
        const data = { ...swot, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(swotAnalyses).values({
        brandId: swot.brandId,
        strengths: swot.strengths,
        weaknesses: swot.weaknesses,
        opportunities: swot.opportunities,
        threats: swot.threats,
        marketTrends: swot.marketTrends,
        competitorAnalysis: swot.competitorAnalysis,
        confidence: swot.confidence,
        generatedBy: swot.generatedBy
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      throw error;
    }
  }

  /**
   * Save caption
   */
  async saveCaption(caption: CaptionRecord): Promise<CaptionRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}caption_${caption.brandId}_${Date.now()}`;
        const data = { ...caption, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(captions).values({
        brandId: caption.brandId,
        caption: caption.caption,
        captionTh: caption.captionTh,
        platform: caption.platform,
        contentType: caption.contentType,
        hashtags: caption.hashtags,
        engagementTips: caption.engagementTips,
        confidence: caption.confidence,
        generatedBy: caption.generatedBy
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving caption:', error);
      throw error;
    }
  }

  /**
   * Save design asset
   */
  async saveDesignAsset(asset: DesignAssetRecord): Promise<DesignAssetRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}design_${asset.brandId}_${Date.now()}`;
        const data = { ...asset, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(designAssets).values({
        brandId: asset.brandId,
        assetType: asset.assetType,
        assetDescription: asset.assetDescription,
        colorScheme: asset.colorScheme,
        typography: asset.typography,
        dimensions: asset.dimensions,
        imageUrl: asset.imageUrl,
        cssCode: asset.cssCode,
        generatedBy: asset.generatedBy
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving design asset:', error);
      throw error;
    }
  }

  /**
   * Save message to conversation history
   */
  async saveMessage(message: MessageRecord): Promise<MessageRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}message_${message.brandId}_${Date.now()}`;
        const data = { ...message, id: Date.now(), createdAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(messages).values({
        brandId: message.brandId,
        role: message.role,
        agentId: message.agentId,
        agentName: message.agentName,
        content: message.content,
        attachments: message.attachments,
        confidence: message.confidence,
        validationResults: message.validationResults
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(brandId: number, limit: number = 50): Promise<MessageRecord[]> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage - get all messages for this brand
        const messagesFallback: MessageRecord[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}message_${brandId}`)) {
            const data = localStorage.getItem(key);
            if (data) messagesFallback.push(JSON.parse(data));
          }
        }
        return messagesFallback.sort((a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        ).slice(-limit);
      }

      const result = await db.select().from(messages)
        .where(eq(messages.brandId, brandId))
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      return result.reverse() as any;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Save agent learning
   */
  async saveAgentLearning(learning: AgentLearningRecord): Promise<AgentLearningRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}learning_${learning.brandId}_${Date.now()}`;
        const data = { ...learning, id: Date.now(), createdAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(agentLearnings).values({
        brandId: learning.brandId,
        agentId: learning.agentId,
        agentName: learning.agentName,
        insight: learning.insight,
        insightType: learning.insightType,
        dataUsed: learning.dataUsed,
        confidence: learning.confidence,
        actionable: learning.actionable
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving agent learning:', error);
      throw error;
    }
  }

  /**
   * Save video task
   */
  async saveVideoTask(task: VideoTaskRecord): Promise<VideoTaskRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}video_${task.brandId}_${Date.now()}`;
        const data = { ...task, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(videoTasks).values({
        brandId: task.brandId,
        taskType: task.taskType,
        status: task.status,
        script: task.script,
        mediaAssets: task.mediaAssets,
        resultUrl: task.resultUrl,
        generatedBy: task.generatedBy
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving video task:', error);
      throw error;
    }
  }

  /**
   * Save campaign
   */
  async saveCampaign(campaign: CampaignRecord): Promise<CampaignRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}campaign_${campaign.brandId}_${Date.now()}`;
        const data = { ...campaign, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(campaignSchedules).values({
        brandId: campaign.brandId,
        campaignName: campaign.campaignName,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        platforms: campaign.platforms,
        objectives: campaign.objectives,
        contentCalendar: campaign.contentCalendar,
        status: campaign.status,
        generatedBy: campaign.generatedBy
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  }

  /**
   * Save Caption Factory submission
   */
  async saveCaptionFactorySubmission(submission: CaptionFactorySubmission): Promise<CaptionFactorySubmission> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}caption_factory_${submission.lineUserId}_${Date.now()}`;
        const data = { ...submission, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(captionFactorySubmissions).values({
        brandId: submission.brandId,
        lineUserId: submission.lineUserId,
        displayName: submission.displayName,
        imageData: submission.imageData,
        mood: submission.mood,
        userWords: submission.userWords,
        multilingualLevel: submission.multilingualLevel,
        status: submission.status,
        makeWebhookUrl: submission.makeWebhookUrl
      } as any).returning();

      return result[0] as any;
    } catch (error) {
      console.error('Error saving caption factory submission:', error);
      throw error;
    }
  }

  /**
   * Get pending Caption Factory submissions
   */
  async getPendingCaptionSubmissions(brandId?: number, limit: number = 10): Promise<CaptionFactorySubmission[]> {
    try {
      if (!this.isReady) {
        const submissionsFallback: CaptionFactorySubmission[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}caption_factory_`)) {
            const dataText = localStorage.getItem(key);
            if (dataText) {
              const submission = JSON.parse(dataText);
              if (!brandId || submission.brandId === brandId) {
                submissionsFallback.push(submission);
              }
            }
          }
        }
        return submissionsFallback.slice(-limit);
      }

      const result = await db.select().from(captionFactorySubmissions)
        .where(eq(captionFactorySubmissions.status, 'pending'))
        .limit(limit);

      return result as any;
    } catch (error) {
      console.error('Error getting pending caption submissions:', error);
      return [];
    }
  }

  /**
   * Update Caption Factory submission status
   */
  async updateCaptionSubmissionStatus(submissionId: number, status: string, generatedCaption?: any): Promise<void> {
    try {
      if (!this.isReady) {
        // Update in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}caption_factory_`)) {
            const data = localStorage.getItem(key);
            if (data) {
              const submission = JSON.parse(data);
              if (submission.id === submissionId) {
                submission.status = status;
                if (generatedCaption) {
                  submission.generatedCaption = generatedCaption.text;
                  submission.generatedCaptionTh = generatedCaption.textTh;
                  submission.hashtags = generatedCaption.hashtags;
                  submission.moodAnalysis = generatedCaption.analysis;
                }
                submission.updatedAt = new Date();
                localStorage.setItem(key, JSON.stringify(submission));
                return;
              }
            }
          }
        }
      }

      await db.update(captionFactorySubmissions)
        .set({
          status,
          generatedCaption: generatedCaption?.text,
          generatedCaptionTh: generatedCaption?.textTh,
          hashtags: generatedCaption?.hashtags,
          moodAnalysis: generatedCaption?.analysis,
          updatedAt: new Date()
        } as any)
        .where(eq(captionFactorySubmissions.id, submissionId));
    } catch (error) {
      console.error('Error updating caption submission status:', error);
      throw error;
    }
  }

  /**
   * Save video production log
   */
  async saveVideoProductionLog(log: VideoProductionLog): Promise<VideoProductionLog> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}video_production_${log.contentId}_${Date.now()}`;
        const data = {
          ...log,
          id: Date.now(),
          createdAt: new Date()
        };
        localStorage.setItem(key, JSON.stringify(data));
        return data as any;
      }

      const result = await db.insert(videoTasks).values({
        script: log.finalScript,
        resultUrl: log.videoUrl,
        status: log.status,
        generatedBy: log.generatedBy
      } as any).returning();

      return { ...log, id: result[0].id } as any;
    } catch (error) {
      console.error('Error saving video production log:', error);
      throw error;
    }
  }

  /**
   * Get video production logs by user
   */
  async getVideoProductionLogs(userEmail?: string, limit: number = 50): Promise<VideoProductionLog[]> {
    try {
      if (!this.isReady) {
        const logs: VideoProductionLog[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}video_production_`)) {
            const data = localStorage.getItem(key);
            if (data) {
              const log = JSON.parse(data);
              if (!userEmail || log.userEmail === userEmail) {
                logs.push(log);
              }
            }
          }
        }
        return logs.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ).slice(0, limit);
      }

      // TODO: Implement database query
      return [];
    } catch (error) {
      console.error('Error fetching video production logs:', error);
      return [];
    }
  }

  /**
   * Get pending video production tasks
   */
  async getPendingVideoTasks(): Promise<VideoProductionLog[]> {
    try {
      if (!this.isReady) {
        const tasksFallback: VideoProductionLog[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}video_production_`)) {
            const dataText = localStorage.getItem(key);
            if (dataText) {
              const log = JSON.parse(dataText);
              if (log.status === 'pending' || log.status === 'processing') {
                tasksFallback.push(log);
              }
            }
          }
        }
        return tasksFallback;
      }

      const result = await db.select().from(videoTasks)
        .where(eq(videoTasks.status, 'pending'));

      return result as any;
    } catch (error) {
      console.error('Error fetching pending video tasks:', error);
      return [];
    }
  }

  /**
   * Update video production log status
   */
  async updateVideoProductionStatus(
    contentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    videoUrl?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      if (!this.isReady) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}video_production_`)) {
            const data = localStorage.getItem(key);
            if (data) {
              const log = JSON.parse(data);
              if (log.contentId === contentId) {
                log.status = status;
                if (videoUrl) log.videoUrl = videoUrl;
                if (errorMessage) log.errorMessage = errorMessage;
                if (status === 'completed') {
                  log.completedAt = new Date();
                }
                localStorage.setItem(key, JSON.stringify(log));
                return;
              }
            }
          }
        }
      }

      await db.update(videoTasks)
        .set({
          status,
          resultUrl: videoUrl,
          updatedAt: new Date()
        } as any)
        .where(eq(videoTasks.id, parseInt(contentId) || 0));
    } catch (error) {
      console.error('Error updating video production status:', error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  getStatus() {
    return {
      isReady: this.isReady,
      backend: this.isReady ? 'Neon PostgreSQL' : 'localStorage (fallback)',
      message: this.isReady
        ? '✅ Connected to Neon PostgreSQL'
        : '⚠️  Using localStorage - configure DATABASE_URL to enable Neon'
    };
  }

  /**
   * Clear all localStorage data (for development/testing)
   */
  clearLocalStorage() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.localStoragePrefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} localStorage items`);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

export default databaseService;
