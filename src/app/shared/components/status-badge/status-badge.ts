import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { ProductStatus, CategoryStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule, MatChipsModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  @Input() status!: ProductStatus | CategoryStatus;

  get statusClass(): string {
    return `status-${this.status}`;
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      'bozza': 'Bozza',
      'pubblicato': 'Pubblicato',
      'archiviato': 'Archiviato',
      'attivo': 'Attivo',
      'inattivo': 'Inattivo'
    };
    return labels[this.status] || this.status;
  }
}
