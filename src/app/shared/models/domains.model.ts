export class Domain {
  constructor(
    public domain: string,
    public key: string,
    public description: string,
    public checked?: boolean,
    public id?: string
  ) {}
};