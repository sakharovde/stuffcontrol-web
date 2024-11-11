import User from '../user.ts';
import { faker } from '@faker-js/faker';

const generateUser = (): User => ({
  id: faker.string.uuid(),
  username: faker.internet.username(),
  passwordHash: faker.internet.password(),
});

export default generateUser;
