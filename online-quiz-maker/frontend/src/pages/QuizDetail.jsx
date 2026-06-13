import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function QuizDetail() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/quizzes/' + id)
      .then(setQuiz)
      .catch(() => setError('Quiz not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="alert alert-danger">{error}</div>
      <Link className="btn btn-outline" to="/quizzes">← Back</Link>
    </div>
  );

  return (
    <div className="container-md" style={{ paddingTop: 32 }}>
      <button className="back-link" onClick={() => navigate('/quizzes')}>← Back to Quizzes</button>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <span className="badge badge-blue">{quiz.category}</span>
        <span className={`badge ${quiz.published ? 'badge-green' : 'badge-gray'}`}>{quiz.published ? 'Published' : 'Draft'}</span>
      </div>

      <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 10 }}>{quiz.title}</h1>
      {quiz.description && <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{quiz.description}</p>}
      <p className="text-sm text-muted" style={{ marginBottom: 24 }}>by <strong>{quiz.authorName}</strong></p>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card"><div className="stat-value text-primary">{quiz.questionCount}</div><div className="stat-label">📚 Questions</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--warning)' }}>{quiz.totalPoints}</div><div className="stat-label">⭐ Points</div></div>
        <div className="stat-card"><div className="stat-value text-success">{quiz.attemptCount}</div><div className="stat-label">👥 Attempts</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#8b5cf6' }}>{quiz.timeLimit ?? '∞'}</div><div className="stat-label">⏱ {quiz.timeLimit ? 'Minutes' : 'No limit'}</div></div>
      </div>

      <div style={{ marginTop: 24 }}>
        {quiz.published
          ? isLoggedIn
            ? <button className="btn btn-primary btn-lg" onClick={() => navigate(`/quiz/take/${id}`)}>▶ Start Quiz</button>
            : <Link className="btn btn-primary btn-lg" to="/login">🔒 Sign in to Start</Link>
          : <p className="text-muted">This quiz is not published yet.</p>}
      </div>
    </div>
  );
}
