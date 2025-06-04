const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001; // Changed default port to 3001

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure directories exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('data')) fs.mkdirSync('data');

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    const fruits = ['apple', 'banana', 'orange', 'grape', 'strawberry'];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    
    const mockPrediction = {
      class: randomFruit,
      confidence: 0.7 + Math.random() * 0.25,
      timestamp: new Date().toISOString(),
      imageUrl: `/uploads/${req.file.filename}`
    };
    
    res.json(mockPrediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-inventory', (req, res) => {
  try {
    const { inventory, history } = req.body;
    const data = {
      inventory,
      history,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync('data/inventory.json', JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Inventory saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/load-inventory', (req, res) => {
  try {
    if (fs.existsSync('data/inventory.json')) {
      const data = JSON.parse(fs.readFileSync('data/inventory.json', 'utf8'));
      res.json(data);
    } else {
      res.json({ inventory: {}, history: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Only start the server if this file is run directly (not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🍎 Fruit Tracker server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to access the application`);
    console.log(`🔗 Direct link: http://localhost:${PORT}`);
  });
}

module.exports = app;