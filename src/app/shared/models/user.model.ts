export class User {
  constructor(
    public name: string,
    public email: string,
    public roles?: Roles,
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
    public users: boolean,
    public register: boolean,
    public blockedClients: boolean,
    public accountSettings: boolean,
    public allowedDomains: boolean,
  ) {}
};