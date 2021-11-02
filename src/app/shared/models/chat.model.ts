export class Chat {
  constructor(
    public username: string,
    // public userIp: string,
    public option: string,
    public domain: string,
    public status: string,
    public operator?: string,
    public id?: string
  ) {}
};