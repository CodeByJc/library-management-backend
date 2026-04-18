const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'librarian'], default: 'student' }
}, { timestamps: true });
userSchema.index({ email: 1 });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  totalCopies: { type: Number, required: true, min: 1 },
  availableCopies: { type: Number, required: true, min: 0 }
}, { timestamps: true });
bookSchema.index({ isbn: 1 });

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ['issued', 'returned', 'renewed'], default: 'issued' }
}, { timestamps: true });
transactionSchema.index({ userId: 1, status: 1 });

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { User, Book, Transaction };
