export type ApiResponse = {
  message: string;
  success: boolean;
  data?: any;
}

export interface Font {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: Date;
}

export interface FontGroup {
  id: string;
  name: string;
  fonts: Font[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFontGroupRequest {
  name: string;
  fontIds: string[];
}

export interface UpdateFontGroupRequest {
  id: string;
  name: string;
  fontIds: string[];
}
