import { PlusCircle, MessageSquare, Trash2, Menu } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ conversations, activeId, onSelect, onNew, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} style={{position: 'absolute', top: 12, left: 16, zIndex: 20}}>
        <Menu />
      </button>
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => { onNew(); setIsOpen(false); }}>
            <PlusCircle size={20} />
            New Chat
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map(chat => (
            <div 
              key={chat._id} 
              className={`conversation-item ${activeId === chat._id ? 'active' : ''}`}
              onClick={() => { onSelect(chat._id); setIsOpen(false); }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden'}}>
                <MessageSquare size={18} flexShrink={0} />
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {chat.title || 'New Chat'}
                </span>
              </div>
              <button 
                className="delete-btn" 
                onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
                title="Delete Chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
