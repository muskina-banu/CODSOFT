import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { QuizCard } from './Home';

const CATEGORIES = ['General Knowledge','Science','History','Geography','Technology','Sports','Entertainment','Literature'];

export default function Quizzes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const data = await api.get('/quizzes?' + params);
      setQuizzes(data.quizzes);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { load(); }, [load]);

  const setParam = (key, val) => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev);
      if (val) n.set(key, val); else n.delete(key);
      n.delete('page');
      return n;
    });
  };

  const setPage = (p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; });

  let searchTimer;
  const handleSearch = (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setParam('search', val), 350);
  };

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="page-header-row" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Browse Quizzes</h1>
          <p className="page-sub">{total} quiz{total !== 1 ? 'zes' : ''} available</p>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="form-control"
          type="search"
          placeholder="Search quizzes..."
          defaultValue={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className="categories mb-4">
        <button className={`cat-chip ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => setParam('category', c)}>{c}</button>
        ))}
      </div>

      {loading
        ? <div className="quiz-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="quiz-card skeleton-card" />)}</div>
        : quizzes.length
          ? <div className="quiz-grid">{quizzes.map(q => <QuizCard key={q.id} quiz={q} />)}</div>
          : <div className="empty-state"><div className="empty-icon">🔍</div><h3>No quizzes found</h3><p>Try a different search or category</p></div>}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button>
          <span className="text-muted text-sm">Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
