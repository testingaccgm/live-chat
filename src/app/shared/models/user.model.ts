export class User {
  constructor(
    public name: string,
    public email: string,
    public active: boolean,
    public roles?: Roles[],
    public uid?: string,
    public password?: string,
    public loginHistory?: LoginHistory []
  ) {}
};

export class LoginHistory {
  constructor(
    public ip: string,
    public id: string,
    public country: string,
    public city: string,
    public uid: string,
    public date: firebase.default.firestore.Timestamp,
  ) {}
};

export class Roles {
  constructor(
    public name: string,
    public value: string,
    public route: string,
    public checked: boolean
  ) {}
};