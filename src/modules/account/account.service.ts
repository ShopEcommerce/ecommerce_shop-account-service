import { AccountRepository } from './account.repository';
import { NotFoundError, BadRequestError } from '@teleshop/common';
import { CreateAddressInput, UpdateProfileInput, UpdateAddressInput } from './account.schema';
import { AccountMessages } from '../../helpers/messages';

const MAX_ADDRESSES_PER_USER = 5;

export class AccountService {
  // --- PROFILE LOGIC ---
  static async getProfile(userId: string) {
    const profile = await AccountRepository.findProfileByUserId(userId);
    if (!profile) throw new NotFoundError(AccountMessages.MSG_26.message);
    return profile;
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    await this.getProfile(userId);
    return AccountRepository.updateProfile(userId, data);
  }

  // --- ADDRESS LOGIC ---
  static async createAddress(userId: string, data: CreateAddressInput) {
    const profile = await this.getProfile(userId);

    // Enforce maximum addresses limit
    if (profile.addresses.length >= MAX_ADDRESSES_PER_USER) {
      throw new BadRequestError(
        `Cannot add more addresses. Maximum allowed is ${MAX_ADDRESSES_PER_USER} addresses per user.`,
      );
    }

    if (data.isDefault) {
      await AccountRepository.unsetAllDefaultAddresses(profile.id);
    } else if (profile.addresses.length === 0) {
      // First address must be default
      data.isDefault = true;
    }

    return AccountRepository.createAddress({
      ...data,
      profileId: profile.id,
    });
  }

  static async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    const profile = await this.getProfile(userId);
    const address = await AccountRepository.findAddressById(addressId);

    // Ensure the address belongs to the user's profile
    if (!address || address.profileId !== profile.id) {
      throw new NotFoundError();
    }

    if (data.isDefault && !address.isDefault) {
      await AccountRepository.unsetAllDefaultAddresses(profile.id);
    } else if (data.isDefault === false && address.isDefault) {
      throw new BadRequestError(AccountMessages.MSG_24.message);
    }

    return AccountRepository.updateAddress(addressId, data);
  }

  static async deleteAddress(userId: string, addressId: string) {
    const profile = await this.getProfile(userId);
    const address = await AccountRepository.findAddressById(addressId);

    if (!address || address.profileId !== profile.id) {
      throw new NotFoundError();
    }

    if (address.isDefault) {
      throw new BadRequestError(AccountMessages.MSG_25.message);
    }
    await AccountRepository.deleteAddress(addressId);
  }
}
