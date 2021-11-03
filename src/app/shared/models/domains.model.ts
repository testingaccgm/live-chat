export class Domain {
  constructor(
    public domain: string,
    public description: string,
    public checked?: boolean,
    public id?: string
  ) {}
};