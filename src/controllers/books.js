// src/controllers/books.js
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists
} from '../models/books.js';

// GET /books
const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json({
      message: 'Books retrieved successfully',
      data: books
    });
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /books/:id
const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({
      message: 'Certain Book retrieved successfully',
      data: book
    });
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /books
const createBookHandler = async (req, res) => {
  const { id, authorId, title, publicationDate } = req.body;

  // 1. Validate required fields
  if (!id || !authorId || !title || !publicationDate) {
    return res.status(400).json({
      message: 'Missing required book fields: id, authorId, title, publicationDate'
    });
  }

  try {
    // 2. Reject if book ID already exists
    const existingBook = await getBookById(id);
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ID already exists' });
    }

    // 3. Reject if authorId does not match an existing author
    const exists = await authorExists(authorId);
    if (!exists) {
      return res.status(400).json({ message: 'Referenced authorId does not exist' });
    }

    const newBook = await createBook({ id, authorId, title, publicationDate });
    return res.status(201).json({
      message: 'Book created successfully',
      data: newBook
    });
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /books/:id
const updateBookHandler = async (req, res) => {
  const requestedId = req.params.id;
  const { authorId, title, publicationDate } = req.body;

  // 1. Validate required fields
  if (!authorId || !title || !publicationDate) {
    return res.status(400).json({
      message: 'Missing required book fields: authorId, title, publicationDate'
    });
  }

  try {
    // 2. Check if book exists
    const existingBook = await getBookById(requestedId);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 3. Reject if authorId does not match an existing author
    const exists = await authorExists(authorId);
    if (!exists) {
      return res.status(400).json({ message: 'Referenced authorId does not exist' });
    }

    const updatedBook = await updateBook(requestedId, { authorId, title, publicationDate });
    return res.status(200).json({
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /books/:id
const deleteBookHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    // 1. Check if book exists
    const existingBook = await getBookById(requestedId);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 2. Delete book and return status 204 No Content
    await deleteBook(requestedId);
    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { getBooksHandler, getBookByIdHandler, createBookHandler, updateBookHandler, deleteBookHandler};