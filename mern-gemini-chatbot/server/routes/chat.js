const express = require('express');
const router = express.Router();
const { Message, Conversation } = require('../models/models');

// GET all conversations (newest first)
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const conversation = new Conversation({
      title: req.body.title || 'New Chat',
      updatedAt: new Date()
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update conversation title
router.patch('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, updatedAt: new Date() },
      { new: true }
    );
    if (!conversation) return res.status(404).json({ error: 'Not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE conversation and all its messages
router.delete('/conversations/:id', async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all messages in a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
