import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    private gpioService: GpioService,
        private readonly changeDetectorRef: ChangeDetectorRef,

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
        console.log(data)
        this.stock = data.stock;
        this.changeDetectorRef.detectChanges()
      },
      (err) => {
        console.log(err);
      }
    );
  }

  //:3,1064986999,77697A3F;3,1064986999,77697A3F
  onKey(event: any) {
    // Prevent multiple signin attempts while one is already in progress
    if (this.loading) {
      return;
    }

    if (event.target.value.length > 43) {
      this.loading = true;
      const badgeValue = event.target.value;

      // Run both signin requests in parallel and wait for both to complete
      forkJoin({
        userResponse: this.userService.signin(badgeValue).pipe(
          catchError((err) => {
            console.error('User signin error:', err);
            return of(null);
          })
        ),
        adminResponse: this.adminService.signin(badgeValue).pipe(
          catchError((err) => {
            console.error('Admin signin error:', err);
            return of(null);
          })
        )
      }).subscribe({
        next: (results) => {
          this.loading = false;
          this.user = results.userResponse?.user || null;
          this.admin = results.adminResponse?.admin || null;
          this.changeDetectorRef.markForCheck();
          this.handleSigninResult();
        },
        error: (err) => {
          console.error('Signin failed:', err);
          this.loading = false;
          this.message = 'aucun Utilisateur/Administrateur trouvé!';
          this.badgeId = '';
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  /**
   * Handle the signin result based on what roles were found
   * - If both user and admin: show dialog to choose role
   * - If only user: navigate to user page
   * - If only admin: navigate to admin page
   * - If neither: show error message
   */
  private handleSigninResult(): void {
    if (this.user && this.admin) {
      // User has both roles - show choice dialog
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
    } else if (this.user) {
      // Only user role found
      this.router.navigate(['/user', { user: JSON.stringify(this.user) }]);
    } else if (this.admin) {
      // Only admin role found
      this.router.navigate(['/admin', { admin: JSON.stringify(this.admin) }]);
    } else {
      // No roles found
      this.message = 'aucun Utilisateur/Administrateur trouvé!';
      this.badgeId = '';
    }
  }

  ngAfterViewInit() {
    this.myInputField.nativeElement.focus();
  }
}
