export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  references?: Reference[];
  timestamp: Date;
}

// 参考文献接口
export interface Reference {
  id: string;
  title: string;
  source: string;
  relevance: number;
  excerpt?: string;
}

// 参考文献详情接口
export interface ReferenceDetail extends Reference {
  content: string;
  context: {
    pageNumber: number;
    sectionTitle: string;
    position: string;
  };
}

// 对话接口
export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
  createdAt: Date;
  messageCount: number;
  messages?: Message[];
}

// 文档接口
export interface Document {
  id: string;
  filename: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processingProgress: number;
  uploadedAt: Date;
  pageCount?: number;
  conversationId: string;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: T[];
}

// 发送消息请求
export interface SendMessageRequest {
  content: string;
}

// 发送消息响应
export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}