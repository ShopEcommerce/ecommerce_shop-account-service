export enum MessageCode {
  MSG_16 = 'MSG_16',
  MSG_17 = 'MSG_17',
  MSG_18 = 'MSG_18',
  MSG_19 = 'MSG_19',
  MSG_20 = 'MSG_20',
  MSG_21 = 'MSG_21',
  MSG_22 = 'MSG_22',
  MSG_23 = 'MSG_23',
  MSG_24 = 'MSG_24',
  MSG_25 = 'MSG_25',
  MSG_26 = 'MSG_26',
  MSG_27 = 'MSG_27',
}

export interface MessageDefinition {
  code: MessageCode;
  message: string;
  httpStatus: number;
  category: 'validation' | 'success' | 'not-found' | 'conflict' | 'server-error';
}

export class AccountMessages {
  // Profile Messages
  static readonly MSG_16: MessageDefinition = {
    code: MessageCode.MSG_16,
    message: 'All profile fields are required',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_17: MessageDefinition = {
    code: MessageCode.MSG_17,
    message: 'Username must be at least 3 characters',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_18: MessageDefinition = {
    code: MessageCode.MSG_18,
    message: 'Full name must be at least 2 characters',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_19: MessageDefinition = {
    code: MessageCode.MSG_19,
    message: 'Invalid Vietnamese phone number format',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_20: MessageDefinition = {
    code: MessageCode.MSG_20,
    message: 'Profile updated successfully',
    httpStatus: 200,
    category: 'success',
  };

  // Address Messages
  static readonly MSG_21: MessageDefinition = {
    code: MessageCode.MSG_21,
    message: 'Address added successfully',
    httpStatus: 201,
    category: 'success',
  };

  static readonly MSG_22: MessageDefinition = {
    code: MessageCode.MSG_22,
    message: 'Address updated successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_23: MessageDefinition = {
    code: MessageCode.MSG_23,
    message: 'Address deleted successfully',
    httpStatus: 200,
    category: 'success',
  };

  static readonly MSG_24: MessageDefinition = {
    code: MessageCode.MSG_24,
    message: 'Cannot unset default address without setting another one as default',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_25: MessageDefinition = {
    code: MessageCode.MSG_25,
    message: 'Cannot delete default address. Please set another address as default first',
    httpStatus: 400,
    category: 'validation',
  };

  static readonly MSG_26: MessageDefinition = {
    code: MessageCode.MSG_26,
    message: 'User profile not found',
    httpStatus: 404,
    category: 'not-found',
  };

  static readonly MSG_27: MessageDefinition = {
    code: MessageCode.MSG_27,
    message: 'Profile retrieved successfully',
    httpStatus: 200,
    category: 'success',
  };

  // Helper Methods
  static buildResponse(success: boolean, message: MessageDefinition, data?: any) {
    return {
      success,
      message: message.message,
      code: message.code,
      data: data || null,
      timestamp: new Date().toISOString(),
    };
  }

  static buildSuccessResponse(message: MessageDefinition, data?: any) {
    return this.buildResponse(true, message, data);
  }
}
