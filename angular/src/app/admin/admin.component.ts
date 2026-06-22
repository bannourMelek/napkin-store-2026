import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../services/stock.service';
import { GpioService } from '../services/gpio.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, NgxSpinnerModule, RouterLink],
})
export class AdminComponent implements OnInit, AfterViewInit {
  @ViewChild('stockAMinusBtn') stockAMinusBtn: ElementRef | undefined;

  admin = {
    mat: 12345,
    name: 'John Doe',
    org: 'Boy Scouts',
    jobName: 'Scoutmaster',
    badgeNum: 789,
    badgeId: 'BS-12345-789',
  };
  loading = false;

  stock = {
    stockA: 0,
    stockB: 0,
  };

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private stockService: StockService,
    private gpioService: GpioService
  ) {
    // this.admin = this.route.snapshot.paramMap.get('admin');
    // this.admin = JSON.parse(this.admin);
    this.admin = {
      mat: 12345,
      name: 'John Doe',
      org: 'Boy Scouts',
      jobName: 'Scoutmaster',
      badgeNum: 789,
      badgeId: 'BS-12345-789',
    }

  }

  ngOnInit(): void {
    this.stockService.getStock().subscribe(
      (data) => {
        this.stock = data.stock;
      },
      (err) => {
        console.log(err);
      }
    );
    this.gpioService.disableButton(5).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
    this.gpioService.disableButton(6).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
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

  minus(choice: string) {
    if (choice == 'A') {
      this.stock.stockA = this.stock.stockA - 1;
      this.updateStock();
    } else {
      this.stock.stockB = this.stock.stockB - 1
      this.updateStock();
    }
  }

  plus(choice: string) {
    if (choice == 'A') {
      this.stock.stockA = this.stock.stockA + 1;
      this.updateStock();
    } else {
      this.stock.stockB = this.stock.stockB + 1
      this.updateStock();
    }
  }
}
