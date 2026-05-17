import { Message } from 'amqplib';
import { BaseListener, Subjects, UserVerifiedEvent, QueueGroupNames } from '@teleshop/common';
import { AccountRepository } from '../../modules/account/account.repository';
import pino from 'pino';

const logger = pino({ name: 'Account-UserVerifiedListener' });

export class UserVerifiedListener extends BaseListener<UserVerifiedEvent> {
  subject: Subjects.UserVerified = Subjects.UserVerified;

  queueGroupName = QueueGroupNames.AccountService;

  async onMessage(data: UserVerifiedEvent['data'], _msg: Message) {
    const eventId = data.id;
    const correlationId = data.correlationId || 'N/A';

    logger.info(
      { correlationId, eventId, userId: data.userId, email: data.email },
      'Account Service received UserVerified event',
    );

    try {
      await AccountRepository.createProfileFromEvent({
        eventId: data.id,
        subject: this.subject,
        userId: data.userId,
        email: data.email,
      });

      logger.info(
        { correlationId, eventId, userId: data.userId },
        'Successfully created User Profile and marked event as processed.',
      );
    } catch (error: any) {
      logger.error(
        { correlationId, eventId, reason: error.message },
        'Failed to process UserVerified event',
      );
      throw error;
    }
  }
}
