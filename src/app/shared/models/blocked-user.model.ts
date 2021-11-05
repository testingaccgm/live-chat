export class BlockedUser {
  constructor(
    public username: string,
    public ip: string,
    public reason: string,
    public operator: string
  ) {}
};