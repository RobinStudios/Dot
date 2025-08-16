import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  const payload = { userId, email };
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
}

import docClient from './dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const TableName = 'ai-graphic-designer-users';

export async function signupUser(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('Missing required fields');
  }

  const { Item } = await docClient.send(new GetCommand({ TableName, Key: { email } }));
  if (Item) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    plan: 'free'
  };

  await docClient.send(new PutCommand({ TableName, Item: user }));

  const token = generateToken(user.id, user.email);

  return { token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } };
}

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Missing required fields');
  }

  const { Item } = await docClient.send(new GetCommand({ TableName, Key: { email } }));
  if (!Item) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, Item.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(Item.id, Item.email);

  return { token, user: { id: Item.id, name: Item.name, email: Item.email, plan: Item.plan } };
}
