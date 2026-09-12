import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorFromDb,
  updateAuthor as updateAuthorFromDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks,
} from '../models/authors.js';

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json({
      message: 'Authors retrieved successfully',
      data: authors
    });
  } catch (error) {
    console.error('GET /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAuthorById = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const author = await getAuthorByIdFromDb(requestedId);
    if (!author) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    return res.status(200).json({
      message: 'Author retrieved successfully',
      data: author
    });
  } catch (error) {
    console.error('GET /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const createAuthor = async (req, res) => {
  const { id, name, birthYear } = req.body;

  if (!id || !name || birthYear === undefined) {
    return res.status(400).json({ message: 'Missing required author fields: id, name, birthYear' });
  }

  try {
    const existingAuthor = await getAuthorByIdFromDb(id);
    if (existingAuthor) {
      return res.status(400).json({ message: 'Author id already exists.' });
    }

    const createdAuthor = await createAuthorFromDb({ id, name, birthYear });
    return res.status(201).json({
      message: 'Author created successfully',
      data: createdAuthor
    });
  } catch (error) {
    console.error('POST /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateAuthor = async (req, res) => {
  const requestedId = req.params.id;
  const { name, birthYear } = req.body;

  if (!name || birthYear === undefined) {
    return res.status(400).json({ message: 'Missing required author fields: name, birthYear' });
  }

  try {
    const existingAuthor = await getAuthorByIdFromDb(requestedId);
    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    const updatedAuthor = await updateAuthorFromDb(requestedId, { name, birthYear });
    return res.status(200).json({
      message: 'Author updated successfully',
      data: updatedAuthor
    });
  } catch (error) {
    console.error('PUT /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteAuthor = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const existingAuthor = await getAuthorByIdFromDb(requestedId);
    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    if (await authorHasBooks(requestedId)) {
      return res.status(409).json({ message: 'Author cannot be deleted because they still have books.' });
    }

    await deleteAuthorFromDb(requestedId);
    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };