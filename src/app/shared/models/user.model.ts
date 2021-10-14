export class User {
  constructor(
    public name: string,
    public email: string,
    public uid?: string,
    public password?: string,
    public loginHistory?: LoginHistory []
  ) {}
}

export class LoginHistory {
  constructor(
    public ip: string,
    public id: string,
    public country: string,
    public city: string,
    public uid: string,
    public date: firebase.default.firestore.Timestamp,
  ) {}
}
