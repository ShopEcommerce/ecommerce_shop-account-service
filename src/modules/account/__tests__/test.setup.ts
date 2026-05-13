import { RequestHandler } from 'express';

// Mock middleware for testing
export const setupTestMiddleware = () => {
  // Mock the @teleshop/common middleware to extract user from x-current-user header
  jest.mock('@teleshop/common', () => ({
    ...jest.requireActual('@teleshop/common'),
    requireAuth: ((req: any, res: any, next: any) => {
      const userJson = req.get('x-current-user');
      if (!userJson) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      req.currentUser = JSON.parse(userJson);
      next();
    }) as RequestHandler,
    currentUser: ((req: any, res: any, next: any) => {
      const userJson = req.get('x-current-user');
      if (userJson) {
        try {
          req.currentUser = JSON.parse(userJson);
        } catch {
          req.currentUser = undefined;
        }
      }
      next();
    }) as RequestHandler,
  }));
};

export const extractUserFromRequest = (req: any) => {
  const userJson = req.get('x-current-user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return undefined;
    }
  }
  return undefined;
};
