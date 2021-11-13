export class Chat {
  constructor(
    public username: string,
    public clientInformation: ClientInformation[],
    public option: string,
    public domain: string,
    public status: string,
    public id: string,
    public chatHistory?: ChatHistiry[],
    public operatorDisplayName?: string,
    public operatorEmail?: string,
  ) {}
};

export class ChatHistiry {
  constructor(
    public message: string,
    public domain: string,
    public time: firebase.default.firestore.Timestamp,
    public client?: string,
    public operator?: string
  ) {}
};

export class ClientInformation {
  constructor(
    public ip: string,
    public country: string,
    public city: string,
  ){}
}