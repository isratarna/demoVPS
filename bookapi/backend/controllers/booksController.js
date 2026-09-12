const { pool } = require('../database/db');

async function getBooks(req, res) {
  try {
    const { search } = req.query;
    let rows;

    if (search) {
      const like = `%${search}%`;
      [rows] = await pool.query(
        'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY created_at DESC',
        [like, like]
      );
    } else {
      [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
}

async function createBook(req, res) {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO books (title, author) VALUES (?, ?)',
      [title, author]
    );

    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Failed to create book' });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
}

module.exports = { getBooks, createBook, deleteBook };
