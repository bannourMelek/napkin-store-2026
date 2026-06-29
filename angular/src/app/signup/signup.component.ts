import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataService } from '../services/data.service';
import * as ExcelJS from 'exceljs';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entities/user';
import { Stock } from '../entities/stock';
import { StockService } from '../services/stock.service';
import { GpioService } from '../services/gpio.service';
import { GPIO_CONFIG } from '../config/gpio.config';
import { SignupEmployeeDialogComponent } from './signup-employee-dialog.component';
import { SignupNewEmployeeDialogComponent } from './signup-new-employee-dialog.component';
import { SignupBadgeDialogComponent } from './signup-badge-dialog.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule, NgxSpinnerModule, RouterLink],
})
export class SignupComponent implements OnInit {
  private static readonly DIGIT_KEY_REGEX = /^[0-9]$/;

  @ViewChild('personalNumber', { static: false }) myInputField!: ElementRef;

  userForm!: FormGroup;
  showForm = false;
  personalNum: string = '';
  badgeId = '';
  message = '';
  user: any

  stock: Stock = {
    stockA: 0,
    stockB: 0,
  };

  loading = false;
  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private stockService: StockService,
    private gpioService: GpioService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Disable GPIO buttons to simulate hardware button clicks for product retrieval
    this.gpioService.disableButton(GPIO_CONFIG.BUTTON_PIN_A).subscribe(
      (data) => {
        console.log('Button A disabled:', data);
      },
      (err) => {
        console.log('Button A disable error:', err);
      }
    );
    this.gpioService.disableButton(GPIO_CONFIG.BUTTON_PIN_B).subscribe(
      (data) => {
        console.log('Button B disabled:', data);
      },
      (err) => {
        console.log('Button B disable error:', err);
      }
    );
    this.stockService.getStock().subscribe(
      (data) => {
        this.stock = data.stock;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  blockManualTyping(event: KeyboardEvent): void {
    if (!SignupComponent.DIGIT_KEY_REGEX.test(event.key)) {
      event.preventDefault();
    }
  }
  initializeForm() {
    this.userForm = this.formBuilder.group({
      personalNum: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      jobName: ['', [Validators.required]],
      badgeNum: ['', [Validators.required, Validators.min(0)]],
      badgeId: ['', [Validators.required]],
      stock: [5, [Validators.required, Validators.min(0)]],
    });
  }

  resetForm() {
    this.userForm.reset({
      personalNum: '',
      name: '',
      jobName: '',
      badgeNum: '',
      badgeId: '',
      stock: 5,
    });
    this.cdr.detectChanges();
  }

  getEmployee() {
    this.loading = true;

    this.dataService.getExcelFile().subscribe(async (data: any) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);

        const worksheet = workbook.worksheets[0];
        const json: any[] = [];

        // Get headers from first row
        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value as string;
        });

        // Convert rows to JSON objects
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          const obj: any = {};
          row.eachCell((cell, colNumber) => {
            obj[headers[colNumber]] = cell.value;
          });
          json.push(obj);
        });

        const foundUser = json.find((obj: any) => obj['Mat.'] == this.personalNum);

        this.loading = false;
        this.cdr.detectChanges();

        if (foundUser) {
          console.log(foundUser);
          this.user = {
            personalNum: foundUser['Mat.'],
            name: foundUser['Matricule'],
            // org: foundUser['ORGA'],
            // direct: foundUser['Direct/Indirect'],
            // costCenter: parseInt(foundUser['Ctre coûts']),
            // birthday: foundUser['Né(e) le'],
            // schoolLevel: foundUser["Cat. d'école"],
            department: foundUser['Dept'],
            jobName: foundUser['Emploi'],
            badgeNum: parseInt(foundUser['N° badge']),
            // superior: foundUser['Nom du supérieur hiérarchique'],
            stock: 5,
            badgeId: '',
          };

          const dialogRef = this.dialog.open(SignupEmployeeDialogComponent, {
            width: '500px',
            disableClose: true,
            data: { user: this.user }
          });
          this.cdr.detectChanges();
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getBadgeId();
            } else {
              this.initializeValues();
            }
          });
        } else {
          this.user.personalNum = this.personalNum ?? '';
          const dialogRef = this.dialog.open(SignupNewEmployeeDialogComponent, {
            width: '500px',
            disableClose: true,
            data: { user: this.user }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.user = result;
              this.getBadgeId();
            } else {
              this.initializeValues();
            }
          });
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  signupUser() {
    this.user.badgeId = this.badgeId;
    console.log(this.user);
    this.userService.signup(this.user).subscribe(
      (data: any) => {
        console.log(data);
        this.router.navigate(['/user', { user: JSON.stringify(data.user) }]);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  submitForm() {
    if (this.userForm.valid) {
      this.user = {
        personalNum: this.userForm.get('personalNum')?.value,
        name: this.userForm.get('name')?.value,
        jobName: this.userForm.get('jobName')?.value,
        badgeNum: parseInt(this.userForm.get('badgeNum')?.value),
        badgeId: this.userForm.get('badgeId')?.value,
        stock: this.userForm.get('stock')?.value,
      };
      this.signupUser();
    }
  }

  getBadgeId() {
    const dialogRef = this.dialog.open(SignupBadgeDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { badgeId: this.badgeId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.badgeId = result;
        this.signupUser();
      } else {
        this.initializeValues();
      }
    });
  }

  initializeValues() {
    this.personalNum = '';
    this.badgeId = '';
    this.showForm = false;
    this.user = {
      name: '',
      badgeId: '',
      jobName: '',
      stock: 5,
      badgeNum: 0,
      personalNum: '',
    };
    this.resetForm();
    this.cdr.detectChanges();
    // Defer focus until after change detection completes
    setTimeout(() => {
      if (this.myInputField) {
        this.myInputField.nativeElement.focus();
      }
    }, 0);
  }

  ngAfterViewInit() {
    this.myInputField.nativeElement.focus();
  }
}

