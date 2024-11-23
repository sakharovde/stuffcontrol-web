import Product from '../product.ts';
import { faker } from '@faker-js/faker';

export default (): Product => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
});
