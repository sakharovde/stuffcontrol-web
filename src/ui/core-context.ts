import { createContext } from 'react';
import Core from '../core';

const CoreContext = createContext<Core>(new Core());

export default CoreContext;
