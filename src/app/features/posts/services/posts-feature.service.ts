import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PostsService } from '../../../api/services/posts.service';
import { ApiConfiguration } from '../../../api/api-configuration';
import { PostResponse } from '../../../api/models/post-response';
import { PostListResponse } from '../../../api/models/post-list-response';
import { CreatePostResponse } from '../../../api/models/create-post-response';
import { GenerateSocialIdeasResponse } from '../../../api/models/generate-social-ideas-response';
import { GenerateSocialPostResponse } from '../../../api/models/generate-social-post-response';
import { PostsControllerFindAll$Params } from '../../../api/fn/posts/posts-controller-find-all';
import { BulkIdsPayload } from '../../../shared/crud-list-base';
import {
  CreatePostDto,
  UpdatePostInput,
  GenerateIdeasRequest,
  GeneratePostRequest,
} from '../models/posts.types';

@Injectable({ providedIn: 'root' })
export class PostsFeatureService {
  private api = inject(PostsService);
  private apiConfig = inject(ApiConfiguration);
  private http = inject(HttpClient);

  // ── CRUD ──
  getAll(params?: PostsControllerFindAll$Params): Promise<PostListResponse> {
    return this.api.postsControllerFindAll(params);
  }

  getById(id: string): Promise<PostResponse> {
    return this.api.postsControllerFindOne({ id });
  }

  create(dto: CreatePostDto): Promise<CreatePostResponse> {
    // The generated client mistypes the JSON body as `string`; it is sent as
    // application/json, so we pass the real object (matches blog-categories).
    return this.api.postsControllerCreate({ body: dto as any });
  }

  update(id: string, dto: UpdatePostInput): Promise<PostResponse> {
    return this.api.postsControllerUpdate({ id, body: dto as any });
  }

  delete(id: string): Promise<void> {
    return this.api.postsControllerDelete({ id });
  }

  restore(id: string): Promise<unknown> {
    return this.api.postsControllerRestore({ id });
  }

  // ── Bulk (CrudListBase wires the checkbox UI when these exist) ──
  bulkDelete(dto: BulkIdsPayload): Promise<unknown> {
    return this.api.postsControllerBulkDelete({ body: dto as any });
  }

  bulkRestore(dto: BulkIdsPayload): Promise<unknown> {
    return this.api.postsControllerBulkRestore({ body: dto as any });
  }

  /**
   * The generated export client discards the body, so we GET the blob via
   * HttpClient (auth interceptor adds the in-memory Bearer token).
   */
  export(params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    const url = `${this.apiConfig.rootUrl}/api/v1/posts/export`;
    let httpParams = new HttpParams();
    if (params?.onlyTrashed) httpParams = httpParams.set('onlyTrashed', 'true');
    if (params?.withTrashed) httpParams = httpParams.set('withTrashed', 'true');
    return firstValueFrom(
      this.http.get(url, { params: httpParams, responseType: 'blob' })
    );
  }

  // ── AI social generator (2-step flow from the POSTS spec) ──
  generateIdeas(req: GenerateIdeasRequest): Promise<GenerateSocialIdeasResponse> {
    return this.api.postsControllerGenerateSocialPostIdeas({ body: req as any });
  }

  generatePost(req: GeneratePostRequest): Promise<GenerateSocialPostResponse> {
    return this.api.postsControllerGenerateSocialPost({ body: req as any });
  }

  /**
   * Streams the generated package ZIP. The generated client discards the body,
   * so we POST via HttpClient (responseType blob) — the auth interceptor adds
   * the in-memory Bearer token automatically.
   */
  downloadSocialZip(id: string): Promise<Blob> {
    const url = `${this.apiConfig.rootUrl}/api/v1/posts/social/${id}/download-zip`;
    return firstValueFrom(this.http.post(url, null, { responseType: 'blob' }));
  }
}
