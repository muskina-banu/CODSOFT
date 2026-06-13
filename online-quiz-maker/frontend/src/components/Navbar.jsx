import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link className="navbar-brand" to="/">
          <span>🧠</span> QuizMaker
        </Link>

        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <Link className="nav-link" to="/quizzes">Browse Quizzes</Link>
          {isLoggedIn && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          {isLoggedIn && <Link className="nav-link" to="/quiz/create">Create Quiz</Link>}

          {isLoggedIn ? (
            <div className="nav-dropdown" ref={dropRef}>
              <button className="nav-avatar" onClick={() => setOpen(!open)}>
                {user?.name?.[0]?.toUpperCase()}
              </button>
              {open && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user?.name}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                  <Link className="dropdown-item" to="/dashboard">🏠 Dashboard</Link>
                  <Link className="dropdown-item" to="/quiz/create">➕ Create Quiz</Link>
                  <div className="dropdown-sep" />
                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-btns">
              <Link className="btn btn-ghost btn-sm" to="/login">Log in</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
