import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/attempts/' + id)
      .then(setResult)
      .catch(() => setError('Result not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return <div className="container" style={{ paddingTop: 48 }}><div className="alert alert-danger">{error}</div></div>;

  const { percentage, passed, score, totalPoints, answers, quizTitle, quizId } = result;
  const correct = answers.filter(a => a.isCorrect).length;
  const heroClass = percentage >= 80 ? 'pass' : percentage >= 60 ? 'average' : 'fail';
  const label = percentage >= 80 ? '🏆 Excellent!' : percentage >= 60 ? '✅ Passed!' : '📚 Keep Practicing';

  return (
    <div className="container-md" style={{ paddingTop: 32 }}>
      <div className={`result-hero ${heroClass}`}>
        <div className="result-score">{percentage}%</div>
        <div className="result-label">{label}</div>
        <div className="result-sub">{quizTitle}</div>
        <div className="result-stats">
          <span className="result-stat-chip">{correct} of {answers.length} correct</span>
          <span className="result-stat-chip">{score} / {totalPoints} pts</span>
        </div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card"><div className={`stat-value ${percentage >= 60 ? 'text-success' : 'text-danger'}`}>{percentage}%</div><div className="stat-label">Score</div></div>
        <div className="stat-card"><div className="stat-value text-success">{correct}</div><div className="stat-label">Correct</div></div>
        <div className="stat-card"><div className="stat-value text-danger">{answers.length - correct}</div><div className="stat-label">Incorrect</div></div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><h3>Question Breakdown</h3></div>
        <div className="card-body">
          {answers.map((a, i) => (
            <div key={i} className={`answer-row ${a.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-icon">{a.isCorrect ? '✅' : '❌'}</div>
              <div style={{ flex: 1 }}>
                <div className="answer-q">Q{i + 1}: {a.questionText}</div>
                {!a.isCorrect && a.selectedChoiceText && (
                  <div className="answer-detail">Your answer: {a.selectedChoiceText}</div>
                )}
                {!a.isCorrect && (
                  <div className="answer-detail text-success">Correct: {a.correctChoiceText}</div>
                )}
              </div>
              <div className={`answer-pts ${a.isCorrect ? 'text-success' : 'text-danger'}`}>{a.pointsEarned}/{a.pointsPossible} pts</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/quiz/take/${quizId}`)}>🔁 Try Again</button>
        <button className="btn btn-outline" onClick={() => navigate('/quizzes')}>📚 Browse More</button>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
      </div>
    </div>
  );
}
