import {
  Component,
  inject,
  signal,
  computed,
  resource,
  effect,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';

import { UsersFeatureService } from '../services/users-feature.service';
import { RolesService } from '../../../api/services/roles.service';
import { PermissionsService } from '../../../api/services/permissions.service';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../../../api/models';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

function asyncEmailValidator(service: UsersFeatureService, excludeId?: string) {
  return (control: AbstractControl): Promise<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return Promise.resolve(null);
    }
    return service.checkEmail(control.value, excludeId).then((res) => {
      return res.exists ? { emailExists: true } : null;
    }).catch(() => null);
  };
}

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    PageHeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.css',
})
export class UsersFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(UsersFeatureService);
  private rolesService = inject(RolesService);
  private permissionsService = inject(PermissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  readonly userId = signal<string | null>(this.route.snapshot.params['id'] ?? null);
  readonly isEdit = computed(() => !!this.userId());
  readonly drawerVisible = signal(false);
  readonly isSubmitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    roleIds: [[] as string[]],
    permissionIds: [[] as string[]],
  });

  readonly rolesResource = resource({
    loader: () => this.rolesService.rolesControllerFindAll(),
  });

  readonly permissionsResource = resource({
    loader: () => this.permissionsService.permissionsControllerFindAll(),
  });

  readonly roles = computed(() => this.rolesResource.value() ?? []);
  readonly permissions = computed(() => this.permissionsResource.value() ?? []);

  readonly userResource = resource({
    loader: () => {
      const id = this.userId();
      if (!id) return Promise.resolve(null);
      return this.service.getById(id);
    },
  });

  constructor() {
    effect(() => {
      const user = this.userResource.value() as UserResponse | null;
      if (user) {
        this.form.patchValue({
          name: user.name,
          lastName: user.lastName ?? '',
          email: user.email,
          phone: user.phone ?? '',
          roleIds: user.roles.map((r) => r.id),
          permissionIds: [], // UserResponse.permissions lacks 'id'; user must re-select
        });
        const emailControl = this.form.get('email');
        if (emailControl) {
          emailControl.setAsyncValidators(asyncEmailValidator(this.service, user.id));
          emailControl.updateValueAndValidity();
        }
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const dto = this.form.value;

    const promise = this.isEdit()
      ? this.service.update(this.userId()!, dto as UpdateUserDto)
      : this.service.create(dto as CreateUserDto);

    promise
      .then(() => {
        this.router.navigate(['/users']);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  onCancel(): void {
    this.location.back();
  }
}
