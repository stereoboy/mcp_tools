export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  input: string;
}