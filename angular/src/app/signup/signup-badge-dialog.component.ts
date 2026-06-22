import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-badge-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-2">Badgez s'il vous plais</h2>
      <p class="text-gray-600 mb-6">Veuillez scanner votre badge</p>
      
      <div class="mb-6">
        <input 
          type="password" 
          autofocus
          placeholder="Badge ID"
          [(ngModel)]="badgeId"
          class="w-full px-4 py-3 rounded-lg bg-gray-50 text-center placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-300" />
      </div>
      
      <div class="flex gap-3">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          class="flex-1">
          Valider
        </button>
        <button 
          mat-stroked-button
          (click)="onCancel()"
          class="flex-1">
          Annuler
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule]
})
export class SignupBadgeDialogComponent {
  badgeId = '';

  constructor(
    public dialogRef: MatDialogRef<SignupBadgeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.badgeId) {
      this.badgeId = data.badgeId;
    }
  }

  onConfirm() {
    this.dialogRef.close(this.badgeId);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
