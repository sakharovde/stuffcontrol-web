import Storage from '../storage.ts';
import { faker } from '@faker-js/faker';

const generateStorage = (): Storage => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
});

export default generateStorage;
