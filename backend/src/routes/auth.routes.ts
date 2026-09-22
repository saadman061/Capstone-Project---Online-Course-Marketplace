import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User, Student, Instructor } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Basic validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!['student', 'instructor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or instructor' });
    }

    const userRepo = getRepository(User);

    // Check if user exists
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let user: User;
    if (role === 'student') {
      user = new Student();
    } else if (role === 'instructor') {
      user = new Instructor();
    } else {
      user = new User();
    }

    user.email = email;
    user.passwordHash = passwordHash;
    user.name = name;
    user.role = role;

    await userRepo.save(user);

    console.log('✅ User registered:', { email, name, role });
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.userId,
      email: user.email,
      role: user.role
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('\n=== LOGIN REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const { email, password } = req.body;

    console.log('Extracted - Email:', email, 'Password:', password);

    // Basic validation
    if (!email || !password) {
      console.log('❌ Missing email or password', { email, password });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔐 Login attempt:', { email, passwordLength: password.length });
    
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    console.log('🔍 Verifying password for:', email);
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Logout is client-side (token removal from localStorage)
    // But we can optionally blacklist token on backend if needed
    console.log('✅ User logged out');
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    // Always return success (don't reveal if email exists)
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.userId, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // In production, send email with reset link:
    // const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Password Reset', `Click here: ${resetLink}`);

    console.log('✅ Password reset link generated for:', email);
    res.json({
      message: 'If email exists, reset link will be sent',
      // ONLY FOR TESTING - remove in production
      testResetToken: resetToken
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset Password endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Update password
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await userRepo.save(user);

    console.log('✅ Password reset successful for:', user.email);
    res.json({ message: 'Password has been reset successfully. Please login with your new password.' });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change Password endpoint (for logged-in users)
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const decoded: any = jwt.verify(token, jwtSecret);

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await userRepo.save(user);

    console.log('✅ Password changed successfully for:', user.email);
    res.json({ message: 'Password has been changed successfully' });
  } catch (error: any) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;