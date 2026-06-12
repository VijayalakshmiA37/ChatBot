import { Moon, Sun, Bot } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <header className="navbar">
      <div className="nav-title" style={{marginLeft: '40px'}}>
        <Bot size={28} color="var(--accent-color)" />
        ChatFlow AI
      </div>
      
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
};

export default Navbar;
