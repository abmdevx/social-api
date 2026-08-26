export interface Comment {
  _id: string;
  content: string;
  owner: string;
  video: string;
  createdAt?: string;
}

export interface CommentPage {
  comments: Comment[];
  page: number;
  limit: number;
  totalComments: number;
  totalPages: number;
}
