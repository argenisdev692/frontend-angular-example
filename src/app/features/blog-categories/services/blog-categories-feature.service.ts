import { Injectable, inject } from '@angular/core';
import { BlogCategoriesService } from '../../../api/services/blog-categories.service';
import { BlogCategoryResponse } from '../../../api/models/blog-category-response';
import { CreateBlogCategoryDto, UpdateBlogCategoryDto } from '../models/blog-categories.types';
import { BlogCategoryControllerFindAll$Params } from '../../../api/fn/blog-categories/blog-category-controller-find-all';
import { BulkIdsDto } from '../../../api/models/bulk-ids-dto';

@Injectable({ providedIn: 'root' })
export class BlogCategoriesFeatureService {
  private api = inject(BlogCategoriesService);

  getAll(params?: BlogCategoryControllerFindAll$Params): Promise<BlogCategoryResponse[]> {
    return this.api.blogCategoryControllerFindAll(params);
  }

  getById(id: string): Promise<BlogCategoryResponse> {
    return this.api.blogCategoryControllerFindOne({ id });
  }

  create(dto: CreateBlogCategoryDto): Promise<BlogCategoryResponse> {
    return this.api.blogCategoryControllerCreate({ body: dto as any });
  }

  update(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategoryResponse> {
    return this.api.blogCategoryControllerUpdate({ id, body: dto as any });
  }

  delete(id: string): Promise<void> {
    return this.api.blogCategoryControllerRemove({ id });
  }

  restore(id: string): Promise<BlogCategoryResponse> {
    return this.api.blogCategoryControllerRestore({ id });
  }

  getTrash(): Promise<BlogCategoryResponse[]> {
    return this.api.blogCategoryControllerFindTrash();
  }

  bulkDelete(dto: BulkIdsDto): Promise<unknown> {
    return this.api.blogCategoryControllerBulkDelete({ body: dto });
  }

  bulkRestore(dto: BulkIdsDto): Promise<unknown> {
    return this.api.blogCategoryControllerBulkRestore({ body: dto });
  }

  export(params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    return this.api.blogCategoryControllerExport(params as any) as Promise<Blob>;
  }

  uploadImage(id: string, file: File): Promise<BlogCategoryResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.blogCategoryControllerUploadImage({ id, body: formData as any });
  }

  deleteImage(id: string): Promise<BlogCategoryResponse> {
    return this.api.blogCategoryControllerDeleteImage({ id });
  }
}
