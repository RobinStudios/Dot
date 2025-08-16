import { signupUser, loginUser } from '../lib/auth';
import docClient from '../lib/dynamodb';

jest.mock('../lib/dynamodb', () => ({
  __esModule: true,
  default: {
    send: jest.fn(),
  },
}));

describe('Auth Functions', () => {
  beforeEach(() => {
    (docClient.send as jest.Mock).mockClear();
  });

  it('should sign up a new user', async () => {
    (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: null }); // No existing user
    const result = await signupUser('Test User', 'test@example.com', 'password123');
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('test@example.com');
    expect(docClient.send).toHaveBeenCalledTimes(2); // Get and Put
  });

  it('should not sign up an existing user', async () => {
    (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: { email: 'test@example.com' } }); // Existing user
    await expect(signupUser('Test User', 'test@example.com', 'password123')).rejects.toThrow('User already exists');
    expect(docClient.send).toHaveBeenCalledTimes(1); // Get only
  });

  it('should log in an existing user', async () => {
    const hashedPassword = await require('bcrypt').hash('password123', 10);
    (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: { id: '1', name: 'Test User', email: 'test@example.com', password: hashedPassword, plan: 'free' } });
    const result = await loginUser('test@example.com', 'password123');
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('test@example.com');
    expect(docClient.send).toHaveBeenCalledTimes(1);
  });

  it('should not log in with invalid credentials', async () => {
    (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: null }); // No user
    await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    expect(docClient.send).toHaveBeenCalledTimes(1);
  });

  it('should not log in with incorrect password', async () => {
    const hashedPassword = await require('bcrypt').hash('password123', 10);
    (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: { id: '1', name: 'Test User', email: 'test@example.com', password: hashedPassword, plan: 'free' } });
    await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    expect(docClient.send).toHaveBeenCalledTimes(1);
  });
});
