import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = 'wallet';
  @Input() trend?: number;          // ex: 12 ou -8
  @Input() trendLabel = 'ce mois';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary';

  get trendPositive(): boolean {
    return (this.trend ?? 0) >= 0;
  }
}
