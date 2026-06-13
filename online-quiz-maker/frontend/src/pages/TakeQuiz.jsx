import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  const submit = useCallback(async (ans) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const payload = (questions).map(q => ({
        questionId: q.id,
        selectedChoiceId: (ans || answers)[q.id] || ''
      }));
      const result = await api.post(`/quizzes/${id}/attempt`, { answers: payload });
      navigate(`/results/${result.id}`);
    } catch (err) {
      setError(err?.data?.error || 'Failed to submit');
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [questions, answers, id, navigate]);

  useEffect(() => {
    Promise.all([api.get('/quizzes/' + id), api.get(`/quizzes/${id}/questions`)])
      .then(([q, qs]) => {
        setQuiz(q);
        const sorted = qs.sort((a, b) => a.order - b.order);
        setQuestions(sorted);
        if (q.timeLimit) setTimeLeft(q.timeLimit * 60);
      })
      .catch(() => setError('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submit(answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const selectAnswer = (qid, cid) => setAnswers(prev => ({ ...prev, [qid]: cid }));

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (error) return <div className="container" style={{ paddingTop: 48 }}><div className="alert alert-danger">{error}</div></div>;
  if (!questions.length) return <div className="container" style={{ paddingTop: 48 }}><div className="alert alert-danger">This quiz has no questions yet.</div></div>;

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const urgent = timeLeft !== null && timeLeft < 60;

  return (
    <div className="container-md" style={{ paddingTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="font-bold" style={{ fontSize: '1.05rem' }}>{quiz.title}</div>
        {timeLeft !== null && (
          <div className={`timer ${urgent ? 'urgent' : ''}`}>
            <span>⏱</span> <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted mb-3">Question {current + 1} of {questions.length} · {answered} answered</p>

      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
            <div className="quiz-question">{q.text}</div>
            <span className="badge badge-blue" style={{ flexShrink: 0 }}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
          </div>
          {q.choices.map(c => (
            <div key={c.id} className={`choice-option ${answers[q.id] === c.id ? 'selected' : ''}`} onClick={() => selectAnswer(q.id, c.id)}>
              <div className="choice-radio" />
              {c.text}
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-nav">
        <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>← Prev</button>

        <div className="quiz-dots">
          {questions.map((_, i) => (
            <button key={i} className={`quiz-dot ${i === current ? 'current' : answers[questions[i].id] ? 'answered' : ''}`} onClick={() => setCurrent(i)}>{i + 1}</button>
          ))}
        </div>

        {current < questions.length - 1
          ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          : <button className="btn btn-success" onClick={() => submit(answers)} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit ✓'}</button>}
      </div>

      {current === questions.length - 1 && answered < questions.length && (
        <p className="text-xs text-muted text-center mt-3">{questions.length - answered} question{questions.length - answered !== 1 ? 's' : ''} unanswered — you can still submit</p>
      )}
    </div>
  );
}
