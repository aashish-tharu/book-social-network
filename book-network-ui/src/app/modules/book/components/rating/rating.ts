import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  imports: [CommonModule],
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
})
export class Rating {
  @Input() value = 0;
  @Input() readonly = false;
  @Input() label = 'Your rating';
  @Output() valueChange = new EventEmitter<number>();

  hovered = 0;

  get displayValue(): number {
    return this.hovered || this.value;
  }

  choose(value: number): void {
    if (!this.readonly) {
      this.value = value;
      this.valueChange.emit(value);
    }
  }
}
