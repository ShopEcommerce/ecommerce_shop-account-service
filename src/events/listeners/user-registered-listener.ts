import { Message } from 'amqplib';
import { BaseListener, Subjects, UserRegisteredEvent, QueueGroupNames } from '@teleshop/common';
import { AccountRepository } from '../../modules/account/account.repository';
import pino from 'pino';

const logger = pino({ name: 'Account-UserRegisteredListener' });

export class UserRegisteredListener extends BaseListener<UserRegisteredEvent> {
  subject: Subjects.UserRegistered = Subjects.UserRegistered;

  queueGroupName = QueueGroupNames.AccountService;

  async onMessage(data: UserRegisteredEvent['data'], _msg: Message) {
    const eventId = data.id;
    const correlationId = data.correlationId || 'N/A';

    logger.info(
      { correlationId, eventId, userId: data.id, email: data.email },
      'Account Service received UserRegistered event',
    );

    try {
      await AccountRepository.createProfileFromEvent({
        eventId: data.id,
        subject: this.subject,
        userId: data.userId,
        email: data.email,
      });

      logger.info(
        { correlationId, eventId, userId: data.id },
        'Successfully created User Profile and marked event as processed.',
      );
    } catch (error: any) {
      logger.error(
        { correlationId, eventId, reason: error.message },
        'Failed to process UserRegistered event',
      );
      throw error;
    }
  }
}
