import Storage from '../storage.ts';
import { faker } from '@faker-js/faker';

export default (): Storage => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
});
