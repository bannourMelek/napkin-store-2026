import { Component, AfterViewChecked, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../services/stock.service';
import { UserService } from '../services/user.service';
import { User } from '../entities/user';
import { Stock } from '../entities/stock';
import { GpioService } from '../services/gpio.service';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, NgxSpinnerModule],
})
export class UserComponent implements AfterViewChecked, OnInit {
  user: User;

  stock: Stock = {
    stockA: 0,
    stockB: 0,
  };

  relaisAPin = 16;
  relaisBPin = 21;

  functionFired = false;
  showMessage = false;
  messageText = '';
  private socket: any;
  private messageTimeout: any;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private stockService: StockService,
    private userService: UserService,
    private gpioService: GpioService
  ) {
    let user: any = this.route.snapshot.paramMap.get('user');
    this.user = JSON.parse(user);
    console.log(this.user);


    setTimeout(() => {
      if (!this.functionFired) {
        this.router.navigate(['/signin']);
      }
    }, 30000);
  }

  ngOnInit(): void {
    this.stockService.getStock().subscribe(
      (data) => {
        this.stock = data.stock;
        this.changeDetectorRef.detectChanges();
        if (this.user.stock > 0) {
          if (this.stock.stockA > 0) {
            this.gpioService.enableButton(5).subscribe(
              (data) => {
                console.log(data);
              },
              (err) => {
                console.log(err);
              }
            );
          }
          if (this.stock.stockB > 0) {
            this.gpioService.enableButton(6).subscribe(
              (data) => {
                console.log(data);
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
    // Initialize Socket.IO only for Electron app
    const enableSocket = (environment as any).enableSocket || false;
    const isElectron = (environment as any).isElectron || false;

    if (enableSocket) {
      const socketUrl = (environment as any).socketUrl || environment.apiUrl.replace('/api/', '');

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Socket.IO event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', this.socket.id);
        if (isElectron) {
          console.log('🖥️  Running in Electron environment');
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected');
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('⚠️  Socket.IO connection error:', error);
      });

      this.socket.on('button_pressed', (data: any) => {
        console.log('Button Pressed:', data);
        /*this.user.stock = this.user.stock - 1;
        if(data.channel == 6) {
          this.stock.stockB = this.stock.stockB - 1;
        } else {
          this.stock.stockA = this.stock.stockA - 1;
        }
        this.stockService.updateStock(this.stock).subscribe(
          (data: any) => {
            this.stock = data.stock;
            console.log(this.stock);
            this.userService.update(this.user).subscribe(
              (data: any) => {
                console.log(data);
                this.user = data.user;
                this.router.navigate(['/signin']);
              },
              (err) => {
                console.log(err);
              }
            );
          },
          (err) => {
            console.log(err);
          }
        );*/
      });
    } else {
      console.log('ℹ️  Socket.IO disabled for browser environment');
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  showActionMessage(message: string): void {
    this.showMessage = true;
    this.messageText = message;
    this.changeDetectorRef.detectChanges();

    // Clear existing timeout if any
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }


    // Hide message and reset to initial state after 3 seconds
    this.messageTimeout = setTimeout(() => {
      this.showMessage = false;
      this.messageText = '';
      this.functionFired = false;
      this.router.navigate(['/signin']);

      this.changeDetectorRef.detectChanges();
    }, 3000);
  }

  updateUser(choice: string) {
    this.functionFired = true;
    this.user.stock = this.user.stock - 1;
    if (choice == 'stockA') {
      this.stock.stockA = this.stock.stockA - 1;
      this.gpioService
        .turnOnOff({
          relaisPin: this.relaisAPin,
        })
        .subscribe(
          (res) => {
            console.log('relais A', res);
            this.stockService.updateStock(this.stock).subscribe(
              (data: any) => {
                this.stock = data.stock;
                console.log(this.stock);
                this.userService.update(this.user).subscribe(
                  (data: any) => {
                    console.log(data);
                    this.user = data.user;
                    this.showActionMessage('Veuillez récupérer votre produit');
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              },
              (err) => {
                console.log(err);
              }
            );
          },
          (err) => {
            console.log('relais A', err);
          }
        );
      //this.turnRelais(this.relaisA, gpio.HIGH)
    } else {
      this.stock.stockB = this.stock.stockB - 1;
      this.gpioService
        .turnOnOff({
          relaisPin: this.relaisBPin,
        })
        .subscribe(
          (res) => {
            console.log('relais B', res);
            this.stockService.updateStock(this.stock).subscribe(
              (data: any) => {
                this.stock = data.stock;
                console.log(this.stock);
                this.userService.update(this.user).subscribe(
                  (data: any) => {
                    console.log(data);
                    this.user = data.user;
                    this.showActionMessage('Veuillez récupérer votre produit');
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              },
              (err) => {
                console.log(err);
              }
            );
          },
          (err) => {
            console.log('relais B', err);
          }
        );
      //this.turnRelais(this.relaisB, gpio.HIGH)
    }


  }
}
