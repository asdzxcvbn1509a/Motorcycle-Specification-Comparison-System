import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { signToken } from '../utils/jwt.util.js';
import { loginSchema } from '../utils/validators.js';

export async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
