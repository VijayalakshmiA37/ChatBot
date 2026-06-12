const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const systemInstruction = `You are ChatFlow, a friendly, smart, and helpful AI assistant.
- Answer questions clearly and concisely.
- Use markdown formatting when helpful (bold for emphasis, code blocks for code).
- If you don't know something, say so honestly.
- Be conversational and engaging.
- Keep responses focused and avoid unnecessary verbosity.`;

/**
 * Send a message to Groq (Llama 3) and get a response
 * @param {Array} history - Previous messages [{role, content}]
 * @param {string} userMessage - The new user message
 * @returns {string} - AI response text
 */
async function sendToGemini(history, userMessage) {
  try {
    // Format history for Groq
    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant", // Updated to the latest active model
      temperature: 0.7,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw new Error('Failed to get AI response from Groq. Please check your API key.');
  }
}

module.exports = { sendToGemini };
