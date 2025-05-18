// models/groupModel.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  maxGroups: { type: Number, required: true },
  maxMembers: { type: Number, required: true },
  openWindow: { type: Boolean, required: true },
  deadline: { type: String, required: true },
  year: { type: Number, required: true },
  batch: { type: Number, required: true },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
