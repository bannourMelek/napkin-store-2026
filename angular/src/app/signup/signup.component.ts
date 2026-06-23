import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataService } from '../services/data.service';
import * as ExcelJS from 'exceljs';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entities/user';
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
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, NgxSpinnerModule, RouterLink],
})
export class SignupComponent implements OnInit {
  @ViewChild('badgeNumber', { static: false }) myInputField!: ElementRef;

  badgeNum: number | undefined;
  badgeId = '';
  message = '';
  user: User = {
    name: '',
    badgeId: '',
    jobName: '',
    stock: 5,
    badgeNum: 0,
    mat: '',
  };

  stock = {
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
    private cdr: ChangeDetectorRef
  ) { }

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

        const foundUser = json.find((obj: any) => obj['N.badge'] == this.badgeNum);

        this.loading = false;
        this.cdr.detectChanges();

        if (foundUser) {
          this.user = {
            mat: foundUser['Mat.'],
            name: foundUser['Matricule'],
            org: foundUser['ORGA'],
            direct: foundUser['Direct/Indirect'],
            costCenter: parseInt(foundUser['Ctre coûts']),
            birthday: foundUser['Né(e) le'],
            schoolLevel: foundUser["Cat. d'école"],
            department: foundUser['Département'],
            jobName: foundUser['Emploi'],
            badgeNum: parseInt(foundUser['N.badge']),
            superior: foundUser['Nom du supérieur hiérarchique'],
            stock: 5,
            badgeId: '',
          };

          const dialogRef = this.dialog.open(SignupEmployeeDialogComponent, {
            width: '500px',
            disableClose: true,
            data: { user: this.user }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getBadgeId();
            } else {
              this.initializeValues();
            }
          });
        } else {
          this.user.badgeNum = this.badgeNum ?? 0;
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
    this.badgeNum = NaN;
    this.badgeId = '';
    this.user = {
      name: '',
      badgeId: '',
      jobName: '',
      stock: 5,
      badgeNum: 0,
      mat: '',
    };
  }

  ngAfterViewInit() {
    this.myInputField.nativeElement.focus();
  }
}

