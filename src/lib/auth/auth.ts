import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// In-memory user storage for Lambda - users persist during Lambda execution
const users: Map<string, { id: string; email: string; name: string; passwordHash: string }> = new Map();

// Initialize with demo user for testing
if (users.size === 0) {
  const demoPasswordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
  users.set('demo-user', {
    id: 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    passwordHash: demoPasswordHash
  });
}

export class AuthService {
  async createUser(email: string, password: string, name: string): Promise<User> {
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `user-${Date.now()}`,
      email,
      name,
      passwordHash
    };

    users.set(user.id, user);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }

  async createSession(user: User): Promise<string> {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async verifySession(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = users.get(decoded.userId);
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name
      };
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();