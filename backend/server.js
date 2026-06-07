

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ── Connect MongoDB ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salestrack';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Schemas ───────────────────────────────────────────────────────────────
const SaleSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:      { type: Number, required: true },
  paymentType: { type: String, enum: ['cash','upi'], required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'General' },
  date:        { type: Date, default: Date.now },
  dateStr:     { type: String }   // YYYY-MM-DD
});

const ExpenditureSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  category:    { type: String, default: 'General' },
  date:        { type: Date, default: Date.now },
  dateStr:     { type: String }
});

const UserSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  name:        { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now }
});

const Sale        = mongoose.model('Sale', SaleSchema);
const Expenditure = mongoose.model('Expenditure', ExpenditureSchema);
const User        = mongoose.model('User', UserSchema);

const todayStr = () => new Date().toISOString().split('T')[0];

// ── Auth Middleware ─────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ── Auth Endpoints ─────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── Sales ─────────────────────────────────────────────────────────────────
app.post('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentType, description } = req.body;
    const sale = await Sale.create({ userId: req.user.userId, amount, paymentType, description, dateStr: todayStr() });
    res.json({ success: true, sale });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const sales = await Sale.find({ userId: req.user.userId, ...(date ? { dateStr: date } : {}) }).sort({ date: -1 });
    res.json(sales);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/sales/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── Expenditures ──────────────────────────────────────────────────────────
app.post('/api/expenditures', authenticateToken, async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const exp = await Expenditure.create({ userId: req.user.userId, amount, description, category, dateStr: todayStr() });
    res.json({ success: true, expenditure: exp });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/expenditures', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const exps = await Expenditure.find({ userId: req.user.userId, ...(date ? { dateStr: date } : {}) }).sort({ date: -1 });
    res.json(exps);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/expenditures/:id', authenticateToken, async (req, res) => {
  try {
    const exp = await Expenditure.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!exp) return res.status(404).json({ error: 'Expenditure not found' });
    await Expenditure.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── Summary ───────────────────────────────────────────────────────────────
app.get('/api/summary', authenticateToken, async (req, res) => {
  try {
    const date = req.query.date || todayStr();
    const [sales, exps] = await Promise.all([
      Sale.find({ userId: req.user.userId, dateStr: date }),
      Expenditure.find({ userId: req.user.userId, dateStr: date })
    ]);
    const cashSales = sales.filter(s=>s.paymentType==='cash').reduce((a,s)=>a+s.amount,0);
    const upiSales  = sales.filter(s=>s.paymentType==='upi').reduce((a,s)=>a+s.amount,0);
    const totalSales = cashSales + upiSales;
    const totalExpenditure = exps.reduce((a,e)=>a+e.amount,0);
    res.json({ date, cashSales, upiSales, totalSales, totalExpenditure, savings: totalSales - totalExpenditure });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── 7-day chart ───────────────────────────────────────────────────────────
app.get('/api/chart/weekly', authenticateToken, async (req, res) => {
  try {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const data = await Promise.all(days.map(async day => {
      const [s, e] = await Promise.all([
        Sale.find({ userId: req.user.userId, dateStr: day }),
        Expenditure.find({ userId: req.user.userId, dateStr: day })
      ]);
      const sales = s.reduce((a,x)=>a+x.amount,0);
      const expenditure = e.reduce((a,x)=>a+x.amount,0);
      return { date: day, sales, expenditure, savings: sales - expenditure };
    }));
    res.json(data);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/', (req, res) => res.json({ status: 'SalesTrack API running ✅' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
