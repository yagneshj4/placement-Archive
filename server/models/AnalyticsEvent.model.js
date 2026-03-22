import mongoose from 'mongoose'

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'experience_view',
        'experience_submit',
        'experience_bookmark',
        'question_view',
        'question_skip',
        'question_rate',
        'question_time',
        'search_query',
        'rag_query',
        'page_view',
      ],
      index: true,
    },

    // Reference to the relevant document
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    targetModel: {
      type: String,
      enum: ['Experience', 'Question', 'Resource', null],
      default: null,
    },

    // Event-specific payload
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Context
    sessionId: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    // No updates - append only. Disable versioning for performance.
    versionKey: false,
  },
)

// Compound indexes for aggregation queries used by XGBoost retraining
analyticsEventSchema.index({ targetId: 1, eventType: 1 })
analyticsEventSchema.index({ userId: 1, eventType: 1 })
analyticsEventSchema.index({ createdAt: -1 })
analyticsEventSchema.index({ eventType: 1, createdAt: -1 })

// TTL index - auto-delete raw events older than 1 year to control storage
analyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60, name: 'analytics_ttl' },
)

export default mongoose.model('AnalyticsEvent', analyticsEventSchema)