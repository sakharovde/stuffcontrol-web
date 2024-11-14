export default class PasswordEmptySpecification {
  async isSatisfiedBy(password: string): Promise<boolean> {
    return !password || !password.trim();
  }
}
