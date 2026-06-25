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
  private socket: any;

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
    
    // Fallback dummy data if user data is not available
    if (!this.user || !this.user.name) {
      this.user = {
        mat: 'EMP001',
        name: 'John Doe',
        org: 'Sales Department',
        direct: 'Alice Johnson',
        costCenter: 1001,
        birthday: '1985-03-15',
        schoolLevel: 'Bachelor',
        department: 'Sales',
        jobName: 'Sales Manager',
        badgeNum: 1001,
        superior: 'Bob Wilson',
        stock: 5,
        badgeId: 'BADGE-001',
      };
    }

    setTimeout(() => {
      if (!this.functionFired) {
        this.router.navigate(['/signin']);
      }
    }, 20000);
  }

  ngOnInit(): void {
    this.stockService.getStock().subscribe(
      (data) => {
        this.stock = data.stock;
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
    this.socket = io('http://127.0.0.1:5000');
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
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
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
