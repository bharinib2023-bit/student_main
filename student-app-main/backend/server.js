require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { Dropbox } = require('dropbox');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(cors());
app.use(express.json());

// Auth0: every /api route needs a valid login token
app.use('/api', auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'));

const Student = mongoose.model('Student', new mongoose.Schema({
  name: String,
  email: String,
  course: String,
  age: Number,
  photoUrl: String,
}));

// Dropbox
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
console.log('token length:', (process.env.DROPBOX_ACCESS_TOKEN || '').length);
const upload = multer({ storage: multer.memoryStorage() });

// ---------- CRUD ----------
app.get('/api/students', async (req, res) => {
  res.json(await Student.find());
});

app.post('/api/students', async (req, res) => {
  res.json(await Student.create(req.body));
});

app.put('/api/students/:id', async (req, res) => {
  res.json(await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ---------- Dropbox upload ----------
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const path = '/students/' + Date.now() + '-' + req.file.originalname;
    await dbx.filesUpload({ path, contents: req.file.buffer });
    const link = await dbx.sharingCreateSharedLinkWithSettings({ path });
    res.json({ url: link.result.url.replace('dl=0', 'raw=1') });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('API running'));
