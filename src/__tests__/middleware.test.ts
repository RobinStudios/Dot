import { middleware } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth';

jest.mock('../lib/auth', () => ({
  verifyToken: jest.fn(),
}));

describe('Middleware', () => {
  it('should allow requests with a valid token', () => {
    (verifyToken as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
    const request = {
      headers: {
        get: (header) => {
          if (header === 'authorization') {
            return 'Bearer valid-token';
          }
          return null;
        },
      },
    } as unknown as NextRequest;
    const response = middleware(request);
    expect(response).toBeInstanceOf(NextResponse);
  });

  it('should reject requests with an invalid token', () => {
    (verifyToken as jest.Mock).mockReturnValue(null);
    const request = {
      headers: {
        get: (header) => {
          if (header === 'authorization') {
            return 'Bearer invalid-token';
          }
          return null;
        },
      },
    } as unknown as NextRequest;
    const response = middleware(request);
    expect(response.status).toBe(401);
  });

  it('should reject requests with a missing token', () => {
    const request = {
      headers: {
        get: (header) => null,
      },
    } as unknown as NextRequest;
    const response = middleware(request);
    expect(response.status).toBe(401);
  });
});
