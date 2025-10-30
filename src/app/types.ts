export type Conversation = { id: string; title: string; createdAt?: string; updatedAt?: string; lastMessagePreview?: string; };

export type Citation = { id: string; title: string; url: string; snippet?: string; mime?: string; };

export type ChatChunk =
  | { type:'started'; data?:any }
  | { type:'token'|'message'|'sources'|'error'; data:any }
  | { type:'done'; data?:any };

export type AskPayload = { 
  query: string; 
  conversation_id?: string; 
  stream?: boolean; 
  prompt_params?: Array<{key: string, value: string}>;
  settings?: any; 
};