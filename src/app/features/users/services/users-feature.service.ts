import { Injectable, inject } from '@angular/core';
import { UsersService } from '../../../api/services/users.service';
import {
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  UserListResponse,
  MessageResponse,
  SetupPasswordDto,
  ChangePasswordDto,
  RequestPasswordChangeDto,
  BulkIdsDto,
} from '../../../api/models';
import { UsersControllerFindAll$Params } from '../../../api/fn/users/users-controller-find-all';

@Injectable({ providedIn: 'root' })
export class UsersFeatureService {
  private api = inject(UsersService);

  getAll(params?: UsersControllerFindAll$Params): Promise<UserListResponse> {
    return this.api.usersControllerFindAll(params);
  }

  getById(id: string): Promise<UserResponse> {
    return this.api.usersControllerFindOne({ id });
  }

  create(dto: CreateUserDto): Promise<UserResponse> {
    return this.api.usersControllerCreate({ body: dto });
  }

  update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    return this.api.usersControllerUpdate({ id, body: dto });
  }

  delete(id: string): Promise<unknown> {
    return this.api.usersControllerRemove({ id });
  }

  export(params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    return this.api.usersControllerExport(params) as Promise<Blob>;
  }

  checkEmail(value: string, excludeId?: string): Promise<{ exists?: boolean }> {
    return this.api.usersControllerCheckEmail({ value, excludeId });
  }

  checkUsername(value: string, excludeId?: string): Promise<{ exists?: boolean }> {
    return this.api.usersControllerCheckUsername({ value, excludeId });
  }

  setupPassword(dto: SetupPasswordDto): Promise<MessageResponse> {
    return this.api.usersControllerSetupPassword({ body: dto });
  }

  requestPasswordChange(dto: RequestPasswordChangeDto): Promise<MessageResponse> {
    return this.api.usersControllerRequestPasswordChange({ body: dto });
  }

  changePassword(dto: ChangePasswordDto): Promise<MessageResponse> {
    return this.api.usersControllerChangePassword({ body: dto });
  }

  bulkDelete(dto: BulkIdsDto): Promise<unknown> {
    return this.api.usersControllerBulkDelete({ body: dto });
  }

  bulkRestore(dto: BulkIdsDto): Promise<unknown> {
    return this.api.usersControllerBulkRestore({ body: dto });
  }
}
