export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  created_at?: string;
  post_count?: number;
  comment_count?: number;
  reaction_count?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image: string | null;
  createdAt: string;
  userId: number;
  author?: {
    id: number;
    name: string;
  };
  comments?: Comment[];
  _count?: {
    comments: number;
    reactions: number;
  };
  reaction_count?: number;
  comment_count?: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  postId: number;
  author?: {
    id: number;
    name: string;
  };
}

export interface ReactionResponse {
  status: "liked" | "unliked";
}
