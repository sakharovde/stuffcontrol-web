export default class UsernameEmptySpecification {
  async isSatisfiedBy(username: string): Promise<boolean> {
    return !username || !username.trim();
  }
}
