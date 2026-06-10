import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { AppointmentsFeatureService } from '../services/appointments-feature.service';
import {
  AppointmentResponse,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../../api/models';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CrudFormBase } from '../../../shared/crud-form-base';

type LeadStatus = NonNullable<CreateAppointmentDto['statusLead']>;

@Component({
  selector: 'app-appointments-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PageHeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './appointments-form.component.html',
  styleUrl: './appointments-form.component.css',
})
export class AppointmentsFormComponent extends CrudFormBase<
  AppointmentResponse,
  CreateAppointmentDto,
  UpdateAppointmentDto
> {
  protected api = inject(AppointmentsFeatureService);

  readonly drawerVisible = signal(false);

  readonly leadStatusOptions: LeadStatus[] = ['New', 'Called', 'Pending', 'Declined'];

  get service() {
    return this.api;
  }

  buildForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      statusLead: ['New' as LeadStatus],
      owner: [''],
      registrationDate: [''],
      smsConsent: [false],
      message: [''],
      notes: [''],
      additionalNote: [''],
    });
  }

  patchFromEntity(entity: AppointmentResponse, form: FormGroup): void {
    form.patchValue({
      firstName: entity.firstName,
      lastName: entity.lastName,
      phone: entity.phone,
      email: entity.email ?? '',
      address: entity.address,
      address2: entity.address2 ?? '',
      city: entity.city,
      state: entity.state,
      zipcode: entity.zipcode,
      country: entity.country,
      statusLead: entity.statusLead && entity.statusLead !== 'null' ? entity.statusLead : 'New',
      owner: entity.owner ?? '',
      registrationDate: entity.registrationDate?.split('T')[0] ?? '',
      smsConsent: entity.smsConsent,
      message: entity.message ?? '',
      notes: entity.notes ?? '',
      additionalNote: entity.additionalNote ?? '',
    });
  }

  toCreateDto(v: any): CreateAppointmentDto {
    return {
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      email: v.email || null,
      address: v.address,
      address2: v.address2 || null,
      city: v.city,
      state: v.state,
      zipcode: v.zipcode,
      country: v.country,
      statusLead: v.statusLead,
      owner: v.owner || null,
      registrationDate: v.registrationDate || null,
      smsConsent: !!v.smsConsent,
      message: v.message || null,
      notes: v.notes || null,
      additionalNote: v.additionalNote || null,
    };
  }

  toUpdateDto(v: any): UpdateAppointmentDto {
    return this.toCreateDto(v);
  }

  get listRoute(): string {
    return '/appointments';
  }
}
