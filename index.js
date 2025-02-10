require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const crypto = require('crypto');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Use the express.urlencoded() middleware to parse form data
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlMap = new Map();

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  // Verify the submitted URL
  dns.lookup(new URL(url).hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid URL' });
    }

    const shortUrl = `${crypto.randomBytes(3).toString('hex')}`;
    urlMap.set(shortUrl, url);
    res.json({ 'original_url': url, 'short_url': shortUrl });
  });

  app.get('/api/shorturl/:shorturl', (req, res) => {
    const { shorturl } = req.params;
    const longUrl = urlMap.get(shorturl);

    if (longUrl) {
      res.redirect(longUrl)
    } else {
      res.json({ error: 'Short URL not found' });
    }
  });

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
