import { User, UserRepository, UserUniqueUsernameSpecification, UserUsernameEmptySpecification } from '../../../domain';
import { v4 as uuidv4 } from 'uuid';
import { startRegistration } from '@simplewebauthn/browser';
import type { RegistrationResponseJSON } from '@simplewebauthn/browser';

export interface RegisterUserCommand {
  username: string;
}

export default class RegisterUserCommandHandler {
  constructor(
    private userRepository: UserRepository,
    private uniqueUsernameSpec: UserUniqueUsernameSpecification,
    private usernameEmptySpec: UserUsernameEmptySpecification
  ) {}

  execute = async (command: RegisterUserCommand): Promise<void> => {
    const isUsernameEmpty = await this.usernameEmptySpec.isSatisfiedBy(command.username);
    if (isUsernameEmpty) {
      throw new Error('Username cannot be empty');
    }

    const isUnique = await this.uniqueUsernameSpec.isSatisfiedBy(command.username);
    if (!isUnique) {
      throw new Error('Username is already taken');
    }

    const resp = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: command.username }),
    });
    const optionsJSON = await resp.json();

    let attResp: RegistrationResponseJSON | undefined;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration({ optionsJSON });
    } catch (error) {
      console.log(error);

      throw error;
    }

    const verificationResp = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/register/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: command.username, credential: attResp }),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      console.log('Success!');
    } else {
      console.log('Oh no, something went wrong! Response:', verificationJSON);
    }

    const user = new User(uuidv4(), command.username, attResp.id);

    await this.userRepository.save(user);
  };
}
