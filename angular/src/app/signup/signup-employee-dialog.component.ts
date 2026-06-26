import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup-employee-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Coordonnées de l'utilisateur</h2>
      <div class="space-y-3 mb-6">
        <p class="text-gray-700"><span class="font-semibold">Nom et Prenom:</span> {{data.user.name}}</p>
        <p class="text-gray-700"><span class="font-semibold">Département:</span> {{data.user.department}}</p>
        <p class="text-gray-700"><span class="font-semibold">Matricule:</span> {{data.user.mat}}</p>
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
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class SignupEmployeeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SignupEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {} 

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
