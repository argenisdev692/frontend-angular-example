import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-button',
  imports: [CommonModule],
  templateUrl: './animated-button.component.html',
  styleUrl: './animated-button.component.css'
})
export class AnimatedButtonComponent {
  text = input.required<string>();
  variant = input<'primary' | 'secondary' | 'accent'>('primary');
  icon = input<string>('');
  onClick = output<void>();

  getButtonClasses(): string {
    return `animated-button ${this.variant()}`;
  }
}
