import { Message } from 'amqplib';
import { 
  BaseListener, 
  Subjects, 
  UserRegisteredEvent, 
  QueueGroupNames 
} from '@teleshop/common';
import { prisma } from '../../db/prisma';

export class UserRegisteredListener extends BaseListener<UserRegisteredEvent> {
  subject: Subjects.UserRegistered = Subjects.UserRegistered;
  
  queueGroupName = QueueGroupNames.AccountService;

  async onMessage(data: UserRegisteredEvent['data'], msg: Message) {
    console.log('Event received:', data);

    try {
      await prisma.userProfile.create({
        data: {
          userId: data.userId,
          email: data.email,
          username: data.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
        },
      });

      this.channel.ack(msg);
      console.log(`[x] Profile created for user: ${data.email}`);
    } catch (err) {
      console.error('Error processing UserRegisteredEvent:', err);    }
  }
}