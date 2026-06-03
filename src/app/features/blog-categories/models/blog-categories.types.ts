import { BlogCategoryResponse } from '../../../api/models/blog-category-response';

export type { BlogCategoryResponse };

export interface CreateBlogCategoryDto {
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface UpdateBlogCategoryDto {
  name?: string;
  description?: string | null;
  image?: string | null;
}
