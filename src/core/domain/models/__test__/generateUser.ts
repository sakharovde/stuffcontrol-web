import User from '../user.ts';
import { faker } from '@faker-js/faker';

export default (): User => ({
  id: faker.string.uuid(),
  username: faker.internet.username(),
  passwordHash: faker.internet.password(),
});
