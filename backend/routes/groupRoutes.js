const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Define your routes
router.post('/', groupController.saveGroupSetting);
router.put('/:id', groupController.updateGroupSetting);
router.delete('/:id', groupController.deleteGroupSetting);
router.get('/', groupController.getGroupSettings);

module.exports = router; // This must export the router
