export default class UserUsernameEmptySpecification {
  async isSatisfiedBy(username: string): Promise<boolean> {
    return !username || !username.trim();
  }
}
