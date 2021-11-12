export class MenuOption {
  constructor(
    public description: string,
    public key: string,
    public active: boolean,
    public id?: string
  ) {}
};