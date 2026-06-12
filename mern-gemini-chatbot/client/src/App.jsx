import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import './index.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const socket = useSocket(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/conversations`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  // Switch conversation
  const selectConversation = async (id) => {
    setActiveConversationId(id);
    if (socket) socket.emit('join:conversation', id);
    try {
      const res = await axios.get(`${API_URL}/conversations/${id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    
    const handleTyping = ({ isTyping }) => {
      setIsTyping(isTyping);
    };

    const handleConversationsUpdated = () => {
      fetchConversations();
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('conversations:updated', handleConversationsUpdated);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('conversations:updated', handleConversationsUpdated);
    };
  }, [socket]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    let convId = activeConversationId;
    
    // If no active conversation, create one first
    if (!convId) {
      try {
        const res = await axios.post(`${API_URL}/conversations`, { title: text.substring(0, 40) });
        convId = res.data._id;
        setActiveConversationId(convId);
        setConversations([res.data, ...conversations]);
        if (socket) socket.emit('join:conversation', convId);
      } catch (err) {
        console.error('Failed to create conversation', err);
        return;
      }
    }

    if (socket) {
      socket.emit('chat:send', { conversationId: convId, content: text });
    }
  };

  const createNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (id) => {
    try {
      await axios.delete(`${API_URL}/conversations/${id}`);
      setConversations(conversations.filter(c => c._id !== id));
      if (activeConversationId === id) createNewChat();
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        conversations={conversations} 
        activeId={activeConversationId} 
        onSelect={selectConversation}
        onNew={createNewChat}
        onDelete={deleteConversation}
      />
      <main className="main-content">
        <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        <ChatWindow messages={messages} isTyping={isTyping} />
        <InputBar onSend={handleSend} disabled={isTyping} />
      </main>
    </div>
  );
}

export default App;
