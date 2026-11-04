const { mongoose } = require('../config/mongo');

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['National', 'Regional', 'Restricted', 'Gazetted'],
      default: 'National',
    },
    year: {
      type: Number,
      default: 2026,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema);

