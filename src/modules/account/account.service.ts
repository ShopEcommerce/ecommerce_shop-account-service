import { AccountRepository } from './account.repository';
import { NotFoundError, BadRequestError } from '@teleshop/common';
import { CreateAddressInput, UpdateProfileInput, UpdateAddressInput } from './account.schema';

export class AccountService {
  // --- PROFILE LOGIC ---
  static async getProfile(userId: string) {
    const profile = await AccountRepository.findProfileByUserId(userId);
    if (!profile) throw new NotFoundError();
    return profile;
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    await this.getProfile(userId);
    return AccountRepository.updateProfile(userId, data);
  }

  // --- ADDRESS LOGIC ---
  static async createAddress(userId: string, data: CreateAddressInput) {
    const profile = await this.getProfile(userId);

    if (data.isDefault) {
      await AccountRepository.unsetAllDefaultAddresses(profile.id);
    } else if (profile.addresses.length === 0) {
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
      throw new BadRequestError(
        'Cannot unset default address without setting another one as default. Please set another address as default first.',
      );
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
      throw new BadRequestError(
        'Cannot delete default address. Please set another address as default first.',
      );
    }

    await AccountRepository.deleteAddress(addressId);
  }
}
