// src/models/books.js
import { getDb } from '../db/connect.js';

// To Get all books
const getAllBooks = async () => {
  const db = getDb();
  const collection = db.collection('books');
  const books = await collection.find({}).toArray();
  return books;
};

// To  Get one book by id
const getBookById = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');
  const book = await collection.findOne({ id: bookId });
  return book;
};

// To Create a new book
const createBook = async (bookData) => {
  const db = getDb();
  const collection = db.collection('books');
  const { id, title, publicationDate, authorId } = bookData;
  const newBook = { id, title, publicationDate, authorId };
  await collection.insertOne(newBook);
  return newBook;
};

// To Update an existing book by id
const updateBook = async (bookId, updateData) => {
  const db = getDb();
  const collection = db.collection('books');
  const { title, publicationDate, authorId } = updateData;

  const result = await collection.findOneAndUpdate(
    { id: bookId },
    { $set: { title, publicationDate, authorId } },
    { returnDocument: 'after' }
  );
  return result;
};

// To Delete a book by id
const deleteBook = async (bookId) => {
  const db = getDb();
  const collection = db.collection('books');
  const result = await collection.deleteOne({ id: bookId });
  return result.deletedCount > 0;
};

// Helper: Check if referenced authorId exists in the authors collection
const authorExists = async (authorId) => {
  const db = getDb();
  const collection = db.collection('authors');
  const author = await collection.findOne({ id: authorId });
  return Boolean(author);
};

export { getAllBooks, getBookById, createBook, updateBook, deleteBook, authorExists };