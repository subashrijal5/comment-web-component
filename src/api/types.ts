export type ReactionType = "like" | "love" | "laugh" | "surprised" | "sad";

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
  reaction_counts: Partial<Record<ReactionType, number>>;
}

export interface CommentData {
  id: string;
  body: string;
  timestamp: string;
  replies: ReplyData[];
  reaction_counts: Partial<Record<ReactionType, number>>;
  name: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export type Reaction = {
  emoji: string;
  count: number;
  selected: boolean;
  type: ReactionType;
};


export interface Blog {
  id: string;
  name: string;
  url: string;
  reaction_counts: Record<ReactionType, number>;
  total_comments: number;
}
