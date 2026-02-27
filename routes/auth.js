const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simpan OTP sementara (gunakan Redis di production)
const otpStore = new Map();

// Request OTP
router.post('/otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    // Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simpan OTP (expire 5 menit)
    otpStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // TODO: Kirim OTP via SMS (Twilio gratis trial)
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent',
      // Hanya untuk development, hapus di production
      debugOtp: otp 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { phone, otp, deviceId } = req.body;
    
    const stored = otpStore.get(phone);
    
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Hapus OTP setelah verifikasi
    otpStore.delete(phone);
    
    // Cari atau buat user
    let user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: `User ${phone.slice(-4)}`
        }
      });
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );
    
    // Simpan session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceId: deviceId || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
