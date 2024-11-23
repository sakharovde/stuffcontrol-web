export default class User {
  constructor(
    public readonly id: string,
    public username: string,
    public passwordHash: string
  ) {}
}
