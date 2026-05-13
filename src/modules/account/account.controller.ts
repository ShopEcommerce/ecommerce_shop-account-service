import { Request, Response } from 'express';
import { AccountService } from './account.service';
import { CreateAddressInput, UpdateProfileInput, UpdateAddressInput } from './account.schema';
import { AccountMessages } from '../../helpers/messages';
import { NotFoundError, BadRequestError } from '@teleshop/common';

export class AccountController {
  static async getMyProfile(req: Request, res: Response) {
    try {
      const userId = req.currentUser!.id;
      const profile = await AccountService.getProfile(userId);
      res
        .status(200)
        .json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_20, { profile }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_26));
      }
      throw error;
    }
  }

  static async updateMyProfile(req: Request<unknown, unknown, UpdateProfileInput>, res: Response) {
    try {
      const userId = req.currentUser!.id;
      const profile = await AccountService.updateProfile(userId, req.body);
      return res
        .status(200)
        .json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_20, { profile }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_26));
      }
      return res.status(400).json({
        success: false,
        code: (error as any)?.errors?.[0] ? undefined : undefined,
        message: (error as any)?.message,
      });
    }
  }

  static async createAddress(req: Request<unknown, unknown, CreateAddressInput>, res: Response) {
    try {
      const userId = req.currentUser!.id;
      const address = await AccountService.createAddress(userId, req.body);
      res
        .status(201)
        .json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_21, { address }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_26));
      }
      if (error instanceof BadRequestError) {
        return res.status(400).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_21));
      }
      throw error;
    }
  }

  static async updateAddress(
    req: Request<{ id: string }, unknown, UpdateAddressInput>,
    res: Response,
  ) {
    try {
      const userId = req.currentUser!.id;
      const addressId = req.params.id;
      const address = await AccountService.updateAddress(userId, addressId, req.body);
      res
        .status(200)
        .json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_22, { address }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_26));
      }
      if (error instanceof BadRequestError) {
        const message = (error as any).message;
        if (message.includes('default address without setting')) {
          return res.status(400).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_24));
        }
        return res.status(400).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_21));
      }
      throw error;
    }
  }

  static async deleteAddress(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.currentUser!.id;
      const addressId = req.params.id;
      await AccountService.deleteAddress(userId, addressId);
      res.status(200).json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_23));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_26));
      }
      if (error instanceof BadRequestError) {
        return res.status(400).json(AccountMessages.buildErrorResponse(AccountMessages.MSG_25));
      }
      throw error;
    }
  }
}
