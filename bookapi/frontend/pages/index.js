import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchBooks(query = '') {
    try {
      setLoading(true);
      setError('');
      const url = query
        ? `${API_URL}/api/books?search=${encodeURIComponent(query)}`
        : `${API_URL}/api/books`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleAddBook(e) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    try {
      setError('');
      const res = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author })
      });
      if (!res.ok) throw new Error('Failed to add book');
      setTitle('');
      setAuthor('');
      fetchBooks(search);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      setError('');
      const res = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete book');
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchBooks(search);
  }

  return (
    <div className="container">
      <h1>Book Management System</h1>

      {error && <p className="error">{error}</p>}

      <form className="form-row" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <form className="form-row" onSubmit={handleAddBook}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="submit">Add Book</button>
      </form>

      {loading ? (
        <p className="status">Loading books...</p>
      ) : books.length === 0 ? (
        <p className="status">No books found.</p>
      ) : (
        <ul className="book-list">
          {books.map((book) => (
            <li className="book-item" key={book.id}>
              <div className="book-info">
                <strong>{book.title}</strong>
                <span>{book.author}</span>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(book.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
