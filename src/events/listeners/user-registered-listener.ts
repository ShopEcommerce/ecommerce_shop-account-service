import { Message } from 'amqplib';
import { 
  BaseListener, 
  Subjects, 
  UserRegisteredEvent, 
  QueueGroupNames 
} from '@teleshop/common';
import { AccountRepository } from '../../modules/account/account.repository';

export class UserRegisteredListener extends BaseListener<UserRegisteredEvent> {
  subject: Subjects.UserRegistered = Subjects.UserRegistered;
  
  queueGroupName = QueueGroupNames.AccountService;

  async onMessage(data: UserRegisteredEvent['data'], msg: Message) {
    console.log(`Processing event: ${data.id}`);

    await AccountRepository.createProfileFromEvent({
      eventId: data.id,
      subject: this.subject,
      userId: data.userId,
      email: data.email,
    });
  }
}