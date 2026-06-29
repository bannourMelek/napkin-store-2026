import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-new-employee-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Veuillez Entrez Coordonnees de l'utilisateur</h2>
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom et Prenom</label>
          <input 
            type="text" 
            autofocus
            [(ngModel)]="data.user.name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
          <input 
            type="number" 
            [(ngModel)]="data.user.mat"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
          <input 
            type="text" 
            [(ngModel)]="data.user.jobName"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
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
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule]
})
export class SignupNewEmployeeDialogComponent {
  data = inject(MAT_DIALOG_DATA);

  constructor(
    public dialogRef: MatDialogRef<SignupNewEmployeeDialogComponent>,
  ) {
  }

  onConfirm() {
    this.dialogRef.close(this.data.user);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
