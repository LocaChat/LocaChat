const express = require('express');
const router = express.Router();

// Get TURN server credentials
router.get('/turn-credentials', (req, res) => {
  // Menggunakan TURN server gratis dari Metered atau Twilio
  res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  });
});

module.exports = router;
