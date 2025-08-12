import { authService, User as AuthUser } from './auth';

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription?: string
  createdAt?: Date
}

export class SessionManager {
  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const user = await authService.createUser(email, password, name);
  const token = await authService.createSession(user);
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
  avatar: user.avatar,
        subscription: 'free'
      }, 
      token 
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await authService.verifyUser(email, password);
    if (!user) throw new Error('Invalid credentials');
    
  const token = await authService.createSession(user);
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
  avatar: user.avatar,
        subscription: 'free'
      }, 
      token 
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    const user = await authService.verifySession(token);
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
  avatar: user.avatar,
      subscription: 'free'
    };
  }

  async logout(token: string): Promise<void> {
  // await authService.deleteSession(token); // Not implemented in AuthService
  }
}

export const sessionManager = new SessionManager()