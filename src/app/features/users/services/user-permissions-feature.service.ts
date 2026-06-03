import { Injectable, inject } from '@angular/core';
import { UserPermissionsService } from '../../../api/services/user-permissions.service';
import { PermissionsService } from '../../../api/services/permissions.service';
import { UserPermissionResponseDto } from '../../../api/models/user-permission-response-dto';
import { PermissionResponseDto } from '../../../api/models/permission-response-dto';
import { UpsertUserPermissionDto } from '../../../api/models/upsert-user-permission-dto';

@Injectable({ providedIn: 'root' })
export class UserPermissionsFeatureService {
  private userPermissionsApi = inject(UserPermissionsService);
  private permissionsApi = inject(PermissionsService);

  getUserPermissions(userId: string): Promise<UserPermissionResponseDto[]> {
    return this.userPermissionsApi.userPermissionsControllerList({ userId });
  }

  getAllPermissions(): Promise<PermissionResponseDto[]> {
    return this.permissionsApi.permissionsControllerFindAll();
  }

  assignPermission(userId: string, permissionId: string): Promise<UserPermissionResponseDto> {
    const dto: UpsertUserPermissionDto = {
      permissionId,
      isGranted: true,
      fields: [],
    };
    return this.userPermissionsApi.userPermissionsControllerUpsert({ userId, body: dto });
  }

  removePermission(userId: string, permissionId: string): Promise<void> {
    return this.userPermissionsApi.userPermissionsControllerRemove({ userId, permissionId });
  }
}
