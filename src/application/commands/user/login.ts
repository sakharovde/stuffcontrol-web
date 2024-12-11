import { startAuthentication } from '@simplewebauthn/browser';

export default interface LoginUserCommand {
  username: string;
}

export class LoginUserCommandHandler {
  execute = async (command: LoginUserCommand): Promise<void> => {
    const resp = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: command.username }),
    });
    const optionsJSON = await resp.json();

    const credential = await startAuthentication({ optionsJSON });

    const verificationResp = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/authenticate/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: command.username, credential }),
    });
    const verificationJSON = await verificationResp.json();

    if (verificationJSON && verificationJSON.verified) {
      console.log('Success!');
    } else {
      console.log('Failure!', verificationJSON);
    }
  };
}
