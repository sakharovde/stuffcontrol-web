import { createContext } from 'react';
import Application from '../application';

const CoreContext = createContext<Application>(new Application());

export default CoreContext;
