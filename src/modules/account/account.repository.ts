import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";

export class AccountRepository {
  // --- PROFILE ---
  static async findProfileByUserId(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
      include: { addresses: true },
    });
  }

  static async updateProfile(
    userId: string,
    data: Prisma.UserProfileUpdateInput,
  ) {
    return prisma.userProfile.update({
      where: { userId },
      data,
    });
  }

  // --- ADDRESS ---
  static async createAddress(data: Prisma.AddressUncheckedCreateInput) {
    return prisma.address.create({ data });
  }

  static async updateAddress(
    addressId: string,
    data: Prisma.AddressUpdateInput,
  ) {
    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  static async deleteAddress(addressId: string) {
    return prisma.address.delete({
      where: { id: addressId },
    });
  }

  static async findAddressById(addressId: string) {
    return prisma.address.findUnique({ where: { id: addressId } });
  }

  static async unsetAllDefaultAddresses(profileId: string) {
    return prisma.address.updateMany({
      where: { profileId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
