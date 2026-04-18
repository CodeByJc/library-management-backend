const express = require('express');
const { body } = require('express-validator');
const c = require('./controllers');
const { protect, librarianOnly } = require('./middlewares');

const r = express.Router();

r.post('/auth/register', [body('email').isEmail(), body('password').isLength({min:6}), body('name').notEmpty()], c.validateReq, c.register);
r.post('/auth/login', [body('email').isEmail(), body('password').notEmpty()], c.validateReq, c.login);
r.get('/auth/users', protect, librarianOnly, c.getUsers);

r.post('/books', protect, librarianOnly, c.addBook);
r.get('/books', protect, c.listBooks);
r.put('/books/:id', protect, librarianOnly, c.updateBook);
r.delete('/books/:id', protect, librarianOnly, c.deleteBook);

r.post('/transactions/issue', protect, librarianOnly, c.issueBook);
r.put('/transactions/:id/return', protect, librarianOnly, c.returnBook);
r.put('/transactions/:id/renew', protect, librarianOnly, c.renewBook);
r.get('/transactions/all', protect, librarianOnly, c.getAllTransactions);
r.get('/transactions/history', protect, c.getHistory);

r.get('/reports', protect, librarianOnly, c.getReports);

module.exports = r;
