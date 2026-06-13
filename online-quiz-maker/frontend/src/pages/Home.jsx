import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const CATEGORIES = ['General Knowledge','Science','History','Geography','Technology','Sports','Entertainment','Literature'];

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes?limit=6')
      .then(d => { setQuizzes(d.quizzes); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-chip">⚡ Create, Share & Learn</div>
          <h1>Build Quizzes That Actually <span className="highlight">Teach</span></h1>
          <p>Create professional multiple-choice quizzes in minutes. Share them with anyone. Track results in real-time.</p>
          <div className="hero-btns">
            {isLoggedIn
              ? <><Link className="btn btn-white btn-lg" to="/quiz/create">Create a Quiz</Link>
                  <Link className="btn btn-outline-white btn-lg" to="/quizzes">Browse Quizzes</Link></>
              : <><Link className="btn btn-white btn-lg" to="/register">Get Started Free</Link>
                  <Link className="btn btn-outline-white btn-lg" to="/quizzes">Browse Quizzes</Link></>}
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-num">{total}+</div><div className="hero-stat-label">Quizzes</div></div>
          <div className="hero-stat"><div className="hero-stat-num">8</div><div className="hero-stat-label">Categories</div></div>
          <div className="hero-stat"><div className="hero-stat-num">Free</div><div className="hero-stat-label">Always</div></div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white border-b">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '🧠', title: 'Easy Creation', desc: 'Build multiple-choice quizzes with custom points and time limits.' },
              { icon: '🏆', title: 'Instant Results', desc: 'Get detailed per-question breakdowns right after finishing.' },
              { icon: '📈', title: 'Track Progress', desc: 'View your history and see where you stand on the leaderboard.' },
            ].map(f => (
              <div key={f.title} className="feature">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-gray border-b">
        <div className="container text-center">
          <p className="section-label">Browse by Category</p>
          <div className="cats-center">
            {CATEGORIES.map(c => (
              <button key={c} className="cat-chip" onClick={() => navigate(`/quizzes?category=${encodeURIComponent(c)}`)}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Quizzes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">Latest Quizzes</h2><p className="section-sub">Fresh challenges from the community</p></div>
            <Link className="btn btn-ghost btn-sm" to="/quizzes">View all →</Link>
          </div>
          {loading
            ? <div className="quiz-grid">{[1,2,3].map(i => <div key={i} className="quiz-card skeleton-card" />)}</div>
            : quizzes.length
              ? <div className="quiz-grid">{quizzes.map(q => <QuizCard key={q.id} quiz={q} />)}</div>
              : <div className="empty-state"><div className="empty-icon">📝</div><p>No quizzes yet. <Link to="/quiz/create">Create the first one!</Link></p></div>}
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="cta-section">
          <div className="container text-center">
            <h2>Ready to test your knowledge?</h2>
            <p>Join thousands of learners today.</p>
            <Link className="btn btn-white btn-lg" to="/register">Sign Up Free</Link>
          </div>
        </section>
      )}
    </div>
  );
}

export function QuizCard({ quiz }) {
  const navigate = useNavigate();
  return (
    <div className="quiz-card" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
      <div className="quiz-card-top">
        <span className="badge badge-blue">{quiz.category}</span>
        <span className="text-xs text-muted">👥 {quiz.attemptCount}</span>
      </div>
      <h3 className="quiz-card-title">{quiz.title}</h3>
      <p className="quiz-card-desc">{quiz.description}</p>
      <div className="quiz-card-meta">
        <span>📚 {quiz.questionCount} questions</span>
        <span>⭐ {quiz.totalPoints} pts</span>
        {quiz.timeLimit && <span>⏱ {quiz.timeLimit}m</span>}
      </div>
      <p className="quiz-card-author">by {quiz.authorName}</p>
    </div>
  );
}
