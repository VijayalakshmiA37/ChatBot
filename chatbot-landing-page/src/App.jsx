import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from './hooks/useSocket';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
  const socket = useSocket(BACKEND_URL);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Theme state
  const [theme, setTheme] = useState('dark');

  // Billing cycle state ('monthly' | 'annually')
  const [billingCycle, setBillingCycle] = useState('monthly');

  // FAQ Active Accordion Index
  const [activeFaq, setActiveFaq] = useState(null);

  // Desktop preview chatbot open/close state
  const [desktopChatOpen, setDesktopChatOpen] = useState(true);

  // Hero Chat Messages state
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! 👋 I'm ChatFlow's AI assistant. How can I help you today?", isBot: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, {
        id: msg._id,
        text: msg.content,
        isBot: msg.role === 'assistant',
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };
    const handleTyping = ({ isTyping }) => setIsTyping(isTyping);
    
    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toggle FAQ Accordion
  const handleFaqToggle = (index) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  // Bot response logic
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let convId = activeConversationId;
    if (!convId) {
      try {
        const res = await axios.post(`${BACKEND_URL}/api/conversations`, { title: inputText.substring(0, 40) });
        convId = res.data._id;
        setActiveConversationId(convId);
        if (socket) socket.emit('join:conversation', convId);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    if (socket) {
      socket.emit('chat:send', { conversationId: convId, content: inputText });
    }
    setInputText("");
  };

  // Testimonials database
  const testimonials = [
    {
      quote: "ChatFlow replaced our first-line support overnight. Our customer satisfaction rating jumped from 82% to 98% within a month.",
      author: "Sarah Jenkins",
      role: "VP of Experience, CloudPulse",
      initials: "SJ"
    },
    {
      quote: "Integrating ChatFlow took less than 2 minutes. The developer APIs are cleanly documented, and the custom training makes the AI context-aware.",
      author: "David Chen",
      role: "Tech Lead, DevFlow Corp",
      initials: "DC"
    },
    {
      quote: "The responsive mobile layout is flawless. 70% of our chat sessions happen on mobile, and the interface matches our native app styling.",
      author: "Elena Rostova",
      role: "Product Director, LuxeWear",
      initials: "ER"
    }
  ];

  // FAQ Database
  const faqs = [
    {
      question: "How does ChatFlow train on my website content?",
      answer: "ChatFlow crawls your public webpages, documentation, and blog posts to build a tailored knowledge base. You can also upload PDF manuals, TXT files, or sync Zendesk and Notion guides directly to train the AI model."
    },
    {
      question: "Can I connect ChatFlow to third-party CRMs?",
      answer: "Yes! ChatFlow integrates natively with HubSpot, Salesforce, Slack, Zendesk, and Zapier. Transcripts, user details, and conversion flags sync automatically in real-time."
    },
    {
      question: "Does it support languages other than English?",
      answer: "Absolutely. ChatFlow natively understands, detects, and responds in over 90 languages. It auto-translates queries on-the-fly and replies to the customer in their native tongue."
    },
    {
      question: "Is there a limit on how many messages my bot can process?",
      answer: "Each plan comes with a soft monthly quota of chat sessions. If you exceed the quota, we do not shut down your bot; instead, we alert you and charge a tiny prorated overage fee or offer an upgrade."
    }
  ];

  // Bar chart data mock
  const chartBars = [
    { label: "Mon", height: "45%" },
    { label: "Tue", height: "65%" },
    { label: "Wed", height: "55%" },
    { label: "Thu", height: "85%" },
    { label: "Fri", height: "70%" },
    { label: "Sat", height: "95%" },
    { label: "Sun", height: "80%" }
  ];

  return (
    <div className={`landing-page ${theme}`}>
      {/* Background Decorative Glow Blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>
      <div className="glow-blob glow-blob-3"></div>

      {/* HEADER / NAVIGATION */}
      <header className="navbar">
        <div className="container navbar-content">
          <a href="#" className="logo-container">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span>ChatFlow</span>
          </a>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#demo" className="nav-link">Live Demo</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
            
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'dark' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="hero-tag">
              <span className="hero-tag-pulse"></span>
              <span>Next-Gen Conversational AI</span>
            </div>
            <h1 className="hero-headline">
              Smart AI Chatbot <br />
              for Your <span>Website</span>
            </h1>
            <p className="hero-sub">
              Empower your visitors with instant support, increase lead conversion rates by 40%, and automate routine support tickets 24/7. Simple setup in less than 2 minutes.
            </p>
            <div className="hero-ctas">
              <a href="#demo" className="btn-primary">
                Try Live Demo
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a href="#features" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>

          <div className="chat-mockup-wrapper">
            <div className="chat-mockup">
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    CF
                    <span className="chat-avatar-status"></span>
                  </div>
                  <div className="chat-user-details">
                    <h4>ChatFlow Assistant</h4>
                    <span>Active now | AI Agent</span>
                  </div>
                </div>
                <div className="chat-controls">
                  <span className="chat-control-dot"></span>
                  <span className="chat-control-dot"></span>
                  <span className="chat-control-dot"></span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className="chat-bubble-container">
                    <div className={`chat-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                      {msg.isBot ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                    </div>
                    <div className={`chat-meta ${msg.isBot ? 'bot' : 'user'}`}>
                      <span>{msg.time}</span>
                      {!msg.isBot && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-bubble bot" style={{ width: 'fit-content' }}>
                    <div className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  className="chat-input-field"
                  placeholder="Type a message (e.g. 'API' or 'Price')..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="chat-send-btn" aria-label="Send Message">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES ROW */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Key Features</span>
            <h2 className="section-title">Built for <span>Performance</span> & Scale</h2>
            <p className="section-sub">Everything you need to provide exceptional automated chat support on your website.</p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="feature-title-row">
                <span className="feature-checkmark">✔</span>
                <h3>Instant replies</h3>
              </div>
              <p>
                Powered by state-of-the-art LLMs responding in milliseconds. Never keep a prospective customer waiting again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div className="feature-title-row">
                <span className="feature-checkmark">✔</span>
                <h3>Responsive UI</h3>
              </div>
              <p>
                Flawless layout scaling. The chat widget shifts elegantly across tablet, mobile, desktop viewports and embeds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18l6-6-6-6M8 6L2 12l6 6"></path>
                </svg>
              </div>
              <div className="feature-title-row">
                <span className="feature-checkmark">✔</span>
                <h3>API integration</h3>
              </div>
              <p>
                Direct webhooks and REST endpoints to sync conversation transcripts and user details directly into your CRM.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
              <div className="feature-title-row">
                <span className="feature-checkmark">✔</span>
                <h3>Dark/Light mode</h3>
              </div>
              <p>
                Optimized visual aesthetics that adapt dynamically to any background theme for a premium look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO PREVIEW SECTION */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Interactive Preview</span>
            <h2 className="section-title">Live <span>Mockup</span> Previews</h2>
            <p className="section-sub">Compare the visitor-facing mobile widget and your developer-facing CRM dashboard side-by-side.</p>
          </div>

          <div className="demo-grid">
            {/* Desktop Mockup (SaaS Dashboard Upgrade) */}
            <div className="desktop-preview-wrapper">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', textAlign: 'center', fontWeight: '700' }}>Admin Analytics Dashboard</h3>
              <div className="desktop-preview">
                <div className="desktop-header">
                  <div className="desktop-header-left">
                    <span className="desktop-dot"></span>
                    <span className="desktop-dot"></span>
                    <span className="desktop-dot"></span>
                    <span className="desktop-title-tab">app.chatflow.ai/analytics</span>
                  </div>
                </div>
                <div className="desktop-body">
                  {/* Dashboard Sidebar */}
                  <aside className="desktop-sidebar">
                    <div className="sidebar-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>ChatFlow</span>
                    </div>
                    <div className="sidebar-menu-item">Inbox</div>
                    <div className="sidebar-menu-item active">Analytics</div>
                    <div className="sidebar-menu-item">Integrations</div>
                    <div className="sidebar-menu-item">Settings</div>
                  </aside>

                  {/* Dashboard Main Panel */}
                  <main className="desktop-main-panel">
                    <div className="dashboard-title-row">
                      <h4>Chat Performance</h4>
                      <span className="dashboard-badge">Live Updates</span>
                    </div>

                    <div className="dashboard-stats-row">
                      <div className="dashboard-stat-card">
                        <span className="dashboard-stat-label">Total Sessions</span>
                        <span className="dashboard-stat-value">14,820</span>
                        <span className="dashboard-stat-change">↑ 12.4%</span>
                      </div>
                      <div className="dashboard-stat-card">
                        <span className="dashboard-stat-label">Bot Resolved</span>
                        <span className="dashboard-stat-value">84.2%</span>
                        <span className="dashboard-stat-change" style={{ color: '#10b981' }}>Optimized</span>
                      </div>
                      <div className="dashboard-stat-card">
                        <span className="dashboard-stat-label">CSAT Rating</span>
                        <span className="dashboard-stat-value">98.2%</span>
                        <span className="dashboard-stat-change" style={{ color: '#10b981' }}>Excellent</span>
                      </div>
                    </div>

                    <div className="dashboard-chart-box">
                      <span className="chart-header">Customer Queries Over Time</span>
                      <div className="chart-bars-container">
                        {chartBars.map((bar, i) => (
                          <div key={i} className="chart-bar-col">
                            <div className="chart-bar-fill" style={{ height: bar.height }}></div>
                            <span className="chart-bar-label">{bar.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </main>
                  
                  {/* Floating chatbot bubble launcher */}
                  <div 
                    className="desktop-chatbot-bubble"
                    onClick={() => setDesktopChatOpen(!desktopChatOpen)}
                    title="Toggle Chatbot bubble"
                  >
                    {desktopChatOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                  </div>

                  {/* Desktop floating chat widget */}
                  {desktopChatOpen && (
                    <div className="chat-mockup" style={{ 
                      position: 'absolute', 
                      bottom: '86px', 
                      right: '24px', 
                      width: '260px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      animation: 'none'
                    }}>
                      <div className="chat-header" style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>ChatFlow Assistant</span>
                        <div className="chat-controls">
                          <span style={{ width: '6px', height: '6px' }} className="chat-control-dot"></span>
                          <span style={{ width: '6px', height: '6px' }} className="chat-control-dot"></span>
                        </div>
                      </div>
                      <div className="chat-messages" style={{ height: '140px', padding: '12px', gap: '8px' }}>
                        <div className="chat-bubble bot" style={{ fontSize: '11px', padding: '6px 10px' }}>
                          Hello! 👋 Need any help?
                        </div>
                        <div className="chat-bubble user" style={{ fontSize: '11px', padding: '6px 10px' }}>
                          How do I install?
                        </div>
                        <div className="chat-bubble bot" style={{ fontSize: '11px', padding: '6px 10px' }}>
                          Just add our script tag!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className="mobile-preview-wrapper">
              <h3 style={{ marginBottom: '20px', fontSize: '18px', textAlign: 'center', fontWeight: '700' }}>Mobile Widget Chat</h3>
              <div className="mobile-preview">
                <div className="mobile-notch"></div>
                
                <div className="mobile-header">
                  <div className="mobile-avatar">CF</div>
                  <div className="mobile-header-text">
                    <h4>ChatFlow</h4>
                    <span>Online | AI Chatbot</span>
                  </div>
                </div>

                <div className="mobile-chat-body">
                  <div className="mobile-bubble bot">
                    Hello! How can I help you today?
                  </div>
                  <div className="mobile-bubble user">
                    Does this support dark mode?
                  </div>
                  <div className="mobile-bubble bot">
                    Yes! Our UI adapts to light and dark modes automatically based on the site settings.
                  </div>
                  <div className="mobile-bubble bot">
                    Try toggling the theme switch on the top navbar of this page to see it in action!
                  </div>
                </div>

                <div className="mobile-input-bar">
                  <input type="text" className="mobile-input" placeholder="Type a message..." disabled />
                  <button className="mobile-send" aria-label="Send">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Flexible Pricing</span>
            <h2 className="section-title">Transparent <span>Pricing</span> for Everyone</h2>
            <p className="section-sub">Choose the plan that fits your business scale. No hidden fees.</p>
            
            <div className="pricing-toggle-wrapper">
              <span>Billed Monthly</span>
              <button 
                className={`pricing-toggle-btn ${billingCycle === 'annually' ? 'active' : ''}`}
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
                aria-label="Toggle Billing Cycle"
              >
                <span className="pricing-toggle-circle"></span>
              </button>
              <span>Billed Annually</span>
              <span className="pricing-discount-badge">Save 20%</span>
            </div>
          </div>

          <div className="pricing-grid">
            {/* Starter Plan */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Starter</h3>
                <p>Perfect for personal sites & blogs</p>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount">
                  {billingCycle === 'monthly' ? '$19' : '$15'}
                </span>
                <span className="pricing-period">/ month</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>1 Active Website</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>1,000 Chats / month</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Standard AI Training</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Email Support</span>
                </li>
              </ul>
              <a href="#demo" className="pricing-btn outline">Start Free Trial</a>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card popular">
              <div className="pricing-popular-badge">Most Popular</div>
              <div className="pricing-card-header">
                <h3>Pro</h3>
                <p>Ideal for growing SaaS & eCommerce</p>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount">
                  {billingCycle === 'monthly' ? '$49' : '$39'}
                </span>
                <span className="pricing-period">/ month</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>3 Active Websites</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>10,000 Chats / month</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Custom AI Knowledge Sync</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>API & Webhook Access</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Priority Slack Support</span>
                </li>
              </ul>
              <a href="#demo" className="pricing-btn solid">Start Free Trial</a>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Enterprise</h3>
                <p>For large organizations & platforms</p>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount">Custom</span>
              </div>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Unlimited Websites</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Unlimited Chats / month</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Custom LLM Fine-Tuning</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="pricing-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>99.9% SLA & Phone Support</span>
                </li>
              </ul>
              <a href="mailto:support@chatflow.ai" className="pricing-btn outline">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Loved by <span>SaaS Teams</span> Everywhere</h2>
            <p className="section-sub">See how ChatFlow is helping companies optimize their support workflow.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div className="testimonial-author-info">
                    <h4>{t.author}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
            <p className="section-sub">Have questions? We have answers. Find the most common queries below.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                <button className="faq-header" onClick={() => handleFaqToggle(i)}>
                  <span className="faq-question">{faq.question}</span>
                  <span className="faq-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
                <div className="faq-panel">
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER SECTION */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-card">
            <h2>Ready to Supercharge Your Site Support?</h2>
            <p>Start your 14-day free trial. Setup takes under 2 minutes, and no credit card is required to sign up.</p>
            <a href="#demo" className="btn-white">Get Started Free</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-info">
              <a href="#" className="footer-logo">ChatFlow</a>
              <p className="footer-tagline">
                Making customer communication simple, intelligent, and scalable for businesses worldwide.
              </p>
            </div>

            <div className="footer-links-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#demo" className="footer-link">Live Demo</a></li>
                <li><a href="#pricing" className="footer-link">Pricing</a></li>
                <li><a href="#faq" className="footer-link">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4>Contact Us</h4>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>support@chatflow.ai</span>
                </div>
                <div className="footer-contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>+91 3333333333</span>
                </div>
                <div className="footer-contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Coimbatore</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} ChatFlow AI Inc. All rights reserved.
            </p>
            <div className="footer-powered-badge">
              Powered by <span>ReactJS + AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
