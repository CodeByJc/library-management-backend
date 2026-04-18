const { User, Book, Transaction } = require('./models');
const { UserEntity, BookEntity, TransactionEntity } = require('../domain/entities');

class UserRepository {
  async create(data) { const res = await User.create(data); return new UserEntity(res.toObject()); }
  async findByEmail(email) { const res = await User.findOne({ email }); return res ? new UserEntity(res.toObject()) : null; }
  async findById(id) { const res = await User.findById(id).select('-password'); return res ? new UserEntity(res.toObject()) : null; }
  async findAll() { const res = await User.find().select('-password'); return res.map(u => new UserEntity(u.toObject())); }
}

class BookRepository {
  async create(data) { const res = await Book.create(data); return new BookEntity(res.toObject()); }
  async findById(id) { const res = await Book.findById(id); return res ? new BookEntity(res.toObject()) : null; }
  async findAll(query = {}, page = 1, limit = 8) {
    const skip = (page - 1) * limit;
    const [res, total] = await Promise.all([
      Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(query)
    ]);
    return { data: res.map(b => new BookEntity(b.toObject())), total };
  }
  async update(id, data) { const res = await Book.findByIdAndUpdate(id, data, { new: true, runValidators: true }); return res ? new BookEntity(res.toObject()) : null; }
  async delete(id) { return Book.findByIdAndDelete(id); }
  async checkAvailability(id) { const bk = await Book.findById(id); return bk && bk.availableCopies > 0; }
  async updateStock(id, decrement = true) {
    const inc = decrement ? -1 : 1;
    return Book.findByIdAndUpdate(id, { $inc: { availableCopies: inc } }, { new: true });
  }
}

class TransactionRepository {
  async create(data) { const res = await Transaction.create(data); return new TransactionEntity(res.toObject()); }
  async findById(id) { const res = await Transaction.findById(id); return res ? new TransactionEntity(res.toObject()) : null; }
  async update(id, data) { const res = await Transaction.findByIdAndUpdate(id, data, { new: true }); return res ? new TransactionEntity(res.toObject()) : null; }
  async findActive(userId, bookId) { return Transaction.findOne({ userId, bookId, status: { $in: ['issued', 'renewed'] } }); }
  async findOverdue(date) { return Transaction.find({ status: { $in: ['issued', 'renewed'] }, dueDate: { $lt: date } }).populate('bookId', 'title isbn').populate('userId', 'name email'); }
  async getUserHistory(userId) { return Transaction.find({ userId }).populate('bookId', 'title author').sort({ issueDate: -1 }); }
  async getAll() { return Transaction.find().populate('bookId', 'title').populate('userId', 'name email').sort({ issueDate: -1 }); }
  async getPopularBooks() {
    return Transaction.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' },
      { $project: { title: '$book.title', author: '$book.author', count: 1 } }
    ]);
  }
}

module.exports = {
  userRepository: new UserRepository(),
  bookRepository: new BookRepository(),
  transactionRepository: new TransactionRepository()
};
