import User from '../user.ts';
import { faker } from '@faker-js/faker';

const generateUser = (): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  passwordHash: faker.internet.password(),
});

export default generateUser;
