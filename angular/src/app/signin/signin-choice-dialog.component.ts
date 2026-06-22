import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin-choice-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Sélectionnez votre rôle</h2>
      <p class="text-gray-600 mb-6">Choisissez si vous êtes un utilisateur ou un administrateur</p>
      <div class="flex gap-3">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="choose('user')"
          class="flex-1">
          Utilisateur
        </button>
        <button 
          mat-raised-button 
          color="accent" 
          (click)="choose('admin')"
          class="flex-1">
          Administrateur
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class SigninChoiceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SigninChoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  choose(choice: string) {
    this.dialogRef.close(choice);
  }
}
