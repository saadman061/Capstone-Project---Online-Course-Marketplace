import { getRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, Student, Instructor } from '../entities/User';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private readonly jwtExpiry = '7d';

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'instructor';
  }) {
    const userRepository = getRepository(User);

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user based on role
    let user: any;
    if (data.role === 'student') {
      user = new Student();
    } else if (data.role === 'instructor') {
      user = new Instructor();
    } else {
      throw new Error('Invalid role');
    }

    user.name = data.name;
    user.email = data.email;
    user.passwordHash = passwordHash;
    user.role = data.role;
    user.status = 'active';

    await userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const userRepository = getRepository(User);

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiry }
    );
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();