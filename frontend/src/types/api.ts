export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface MediaAsset {
  url: string;
  publicId: string;
}
