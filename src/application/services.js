const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userRepository, bookRepository, transactionRepository } = require('../infrastructure/repositories');

class AuthService {
  async register(data) {
    if (await userRepository.findByEmail(data.email)) throw new Error('Email already exists');
    const pwd = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({ ...data, password: pwd });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }
  async login(email, pwd) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    const match = await bcrypt.compare(pwd, user.password);
    if (!match) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }
}

class BookService {
  async add(data) { return bookRepository.create(data); }
  async list(query = {}, page = 1, limit = 8) { return bookRepository.findAll(query, page, limit); }
  async update(id, data) { return bookRepository.update(id, data); }
  async delete(id) { return bookRepository.delete(id); }
}

class TransactionService {
  async issue(userId, bookId) {
    if (!(await bookRepository.checkAvailability(bookId))) throw new Error('Book not available');
    if (await transactionRepository.findActive(userId, bookId)) throw new Error('User already has this book');
    await bookRepository.updateStock(bookId, true);
    const due = new Date(); due.setDate(due.getDate() + 14);
    return transactionRepository.create({ userId, bookId, dueDate: due });
  }
  async returnBook(id) {
    const tx = await transactionRepository.findById(id);
    if (!tx || tx.status === 'returned') throw new Error('Invalid transaction');
    const retDate = new Date();
    let fine = 0;
    if (retDate > tx.dueDate) {
      const days = Math.ceil((retDate - tx.dueDate) / (1000 * 60 * 60 * 24));
      fine = days * 10;
    }
    await bookRepository.updateStock(tx.bookId, false);
    return transactionRepository.update(id, { status: 'returned', returnDate: retDate, fine });
  }
  async renew(id) {
    const tx = await transactionRepository.findById(id);
    if (!tx || tx.status === 'returned') throw new Error('Invalid transaction');
    const due = new Date(tx.dueDate); due.setDate(due.getDate() + 14);
    return transactionRepository.update(id, { dueDate: due, status: 'renewed' });
  }
}

class ReportService {
  async getOverdue() { return transactionRepository.findOverdue(new Date()); }
  async getPopular() { return transactionRepository.getPopularBooks(); }
  async getUserHistory(id) { return transactionRepository.getUserHistory(id); }
  async getAllTransactions() { return transactionRepository.getAll(); }
}

module.exports = {
  authService: new AuthService(),
  bookService: new BookService(),
  transactionService: new TransactionService(),
  reportService: new ReportService(),
  userService: { list: () => userRepository.findAll() }
};
