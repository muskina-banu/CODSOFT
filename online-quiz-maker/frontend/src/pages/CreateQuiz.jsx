import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const CATEGORIES = ['General Knowledge','Science','History','Geography','Technology','Sports','Entertainment','Literature'];

function newQuestion() {
  return { text: '', points: 1, choices: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]};
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ title: '', description: '', category: '', timeLimit: '' });
  const [questions, setQuestions] = useState([newQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setDetail = (k, v) => setDetails(p => ({ ...p, [k]: v }));

  const updateQ = (qi, k, v) => setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [k]: v } : q));
  const updateChoice = (qi, ci, v) => setQuestions(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    return { ...q, choices: q.choices.map((c, j) => j === ci ? { ...c, text: v } : c) };
  }));
  const setCorrect = (qi, ci) => setQuestions(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    return { ...q, choices: q.choices.map((c, j) => ({ ...c, isCorrect: j === ci })) };
  }));
  const removeQ = (qi) => setQuestions(prev => prev.filter((_, i) => i !== qi));

  const handleSubmit = async () => {
    setError('');
    if (!details.title.trim() || !details.description.trim() || !details.category) {
      setError('Title, description and category are required'); return;
    }
    setLoading(true);
    try {
      const quiz = await api.post('/quizzes', {
        title: details.title, description: details.description,
        category: details.category, timeLimit: details.timeLimit ? parseInt(details.timeLimit) : null
      });
      for (const [i, q] of questions.entries()) {
        if (!q.text.trim()) continue;
        const validChoices = q.choices.filter(c => c.text.trim());
        if (validChoices.length < 2) continue;
        await api.post(`/quizzes/${quiz.id}/questions`, { text: q.text, choices: validChoices, points: q.points, order: i });
      }
      navigate(`/quiz/edit/${quiz.id}`);
    } catch (err) {
      setError(err?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-md" style={{ paddingTop: 32 }}>
      <button className="back-link" onClick={() => navigate('/dashboard')}>← Dashboard</button>
      <h1 className="page-title">Create a Quiz</h1>
      <p className="page-sub mb-4">Add details and questions below</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <p className="font-bold mb-3">Quiz Details</p>
          <div className="form-group"><label className="form-label">Title *</label>
            <input className="form-control" placeholder="e.g. World Geography Challenge" value={details.title} onChange={e => setDetail('title', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description *</label>
            <textarea className="form-control" placeholder="What is this quiz about?" value={details.description} onChange={e => setDetail('description', e.target.value)} /></div>
          <div className="input-row">
            <div className="form-group"><label className="form-label">Category *</label>
              <select className="form-control" value={details.category} onChange={e => setDetail('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Time Limit (minutes, optional)</label>
              <input className="form-control" type="number" placeholder="e.g. 10" min="1" value={details.timeLimit} onChange={e => setDetail('timeLimit', e.target.value)} /></div>
          </div>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="question-block">
          <div className="question-block-header">
            <span className="question-num">Question {qi + 1}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-control" style={{ width: 100, padding: '5px 10px', fontSize: '.82rem' }}
                value={q.points} onChange={e => updateQ(qi, 'points', parseInt(e.target.value))}>
                {[1,2,3,5,10].map(p => <option key={p} value={p}>{p} pt{p > 1 ? 's' : ''}</option>)}
              </select>
              {questions.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeQ(qi)}>🗑</button>}
            </div>
          </div>
          <div className="form-group">
            <input className="form-control" placeholder="Question text" value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)} />
          </div>
          {q.choices.map((c, ci) => (
            <div key={ci} className="choice-row">
              <button className={`choice-correct-btn ${c.isCorrect ? 'correct' : ''}`} onClick={() => setCorrect(qi, ci)} title="Mark as correct">✓</button>
              <input className={`form-control ${c.isCorrect ? 'correct-choice' : ''}`} placeholder={`Choice ${ci + 1}`} value={c.text} onChange={e => updateChoice(qi, ci, e.target.value)} />
            </div>
          ))}
          <p className="text-xs text-muted mt-1">Click ✓ to mark the correct answer</p>
        </div>
      ))}

      <button className="btn btn-outline btn-block mb-4" onClick={() => setQuestions(p => [...p, newQuestion()])}>➕ Add Question</button>
      <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</button>
    </div>
  );
}
