export interface VerifySiteResponse {
  site: {
    id: string;
    name: string;
    url: string;
  };
  message: string;
  token: string;
}

export interface CommentResponse {
  comments: CommentData[];
  pagination: Pagination;
}

export interface ReplyData {
  id: string;
  name: string;
  body: string;
  timestamp: string;
  reactions?: any[];
}

export interface CommentData {
  id: string;
  body: string;
  timestamp: string;
  replies: ReplyData[];
  reactions?: any[];
  name: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface Blog {
  id: string;
  name: string;
  url: string;
  reaction_counts: {
    like?: number;
    dislike?: number;
    love?: number;
    haha?: number;
    wow?: number;
    sad?: number;
    angry?: number;
  };
  total_comments: number;
}
