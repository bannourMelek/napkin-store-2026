import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../services/stock.service';
import { GpioService } from '../services/gpio.service';
import { GPIO_CONFIG } from '../config/gpio.config';
import { Stock } from '../entities/stock';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, NgxSpinnerModule, RouterLink],
})
export class AdminComponent implements OnInit, AfterViewInit {
  @ViewChild('stockAMinusBtn') stockAMinusBtn: ElementRef | undefined;

  admin: any;
  loading = false;

  stock: Stock = {
    stockA: 0,
    stockB: 0,
  };

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private stockService: StockService,
    private gpioService: GpioService
  ) {
    const adminParam = this.route.snapshot.paramMap.get('admin');
    if (adminParam) {
      this.admin = JSON.parse(adminParam);
    }
  }

  ngOnInit(): void {
    this.stockService.getStock().subscribe(
      (data) => {
        this.stock = data.stock;
        this.changeDetectorRef.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
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
  }

  ngAfterViewInit(): void {
    // Ensure change detection has run before accessing ViewChild
    this.changeDetectorRef.detectChanges();

    // Focus on the first button after view initialization
    if (this.stockAMinusBtn?.nativeElement) {
      this.stockAMinusBtn.nativeElement.focus();
    }
  }

  updateStock() {
    console.log(this.stock);
    this.loading = true;

    this.stockService.updateStock(this.stock).subscribe(
      (data: any) => {
        this.loading = false;
        this.stock = data.stock;
      },
      (err) => {
        this.loading = false;
        console.log(err);
      }
    );
  }

  minus(choice: string, amount: number = 1) {
    if (choice == 'A') {
      this.stock.stockA = Math.max(0, this.stock.stockA - amount);
      this.updateStock();
    } else {
      this.stock.stockB = Math.max(0, this.stock.stockB - amount);
      this.updateStock();
    }
  }

  plus(choice: string, amount: number = 1) {
    if (choice == 'A') {
      this.stock.stockA = this.stock.stockA + amount;
      this.updateStock();
    } else {
      this.stock.stockB = this.stock.stockB + amount;
      this.updateStock();
    }
  }
}
