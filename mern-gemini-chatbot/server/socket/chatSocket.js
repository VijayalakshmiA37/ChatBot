const { Message, Conversation } = require('../models/models');
const { sendToGemini } = require('../services/gemini');

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join a conversation room
    socket.on('join:conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`📁 Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Handle incoming user message
    socket.on('chat:send', async ({ conversationId, content }) => {
      try {
        // 1. Save user message to MongoDB
        const userMsg = new Message({
          conversationId,
          role: 'user',
          content,
          timestamp: new Date()
        });
        await userMsg.save();

        // Emit user message back (confirmed saved)
        socket.emit('chat:message', {
          _id: userMsg._id,
          role: 'user',
          content,
          timestamp: userMsg.timestamp
        });

        // 2. Show typing indicator
        socket.emit('chat:typing', { isTyping: true });

        // 3. Fetch conversation history for context
        const history = await Message.find({ conversationId })
          .sort({ timestamp: 1 })
          .limit(20) // last 20 messages for context
          .lean();

        // Remove the just-saved message from history (already included as userMessage)
        const historyWithoutLast = history.slice(0, -1);

        // 4. Call Gemini AI
        const aiText = await sendToGemini(historyWithoutLast, content);

        // 5. Save AI response to MongoDB
        const aiMsg = new Message({
          conversationId,
          role: 'assistant',
          content: aiText,
          timestamp: new Date()
        });
        await aiMsg.save();

        // 6. Update conversation's updatedAt + auto-set title from first message
        const msgCount = await Message.countDocuments({ conversationId });
        const updateData = { updatedAt: new Date() };
        if (msgCount <= 2) {
          // Set title from first user message (truncate to 40 chars)
          updateData.title = content.length > 40 ? content.substring(0, 40) + '...' : content;
        }
        await Conversation.findByIdAndUpdate(conversationId, updateData);

        // 7. Hide typing indicator
        socket.emit('chat:typing', { isTyping: false });

        // 8. Emit AI response
        socket.emit('chat:message', {
          _id: aiMsg._id,
          role: 'assistant',
          content: aiText,
          timestamp: aiMsg.timestamp
        });

        // 9. Notify sidebar to refresh conversations
        socket.emit('conversations:updated');

      } catch (error) {
        console.error('Socket chat error:', error.message);
        socket.emit('chat:typing', { isTyping: false });
        socket.emit('chat:error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };
