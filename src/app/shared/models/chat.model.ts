export class Chat {
  constructor(
    public username: string,
    // public userIp: string,
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
    
  ) {}
};