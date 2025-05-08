import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
  admin?: any;
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'No token provided',
      details: 'Please include the token in the Authorization header'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expired',
        details: 'Please log in again to obtain a new token'
      });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Invalid token',
        details: 'The token provided is malformed or invalid'
      });
    }
    res.status(401).json({ 
      message: 'Authentication failed',
      details: 'An error occurred while verifying your token'
    });
  }
};

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'No token provided',
      details: 'Please include the token in the Authorization header'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded && (decoded as any).role === 'admin') {
      req.admin = decoded;
      next();
    } else {
      res.status(403).json({ 
        message: 'Admin access required',
        details: 'This endpoint requires admin privileges'
      });
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expired',
        details: 'Please log in again to obtain a new token'
      });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Invalid token',
        details: 'The token provided is malformed or invalid'
      });
    }
    res.status(401).json({ 
      message: 'Authentication failed',
      details: 'An error occurred while verifying your token'
    });
  }
};
