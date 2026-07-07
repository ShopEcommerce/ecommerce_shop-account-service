import { Request, Response } from 'express';
import { AccountService } from './account.service';
import { CreateAddressInput, UpdateProfileInput, UpdateAddressInput } from './account.schema';
import { AccountMessages } from '../../helpers/messages';

export class AccountController {
  static async getMyProfile(req: Request, res: Response) {
    const userId = req.currentUser!.id;
    const profile = await AccountService.getProfile(userId);
    res.status(200).json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_27, { profile }));
  }

  static async updateMyProfile(req: Request<unknown, unknown, UpdateProfileInput>, res: Response) {
    const userId = req.currentUser!.id;
    const profile = await AccountService.updateProfile(userId, req.body);
    return res
      .status(200)
      .json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_20, { profile }));
  }

  static async createAddress(req: Request<unknown, unknown, CreateAddressInput>, res: Response) {
    const userId = req.currentUser!.id;
    const address = await AccountService.createAddress(userId, req.body);
    res.status(201).json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_21, { address }));
  }

  static async updateAddress(
    req: Request<{ id: string }, unknown, UpdateAddressInput>,
    res: Response,
  ) {
    const userId = req.currentUser!.id;
    const addressId = req.params.id;
    const address = await AccountService.updateAddress(userId, addressId, req.body);
    res.status(200).json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_22, { address }));
  }

  static async deleteAddress(req: Request<{ id: string }>, res: Response) {
    const userId = req.currentUser!.id;
    const addressId = req.params.id;
    await AccountService.deleteAddress(userId, addressId);
    res.status(200).json(AccountMessages.buildSuccessResponse(AccountMessages.MSG_23));
  }
}
