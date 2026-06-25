import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { StockService } from '../services/stock.service';
import { GpioService } from '../services/gpio.service';
import { GPIO_CONFIG } from '../config/gpio.config';
import { Stock } from '../entities/stock';
import { SigninChoiceDialogComponent } from './signin-choice-dialog.component';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, NgxSpinnerModule, RouterLink],
})
export class SigninComponent implements OnInit, AfterViewInit {
  @ViewChild('badgeIdInput', { static: false }) myInputField!: ElementRef;

  user: any;
  admin: any;
  loading = false;

  stock: Stock = {
    stockA: 0,
    stockB: 0,
  };

  message = '';
  badgeId = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private stockService: StockService,
    private adminService: AdminService,
    private dialog: MatDialog,
    private gpioService: GpioService
  ) { }

  ngOnInit(): void {
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

  onKey(event: any) {
    console.log(event.target.value);
    this.loading = true;

    setTimeout(() => {
      this.userService.signin(event.target.value).subscribe(
        (data) => {
          console.log(data);
          this.user = data.user;
        },
        (err) => {
          console.log(err);
        }
      );

      this.adminService.signin(event.target.value).subscribe(
        (data) => {
          console.log(data);
          this.admin = data.admin;
        },
        (err) => {
          console.log(err);
        }
      );
    }, 1000);

    setTimeout(() => {
      this.loading = false;

      if (this.user) {
        if (this.admin) {
          const dialogRef = this.dialog.open(SigninChoiceDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { user: this.user, admin: this.admin }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'user') {
              this.router.navigate(['/user', { user: JSON.stringify(this.user) }]);
            } else if (result === 'admin') {
              this.router.navigate(['/admin', { admin: JSON.stringify(this.admin) }]);
            }
          });
        } else {
          this.router.navigate(['/user', { user: JSON.stringify(this.user) }]);
        }
      } else {
        if (this.admin) {
          this.router.navigate(['/admin', { admin: JSON.stringify(this.admin) }]);
        } else {
          this.message = 'aucun Utilisateur/Administrateur trouvé!';
          this.badgeId = '';
        }
      }
    }, 2000);
  }

  ngAfterViewInit() {
    this.myInputField.nativeElement.focus();
  }
}
