const { validationResult } = require('express-validator');
const { authService, bookService, transactionService, reportService, userService } = require('../application/services');
const logger = require('../utils/logger');

const validateReq = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

exports.validateReq = validateReq;

// Auth Actions
exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    logger.info(`Registered user: ${result.user.email}`);
    res.status(201).json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    logger.info(`User login: ${result.user.email}`);
    res.json(result);
  } catch (err) { res.status(401).json({ error: err.message }); }
};

exports.getUsers = async (req, res, next) => {
  try { res.json(await userService.list()); } catch (err) { next(err); }
};

// Books Actions
exports.addBook = async (req, res, next) => {
  try { res.status(201).json(await bookService.add(req.body)); } catch (err) { next(err); }
};
exports.listBooks = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 8 } = req.query;
    const q = search
      ? { $or: [{ title: { $regex: search, $options: 'i' } }, { author: { $regex: search, $options: 'i' } }] }
      : {};
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(50, Math.max(1, parseInt(limit)));
    const result = await bookService.list(q, pg, lim);
    res.json({ data: result.data, total: result.total, page: pg, totalPages: Math.ceil(result.total / lim) });
  } catch (err) { next(err); }
};
exports.updateBook = async (req, res, next) => {
  try { res.json(await bookService.update(req.params.id, req.body)); } catch (err) { next(err); }
};
exports.deleteBook = async (req, res, next) => {
  try { await bookService.delete(req.params.id); res.json({ msg: 'Deleted' }); } catch (err) { next(err); }
};

// Transaction
exports.issueBook = async (req, res, next) => {
  try { res.status(201).json(await transactionService.issue(req.body.userId, req.body.bookId)); } catch (err) { res.status(400).json({ error: err.message }); }
};
exports.returnBook = async (req, res, next) => {
  try { res.json(await transactionService.returnBook(req.params.id)); } catch (err) { res.status(400).json({ error: err.message }); }
};
exports.renewBook = async (req, res, next) => {
  try { res.json(await transactionService.renew(req.params.id)); } catch (err) { res.status(400).json({ error: err.message }); }
};

// Reports
exports.getReports = async (req, res, next) => {
  try {
    res.json({
      overdue: await reportService.getOverdue(),
      popular: await reportService.getPopular()
    });
  } catch (err) { next(err); }
};
exports.getHistory = async (req, res, next) => {
  try { res.json(await reportService.getUserHistory(req.user.id)); } catch (err) { next(err); }
};
exports.getAllTransactions = async (req, res, next) => {
  try { res.json(await reportService.getAllTransactions()); } catch (err) { next(err); }
};
