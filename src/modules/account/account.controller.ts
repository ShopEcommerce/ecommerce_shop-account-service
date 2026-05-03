import { Request, Response } from "express";
import { AccountService } from "./account.service";
import {
  CreateAddressInput,
  UpdateProfileInput,
  UpdateAddressInput,
} from "./account.schema";

export class AccountController {
  static async getMyProfile(req: Request, res: Response) {
    const userId = req.currentUser!.id;
    const profile = await AccountService.getProfile(userId);
    res.status(200).send({ profile });
  }

  static async updateMyProfile(
    req: Request<{}, {}, UpdateProfileInput>,
    res: Response,
  ) {
    const userId = req.currentUser!.id;
    const profile = await AccountService.updateProfile(userId, req.body);
    res.status(200).send({ message: "Updated profile successfully", profile });
  }

  static async createAddress(
    req: Request<{}, {}, CreateAddressInput>,
    res: Response,
  ) {
    const userId = req.currentUser!.id;
    const address = await AccountService.createAddress(userId, req.body);
    res.status(201).send({ message: "Address added successfully", address });
  }

  static async updateAddress(
    req: Request<{ id: string }, {}, UpdateAddressInput>,
    res: Response,
  ) {
    const userId = req.currentUser!.id;
    const addressId = req.params.id;
    const address = await AccountService.updateAddress(
      userId,
      addressId,
      req.body,
    );
    res.status(200).send({ message: "Address updated successfully", address });
  }

  static async deleteAddress(req: Request<{ id: string }>, res: Response) {
    const userId = req.currentUser!.id;
    const addressId = req.params.id;
    await AccountService.deleteAddress(userId, addressId);
    res.status(200).send({ message: "Address deleted successfully" });
  }
}
