import mongoose, { Schema, Document } from "mongoose";

export interface IContentItem extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'youtube' | 'instagram' | 'link' | 'note' | 'idea' | 'snippet';
  sourceUrl?: string;
  sourcePlatform?: string;
  thumbnailUrl?: string;
  title: string;
  rawContent: string;
  summary: string;
  tags: string[];
  category: string;
  subcategory: string;
  manualNote?: string;
  embedding?: number[];
  status: 'active' | 'archived' | 'deleted';
  isPinned: boolean;
  importanceScore: number;
  aiQuestions: { question: string; answer: string }[];
  isDuplicate: boolean;
  processingStatus: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const ContentItemSchema = new Schema<IContentItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['youtube', 'instagram', 'link', 'note', 'idea', 'snippet'],
    required: true,
  },
  sourceUrl: String,
  sourcePlatform: String,
  thumbnailUrl: String,

  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  tags: [{ 
    type: String
   }],
  category: {
     type: String,
     default: 'General'
    },
  subcategory: { 
    type: String,
    default: '' 
  },
  manualNote: String,

  embedding: [Number],

  status: { 
    type: String,
    enum: ['active', 'archived', 'deleted'], default: 'active'
  },
  isPinned: { 
    type: Boolean, 
    default: false
   },
  importanceScore: { 
    type: Number, 
    default: 5, min: 1, max: 10 
  },
  aiQuestions: [
    {
      question: String,
      answer: String,
    },
  ],
  isDuplicate: { 
    type: Boolean, 
    default: false 
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending',
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
})

ContentItemSchema.index({
  title:'text',
  summary: 'text',
  tags:'text',
  rawContent: 'text',
})

export default mongoose.models.ContentItem || mongoose.model<IContentItem>('ContentItem',ContentItemSchema);