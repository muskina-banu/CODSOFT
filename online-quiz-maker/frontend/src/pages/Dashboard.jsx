import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/quizzes/my'), api.get('/attempts/my/all')])
      .then(([q, a]) => { setMyQuizzes(q); setAttempts(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    created: myQuizzes.length,
    taken: attempts.length,
    avg: attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0,
    best: attempts.length ? Math.max(...attempts.map(a => a.percentage)) : 0
  };

  const handlePublishToggle = async (quiz) => {
    try {
      const updated = await api.patch(`/quizzes/${quiz.id}/publish`, { published: !quiz.published });
      setMyQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, published: updated.published } : q));
    } catch { alert('Failed to update publish status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await api.delete('/quizzes/' + id);
      setMyQuizzes(prev => prev.filter(q => q.id !== id));
    } catch { alert('Failed to delete quiz'); }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
          <p className="page-sub">Your learning overview</p>
        </div>
        <Link className="btn btn-primary" to="/quiz/create">➕ Create Quiz</Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card"><div className="stat-value text-primary">{stats.created}</div><div className="stat-label">🧠 Quizzes Created</div></div>
        <div className="stat-card"><div className="stat-value text-success">{stats.taken}</div><div className="stat-label">📚 Quizzes Taken</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'var(--warning)'}}>{stats.avg}%</div><div className="stat-label">📊 Avg Score</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'#f59e0b'}}>{stats.best}%</div><div className="stat-label">🏆 Best Score</div></div>
      </div>

      <div className="two-col mt-4">
        {/* My Quizzes */}
        <div className="card">
          <div className="card-header">
            <h3>My Quizzes</h3>
            <Link className="btn btn-ghost btn-sm" to="/quiz/create">+ New</Link>
          </div>
          {myQuizzes.length === 0
            ? <div className="empty-state"><div className="empty-icon">📝</div><p>No quizzes yet.</p><Link className="btn btn-primary btn-sm mt-2" to="/quiz/create">Create your first</Link></div>
            : myQuizzes.map(q => (
                <div key={q.id} className="my-quiz-row">
                  <div className="my-quiz-info">
                    <div className="my-quiz-title">{q.title}</div>
                    <div className="my-quiz-meta">{q.questionCount} questions · {q.attemptCount} attempts</div>
                  </div>
                  <span className={`badge ${q.published ? 'badge-green' : 'badge-gray'}`}>{q.published ? 'Published' : 'Draft'}</span>
                  <div className="my-quiz-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/quiz/edit/${q.id}`)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handlePublishToggle(q)}>{q.published ? '⊘' : '🌐'}</button>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(q.id)}>🗑</button>
                  </div>
                </div>
              ))}
        </div>

        {/* Recent Attempts */}
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          {attempts.length === 0
            ? <div className="empty-state"><div className="empty-icon">⏳</div><p>No activity yet. <Link to="/quizzes">Browse quizzes</Link></p></div>
            : attempts.slice(0, 8).map(a => (
                <div key={a.id} className="activity-row" onClick={() => navigate(`/results/${a.id}`)} style={{cursor:'pointer'}}>
                  <div className={`activity-icon ${a.passed ? 'attempt-pass' : 'attempt-fail'}`}>{a.passed ? '✅' : '❌'}</div>
                  <div style={{flex:1}}>
                    <div className="activity-text"><strong>{a.quizTitle}</strong></div>
                    <div className="activity-score">{a.percentage}% · {a.score}/{a.totalPoints} pts</div>
                  </div>
                  <div className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
