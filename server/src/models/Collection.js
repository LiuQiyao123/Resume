const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 确保用户对同一职位只能收藏一次
CollectionSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Collection', CollectionSchema); 