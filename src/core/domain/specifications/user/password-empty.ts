export default class UserPasswordEmptySpecification {
  async isSatisfiedBy(password: string): Promise<boolean> {
    return !password || !password.trim();
  }
}
