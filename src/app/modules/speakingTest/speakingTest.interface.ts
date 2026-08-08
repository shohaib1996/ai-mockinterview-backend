export interface IConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IStoredMessage extends IConversationMessage {
  part: number;
}

export interface IChatPayload {
  part: 1 | 2 | 3;
  conversation: IConversationMessage[];
}

export interface ISubmitPart2Payload {
  transcript: string;
}
