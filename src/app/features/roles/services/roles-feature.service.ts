import { Injectable, inject } from '@angular/core';
import { RolesService } from '../../../api/services/roles.service';
import { PermissionsService } from '../../../api/services/permissions.service';
import {
  RoleResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../../../api/models';
import { RolesControllerFindAll$Params } from '../../../api/fn/roles/roles-controller-find-all';
import { BulkIdsDto } from '../../../api/models/bulk-ids-dto';

@Injectable({ providedIn: 'root' })
export class RolesFeatureService {
  private api = inject(RolesService);
  private permissionsApi = inject(PermissionsService);

  getAll(params?: RolesControllerFindAll$Params): Promise<RoleResponseDto[]> {
    return this.api.rolesControllerFindAll(params);
  }

  getById(id: string): Promise<RoleResponseDto> {
    return this.api.rolesControllerFindOne({ id });
  }

  create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.api.rolesControllerCreate({ body: dto });
  }

  update(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    return this.api.rolesControllerUpdate({ id, body: dto });
  }

  delete(id: string): Promise<void> {
    return this.api.rolesControllerRemove({ id });
  }

  restore(id: string): Promise<RoleResponseDto> {
    return this.api.rolesControllerRestore({ id });
  }

  getTrash(): Promise<RoleResponseDto[]> {
    return this.api.rolesControllerFindTrash();
  }

  bulkDelete(dto: BulkIdsDto): Promise<unknown> {
    return this.api.rolesControllerBulkDelete({ body: dto });
  }

  bulkRestore(dto: BulkIdsDto): Promise<unknown> {
    return this.api.rolesControllerBulkRestore({ body: dto });
  }

  export(params?: { onlyTrashed?: boolean; withTrashed?: boolean }): Promise<Blob> {
    return this.api.rolesControllerExport(params as any) as Promise<Blob>;
  }

  getAllPermissions() {
    return this.permissionsApi.permissionsControllerFindAll();
  }
}
