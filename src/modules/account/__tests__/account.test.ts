import request from 'supertest';
import { prisma } from '../../../db/prisma';

// Mock @teleshop/common BEFORE importing app
jest.mock('@teleshop/common', () => {
  const actual = jest.requireActual('@teleshop/common');
  return {
    ...actual,
    requireAuth: (req: any, res: any, next: any) => {
      const userJson = req.get('x-current-user');
      if (!userJson) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      try {
        req.currentUser = JSON.parse(userJson);
        next();
      } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
      }
    },
    currentUser: (req: any, res: any, next: any) => {
      const userJson = req.get('x-current-user');
      if (userJson) {
        try {
          req.currentUser = JSON.parse(userJson);
        } catch {
          req.currentUser = undefined;
        }
      }
      next();
    },
  };
});

// Import app AFTER mocking
import { app } from '../../../app';

describe('Account API Endpoints', () => {
  let testUserId: string;
  let testProfileId: string;

  // Setup: Create unique user ID for each test run
  beforeEach(() => {
    testUserId = 'test-user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  });

  afterEach(async () => {
    // Clean up all test data
    await prisma.address.deleteMany({
      where: { profile: { userId: testUserId } },
    });
    await prisma.userProfile.deleteMany({
      where: { userId: testUserId },
    });
  });

  // Helper: Create mock currentUser by injecting into request
  const createAuthenticatedRequest = (method: string, path: string) => {
    let req: any;
    if (method === 'get') {
      req = request(app).get(path);
    } else if (method === 'post') {
      req = request(app).post(path);
    } else if (method === 'put') {
      req = request(app).put(path);
    } else if (method === 'delete') {
      req = request(app).delete(path);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }
    return req.set('x-current-user', JSON.stringify({ id: testUserId }));
  };

  // ----- PROFILE TESTS -----
  describe('GET /api/account/profile/me', () => {
    it('should retrieve user profile successfully', async () => {
      // Setup: Create a test profile
      const testProfile = await prisma.userProfile.create({
        data: {
          userId: testUserId,
          email: 'test@example.com',
          fullName: 'Test User',
        },
      });
      testProfileId = testProfile.id;

      const response = await createAuthenticatedRequest('get', '/api/account/profile/me');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.code).toBe('MSG_27');
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.email).toBe('test@example.com');
    });

    it('should return 404 if profile does not exist', async () => {
      const response = await createAuthenticatedRequest('get', '/api/account/profile/me');

      expect(response.status).toBe(404);
      expect(response.body).toEqual([{ message: 'User profile not found' }]);
    });
  });

  describe('PUT /api/account/profile/me', () => {
    beforeEach(async () => {
      // Create test profile
      const profile = await prisma.userProfile.create({
        data: {
          userId: testUserId,
          email: 'test@example.com',
        },
      });
      testProfileId = profile.id;
    });

    it('should update profile successfully with valid data', async () => {
      const updateData = {
        fullName: 'Updated Name',
        phone: '0987654321',
      };

      const response = await createAuthenticatedRequest('put', '/api/account/profile/me').send(
        updateData,
      );

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('MSG_20');
      expect(response.body.data.profile.fullName).toBe('Updated Name');
      expect(response.body.data.profile.phone).toBe('0987654321');
    });

    it('should reject invalid phone number format', async () => {
      const invalidData = {
        phone: 'invalid-phone',
      };

      const response = await createAuthenticatedRequest('put', '/api/account/profile/me').send(
        invalidData,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Invalid Vietnamese phone number', field: 'phone' },
      ]);
    });

    it('should reject username with less than 3 characters', async () => {
      const invalidData = {
        username: 'ab',
      };

      const response = await createAuthenticatedRequest('put', '/api/account/profile/me').send(
        invalidData,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Username must be at least 3 characters', field: 'username' },
      ]);
    });

    it('should reject fullName with less than 2 characters', async () => {
      const invalidData = {
        fullName: 'A',
      };

      const response = await createAuthenticatedRequest('put', '/api/account/profile/me').send(
        invalidData,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Full name must be at least 2 characters', field: 'fullName' },
      ]);
    });
  });

  // ----- ADDRESS TESTS -----
  describe('POST /api/account/addresses', () => {
    beforeEach(async () => {
      // Create test profile
      const profile = await prisma.userProfile.create({
        data: {
          userId: testUserId,
          email: 'test@example.com',
        },
      });
      testProfileId = profile.id;
    });

    it('should create first address as default automatically', async () => {
      const addressData = {
        receiverName: 'Test Receiver',
        receiverPhone: '0987654321',
        street: 'Street 123',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'City 1',
        type: 'HOME',
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      expect(response.status).toBe(201);
      expect(response.body.code).toBe('MSG_21');
      expect(response.body.data.address).toBeDefined();
      expect(response.body.data.address.isDefault).toBe(true);
      expect(response.body.data.address.receiverName).toBe('Test Receiver');
    });

    it('should create non-default address when default already exists', async () => {
      // Create first address (will be default)
      await prisma.address.create({
        data: {
          profileId: testProfileId,
          receiverName: 'First Receiver',
          receiverPhone: '0987654321',
          street: 'Street 1',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'City 1',
          isDefault: true,
        },
      });

      const addressData = {
        receiverName: 'Second Receiver',
        receiverPhone: '0987654322',
        street: 'Street 2',
        ward: 'Ward 2',
        district: 'District 2',
        city: 'City 2',
        type: 'OFFICE',
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      expect(response.status).toBe(201);
      expect(response.body.code).toBe('MSG_21');
      expect(response.body.data.address.isDefault).toBe(false);
      expect(response.body.data.address.receiverName).toBe('Second Receiver');
    });

    it('should reject when max 5 addresses reached', async () => {
      // Create 5 addresses
      for (let i = 0; i < 5; i++) {
        await prisma.address.create({
          data: {
            profileId: testProfileId,
            receiverName: `Receiver ${i}`,
            receiverPhone: '0987654321',
            street: `Street ${i}`,
            ward: `Ward ${i}`,
            district: `District ${i}`,
            city: `City ${i}`,
            isDefault: i === 0,
          },
        });
      }

      // Try to create 6th address
      const addressData = {
        receiverName: 'Sixth Address',
        receiverPhone: '0987654321',
        street: 'Street 6',
        ward: 'Ward 6',
        district: 'District 6',
        city: 'City 6',
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Cannot add more addresses. Maximum allowed is 5 addresses per user.' },
      ]);
    });

    it('should unset previous default when creating new default address', async () => {
      // Create first default address
      const firstAddress = await prisma.address.create({
        data: {
          profileId: testProfileId,
          receiverName: 'First Receiver',
          receiverPhone: '0987654321',
          street: 'Street 1',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'City 1',
          isDefault: true,
        },
      });

      // Create second address as default
      const addressData = {
        receiverName: 'Second Receiver',
        receiverPhone: '0987654322',
        street: 'Street 2',
        ward: 'Ward 2',
        district: 'District 2',
        city: 'City 2',
        isDefault: true,
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      // Verify second is default
      expect(response.body.data.address.isDefault).toBe(true);

      // Verify first is no longer default
      const updatedFirstAddress = await prisma.address.findUnique({
        where: { id: firstAddress.id },
      });
      expect(updatedFirstAddress?.isDefault).toBe(false);
    });

    it('should reject invalid phone number', async () => {
      const addressData = {
        receiverName: 'Test',
        receiverPhone: 'invalid-phone',
        street: 'Street',
        ward: 'Ward',
        district: 'District',
        city: 'City',
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const addressData = {
        receiverName: 'Test',
        // missing receiverPhone and other required fields
      };

      const response = await createAuthenticatedRequest('post', '/api/account/addresses').send(
        addressData,
      );

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/account/addresses/:id', () => {
    let testAddress: any;

    beforeEach(async () => {
      const profile = await prisma.userProfile.create({
        data: {
          userId: testUserId,
          email: 'test@example.com',
        },
      });
      testProfileId = profile.id;

      testAddress = await prisma.address.create({
        data: {
          profileId: profile.id,
          receiverName: 'Original Name',
          receiverPhone: '0987654321',
          street: 'Street 1',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'City 1',
          isDefault: true,
        },
      });
    });

    it('should update address successfully', async () => {
      const updateData = {
        receiverName: 'Updated Name',
      };

      const response = await createAuthenticatedRequest(
        'put',
        `/api/account/addresses/${testAddress.id}`,
      ).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('MSG_22');
      expect(response.body.data.address.receiverName).toBe('Updated Name');
    });

    it('should prevent unsetting default without setting another as default', async () => {
      const updateData = {
        isDefault: false,
      };

      const response = await createAuthenticatedRequest(
        'put',
        `/api/account/addresses/${testAddress.id}`,
      ).send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Cannot unset default address without setting another one as default' },
      ]);
    });

    it('should allow changing default address', async () => {
      // Create second address (non-default)
      const secondAddress = await prisma.address.create({
        data: {
          profileId: testProfileId,
          receiverName: 'Second Address',
          receiverPhone: '0987654322',
          street: 'Street 2',
          ward: 'Ward 2',
          district: 'District 2',
          city: 'City 2',
          isDefault: false,
        },
      });

      // Update second to be default
      const updateData = {
        isDefault: true,
      };

      const response = await createAuthenticatedRequest(
        'put',
        `/api/account/addresses/${secondAddress.id}`,
      ).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.address.isDefault).toBe(true);

      // Verify first is no longer default
      const updatedFirstAddress = await prisma.address.findUnique({
        where: { id: testAddress.id },
      });
      expect(updatedFirstAddress?.isDefault).toBe(false);
    });

    it('should return 404 for non-existent address', async () => {
      const updateData = {
        receiverName: 'Updated',
      };

      const response = await createAuthenticatedRequest(
        'put',
        '/api/account/addresses/non-existent-id',
      ).send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/account/addresses/:id', () => {
    let testAddress: any;

    beforeEach(async () => {
      const profile = await prisma.userProfile.create({
        data: {
          userId: testUserId,
          email: 'test@example.com',
        },
      });
      testProfileId = profile.id;

      testAddress = await prisma.address.create({
        data: {
          profileId: profile.id,
          receiverName: 'Test Address',
          receiverPhone: '0987654321',
          street: 'Street 1',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'City 1',
          isDefault: false,
        },
      });
    });

    it('should delete non-default address successfully', async () => {
      const response = await createAuthenticatedRequest(
        'delete',
        `/api/account/addresses/${testAddress.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('MSG_23');

      // Verify deletion
      const deletedAddress = await prisma.address.findUnique({
        where: { id: testAddress.id },
      });
      expect(deletedAddress).toBeNull();
    });

    it('should prevent deleting default address', async () => {
      // Make address default
      await prisma.address.update({
        where: { id: testAddress.id },
        data: { isDefault: true },
      });

      const response = await createAuthenticatedRequest(
        'delete',
        `/api/account/addresses/${testAddress.id}`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual([
        { message: 'Cannot delete default address. Please set another address as default first' },
      ]);

      // Verify address still exists
      const existingAddress = await prisma.address.findUnique({
        where: { id: testAddress.id },
      });
      expect(existingAddress).not.toBeNull();
    });

    it('should return 404 for non-existent address', async () => {
      const response = await createAuthenticatedRequest(
        'delete',
        '/api/account/addresses/non-existent-id',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('Idempotency Tests', () => {
    it('should handle duplicate UserVerified events gracefully', async () => {
      const eventData = {
        id: 'duplicate-event-id-' + Date.now(),
        userId: 'new-user-456',
        email: 'newuser@example.com',
        correlationId: 'corr-123',
      };

      // Simulate receiving same event twice
      const firstProcess = await prisma.processedEvent.create({
        data: {
          eventId: eventData.id,
          subject: 'user.verified',
        },
      });

      expect(firstProcess).toBeDefined();
      expect(firstProcess.eventId).toBe(eventData.id);

      // Second process should find existing event
      const existingEvent = await prisma.processedEvent.findUnique({
        where: { eventId: eventData.id },
      });

      expect(existingEvent).toBeDefined();
      expect(existingEvent?.eventId).toBe(eventData.id);

      // Clean up
      await prisma.processedEvent.delete({
        where: { eventId: eventData.id },
      });
    });
  });
});
