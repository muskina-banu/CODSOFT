import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const CATEGORIES = ['General Knowledge','Science','History','Geography','Technology','Sports','Entertainment','Literature'];

function newQuestion() {
  return { text: '', points: 1, choices: [
    { text: '', isCorrect: true }, { text: '', isCorrect: false },
    { text: '', isCorrect: false }, { text: '', isCorrect: false },
  ]};
}

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [details, setDetails] = useState({ title: '', description: '', category: '', timeLimit: '' });
  const [newQs, setNewQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/quizzes/' + id)
      .then(q => { setQuiz(q); setDetails({ title: q.title, description: q.description, category: q.category, timeLimit: q.timeLimit || '' }); })
      .catch(() => setError('Quiz not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const setDetail = (k, v) => setDetails(p => ({ ...p, [k]: v }));
  const updateNewQ = (qi, k, v) => setNewQs(prev => prev.map((q, i) => i === qi ? { ...q, [k]: v } : q));
  const updateNewChoice = (qi, ci, v) => setNewQs(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    return { ...q, choices: q.choices.map((c, j) => j === ci ? { ...c, text: v } : c) };
  }));
  const setNewCorrect = (qi, ci) => setNewQs(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    return { ...q, choices: q.choices.map((c, j) => ({ ...c, isCorrect: j === ci })) };
  }));

  const handleDeleteQ = async (qid) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/quizzes/${id}/questions/${qid}`);
      setQuiz(q => ({ ...q, questions: q.questions.filter(x => x._id !== qid), questionCount: q.questionCount - 1 }));
    } catch { alert('Failed to delete question'); }
  };

  const handlePublish = async () => {
    try {
      const updated = await api.patch(`/quizzes/${id}/publish`, { published: !quiz.published });
      setQuiz(q => ({ ...q, published: updated.published }));
    } catch { alert('Failed to update'); }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/quizzes/' + id, { title: details.title, description: details.description, category: details.category, timeLimit: details.timeLimit ? parseInt(details.timeLimit) : null });
      for (const [i, q] of newQs.entries()) {
        if (!q.text.trim()) continue;
        const valid = q.choices.filter(c => c.text.trim());
        if (valid.length < 2) continue;
        await api.post(`/quizzes/${id}/questions`, { text: q.text, choices: valid, points: q.points, order: i });
      }
      const updated = await api.get('/quizzes/' + id);
      setQuiz(updated);
      setDetails({ title: updated.title, description: updated.description, category: updated.category, timeLimit: updated.timeLimit || '' });
      setNewQs([]);
      setSuccess(true);
    } catch (err) { setError(err?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!quiz) return <div className="container" style={{ paddingTop: 32 }}><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-md" style={{ paddingTop: 32 }}>
      <button className="back-link" onClick={() => navigate('/dashboard')}>← Dashboard</button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h1 className="page-title">Edit Quiz</h1><p className="page-sub">{quiz.questionCount} questions</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${quiz.published ? 'badge-green' : 'badge-gray'}`}>{quiz.published ? 'Published' : 'Draft'}</span>
          <button className="btn btn-outline btn-sm" onClick={handlePublish}>{quiz.published ? '⊘ Unpublish' : '🌐 Publish'}</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">✅ Quiz saved successfully!</div>}

      <div className="card mb-4"><div className="card-body">
        <p className="font-bold mb-3">Quiz Details</p>
        <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={details.title} onChange={e => setDetail('title', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={details.description} onChange={e => setDetail('description', e.target.value)} /></div>
        <div className="input-row">
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-control" value={details.category} onChange={e => setDetail('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Time Limit (min)</label>
            <input className="form-control" type="number" min="1" value={details.timeLimit} onChange={e => setDetail('timeLimit', e.target.value)} /></div>
        </div>
      </div></div>

      {/* Existing Questions */}
      {quiz.questions?.length > 0 && <>
        <p className="text-xs text-muted font-bold mb-2" style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>Existing Questions</p>
        {quiz.questions.map((q, i) => (
          <div key={q._id} className="question-block">
            <div className="question-block-header">
              <span className="question-num">Q{i + 1} · {q.points} pt{q.points !== 1 ? 's' : ''}</span>
              <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDeleteQ(q._id)}>🗑 Delete</button>
            </div>
            <p className="font-semibold text-sm mb-2">{q.text}</p>
            {q.choices?.map(c => (
              <div key={c._id} style={{ fontSize: '.82rem', padding: '4px 8px', borderRadius: 6, marginBottom: 4, background: c.isCorrect ? '#f0fdf4' : 'transparent', color: c.isCorrect ? '#166534' : 'var(--text-muted)', fontWeight: c.isCorrect ? 600 : 400 }}>
                {c.isCorrect ? '✓' : '○'} {c.text}
              </div>
            ))}
          </div>
        ))}
      </>}

      {/* New Questions */}
      {newQs.length > 0 && <>
        <p className="text-xs text-muted font-bold mb-2 mt-4" style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>New Questions</p>
        {newQs.map((q, qi) => (
          <div key={qi} className="question-block" style={{ borderColor: 'var(--primary)' }}>
            <div className="question-block-header">
              <span className="question-num">New Q{qi + 1}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setNewQs(p => p.filter((_, i) => i !== qi))}>🗑</button>
            </div>
            <div className="form-group"><input className="form-control" placeholder="Question text" value={q.text} onChange={e => updateNewQ(qi, 'text', e.target.value)} /></div>
            {q.choices.map((c, ci) => (
              <div key={ci} className="choice-row">
                <button className={`choice-correct-btn ${c.isCorrect ? 'correct' : ''}`} onClick={() => setNewCorrect(qi, ci)}>✓</button>
                <input className={`form-control ${c.isCorrect ? 'correct-choice' : ''}`} placeholder={`Choice ${ci + 1}`} value={c.text} onChange={e => updateNewChoice(qi, ci, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </>}

      <button className="btn btn-outline btn-block mb-4" onClick={() => setNewQs(p => [...p, newQuestion()])}>➕ Add Question</button>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        <button className="btn btn-ghost" onClick={() => navigate(`/quizzes/${id}`)}>View Quiz</button>
      </div>
    </div>
  );
}
