import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AuthFeatureService } from '../../features/auth/services/auth.service';
import {
  AuthSessionsFeatureService,
  SessionView,
  TrustedDeviceView,
} from '../../features/auth/services/sessions.service';
import { AuthService as GeneratedAuthService } from '../../api/services/auth.service';
import { ApiConfiguration } from '../../api/api-configuration';
import { joinApiUrl } from '../../api/api-url';
import { UserResponse } from '../../api/models/user-response';
import { UpdateProfileDto } from '../../api/models/update-profile-dto';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { FormSubmitButtonComponent } from '../../components/form-submit-button/form-submit-button.component';
import { ImageCropperDialogComponent } from '../../components/image-cropper-dialog/image-cropper-dialog.component';
import { FloatingMenuButtonComponent } from '../../components/floating-menu-button/floating-menu-button.component';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
    ToastModule,
    SidebarComponent,
    PageHeaderComponent,
    FormSubmitButtonComponent,
    ImageCropperDialogComponent,
    FloatingMenuButtonComponent,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authFeatureService = inject(AuthFeatureService);
  private sessionsService = inject(AuthSessionsFeatureService);
  private generatedAuthService = inject(GeneratedAuthService);
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);
  protected router = inject(Router);
  private messageService = inject(MessageService);

  protected readonly drawerVisible = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly user = this.authFeatureService.currentUser;
  protected readonly isEditing = signal(false);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly cropperVisible = signal(false);
  protected readonly cropperImageUrl = signal<string | null>(null);

  protected readonly totpSetupVisible = signal(false);
  protected readonly totpSetupLoading = signal(false);
  protected readonly totpSetupData = signal<{ qrCodeUrl: string; secret: string; manualEntryKey?: string } | null>(null);
  protected readonly totpCode = signal('');
  protected readonly savingTotp = signal(false);

  protected readonly backupCodesVisible = signal(false);
  protected readonly backupCodes = signal<string[]>([]);
  protected readonly confirmingDisable = signal(false);

  // ── Active sessions & trusted devices ──
  protected readonly sessions = signal<SessionView[]>([]);
  protected readonly trustedDevices = signal<TrustedDeviceView[]>([]);
  protected readonly loadingSessions = signal(false);
  protected readonly loadingDevices = signal(false);
  protected readonly revokingId = signal<string | null>(null);
  protected readonly loggingOutAll = signal(false);

  protected editForm: Partial<UpdateProfileDto> = {};
  protected passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  protected readonly canUpdatePassword = computed(() => {
    return !!this.passwordForm.currentPassword &&
           !!this.passwordForm.newPassword &&
           !!this.passwordForm.confirmPassword;
  });

  async ngOnInit(): Promise<void> {
    await this.loadUser();
    // Load sessions/devices in the background — failures must not block the page.
    this.loadSessions();
    this.loadTrustedDevices();
  }

  async loadUser(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authFeatureService.fetchCurrentUser();
      this.resetEditForm();
    } catch {
      this.error.set('Failed to load user profile');
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const first = u.name?.charAt(0) ?? '';
    const last = u.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || (u.username?.charAt(0) ?? '').toUpperCase();
  });

  toggleEdit(): void {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
      this.resetEditForm();
    }
  }

  private resetEditForm(): void {
    const u = this.user();
    this.editForm = {
      name: u?.name ?? undefined,
      lastName: u?.lastName ?? undefined,
      username: u?.username ?? undefined,
      phone: u?.phone ?? undefined,
      dateOfBirth: u?.dateOfBirth ?? undefined,
      gender: (u?.gender as UpdateProfileDto['gender']) ?? undefined,
      address: u?.address ?? undefined,
      city: u?.city ?? undefined,
      state: u?.state ?? undefined,
      zipCode: u?.zipCode ?? undefined,
      country: u?.country ?? undefined,
    };
  }

  async saveProfile(): Promise<void> {
    this.savingProfile.set(true);
    try {
      await this.generatedAuthService.authControllerUpdateMe({ body: this.editForm as UpdateProfileDto });
      await this.authFeatureService.fetchCurrentUser();
      this.isEditing.set(false);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update profile' });
    } finally {
      this.savingProfile.set(false);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.cropperImageUrl.set(reader.result as string);
      this.cropperVisible.set(true);
    };
    reader.readAsDataURL(file);

    // reset input so same file can be selected again
    input.value = '';
  }

  async onCropped(blob: Blob): Promise<void> {
    const formData = new FormData();
    formData.append('file', blob, 'profile-photo.jpg');

    try {
      await firstValueFrom(
        this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/me/profile-photo'), formData)
      );
      await this.authFeatureService.fetchCurrentUser();
      this.cropperImageUrl.set(null);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile photo updated' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload photo' });
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Passwords do not match' });
      return;
    }
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword.length < 8) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Password must be at least 8 characters' });
      return;
    }

    this.savingPassword.set(true);
    try {
      // Note: the generated ChangePasswordDto requires a token field which is for reset flow.
      // For authenticated password change, the backend may expect a different shape.
      // Using raw HttpClient for authenticated change-password to avoid DTO mismatch.
      await firstValueFrom(
        this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/change-password'), {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          passwordConfirmation: this.passwordForm.confirmPassword
        })
      );
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to change password' });
    } finally {
      this.savingPassword.set(false);
    }
  }

  async logoutAll(): Promise<void> {
    this.loggingOutAll.set(true);
    try {
      await this.generatedAuthService.authControllerLogoutAll();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'All other sessions have been logged out' });
      this.loadSessions();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to logout other sessions' });
    } finally {
      this.loggingOutAll.set(false);
    }
  }

  async loadSessions(): Promise<void> {
    this.loadingSessions.set(true);
    try {
      this.sessions.set(await this.sessionsService.listSessions());
    } catch {
      this.sessions.set([]);
    } finally {
      this.loadingSessions.set(false);
    }
  }

  async loadTrustedDevices(): Promise<void> {
    this.loadingDevices.set(true);
    try {
      this.trustedDevices.set(await this.sessionsService.listTrustedDevices());
    } catch {
      this.trustedDevices.set([]);
    } finally {
      this.loadingDevices.set(false);
    }
  }

  async revokeSession(id: string): Promise<void> {
    this.revokingId.set(id);
    try {
      await this.sessionsService.revokeSession(id);
      this.sessions.update(list => list.filter(s => s.id !== id));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Session revoked' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to revoke session' });
    } finally {
      this.revokingId.set(null);
    }
  }

  async revokeTrustedDevice(id: string): Promise<void> {
    this.revokingId.set(id);
    try {
      await this.sessionsService.revokeTrustedDevice(id);
      this.trustedDevices.update(list => list.filter(d => d.id !== id));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Device removed' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove device' });
    } finally {
      this.revokingId.set(null);
    }
  }

  async revokeAllTrustedDevices(): Promise<void> {
    try {
      await this.sessionsService.revokeAllTrustedDevices();
      this.trustedDevices.set([]);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'All trusted devices removed' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove trusted devices' });
    }
  }

  async enableTotp(): Promise<void> {
    this.totpSetupLoading.set(true);
    this.totpSetupVisible.set(true);
    this.totpCode.set('');
    this.totpSetupData.set(null);

    try {
      const data = await firstValueFrom(
        this.http.post<{
          qrCodeUrl: string;
          secret: string;
          manualEntryKey?: string;
        }>(joinApiUrl(this.config.rootUrl, '/api/v1/auth/two-factor/setup'), {})
      );
      this.totpSetupData.set(data);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to start 2FA setup' });
      this.totpSetupVisible.set(false);
    } finally {
      this.totpSetupLoading.set(false);
    }
  }

  async confirmTotpSetup(): Promise<void> {
    const code = this.totpCode().trim();
    if (!code || code.length < 6) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Enter a valid 6-digit TOTP code' });
      return;
    }

    this.savingTotp.set(true);
    try {
      await this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/two-factor/enable'), { code }).toPromise();
      this.totpSetupVisible.set(false);
      this.totpCode.set('');
      this.totpSetupData.set(null);
      await this.authFeatureService.fetchCurrentUser();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Two-factor authentication enabled successfully' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid TOTP code. Please try again.' });
    } finally {
      this.savingTotp.set(false);
    }
  }

  async disableTotp(): Promise<void> {
    if (!this.confirmingDisable()) {
      this.confirmingDisable.set(true);
      this.messageService.add({ severity: 'warn', summary: 'Confirm', detail: 'Click Disable 2FA again to confirm' });
      return;
    }

    this.savingTotp.set(true);
    try {
      await this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/two-factor/disable'), {}).toPromise();
      this.confirmingDisable.set(false);
      await this.authFeatureService.fetchCurrentUser();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Two-factor authentication disabled' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to disable 2FA' });
    } finally {
      this.savingTotp.set(false);
    }
  }

  async regenerateBackupCodes(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.post<{ backupCodes: string[] }>(joinApiUrl(this.config.rootUrl, '/api/v1/auth/two-factor/backup-codes/regenerate'), {})
      );
      this.backupCodes.set(data.backupCodes);
      this.backupCodesVisible.set(true);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Backup codes regenerated' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to regenerate backup codes' });
    }
  }

  closeTotpSetup(): void {
    this.totpSetupVisible.set(false);
    this.totpCode.set('');
    this.totpSetupData.set(null);
    this.confirmingDisable.set(false);
  }
}
