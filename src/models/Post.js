const { mongoose } = require('../config/mongo');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      default: 'CEO Office & HR Leadership'
    },
    authorAvatar: {
      type: String,
      default: 'HQ'
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    badge: {
      type: String,
      default: 'Official HR Circular'
    },
    priority: {
      type: String,
      enum: ['High', 'Normal', 'Kudos'],
      default: 'Normal'
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [
      {
        type: String // user IDs
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);

