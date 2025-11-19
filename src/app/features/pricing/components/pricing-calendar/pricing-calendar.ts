import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin } from 'rxjs';
import { ServiceProduct, CalendarDay, PriceType, PriceOverride } from '../../../../core/models';
import { InMemoryDataService } from '../../../../core/services/in-memory-data.service';

enum CalendarView {
  Monthly = 'monthly',
  Yearly = 'yearly'
}

@Component({
  selector: 'app-pricing-calendar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatSlideToggleModule
  ],
  templateUrl: './pricing-calendar.html',
  styleUrl: './pricing-calendar.scss',
})
export class PricingCalendarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(InMemoryDataService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  product = signal<ServiceProduct | undefined>(undefined);
  currentDate = signal(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  selectedDays = signal<CalendarDay[]>([]);

  // Selezione multipla
  isSelecting = signal(false);
  lastClickedDay = signal<CalendarDay | null>(null);

  // Vista calendario
  calendarView = signal<CalendarView>(CalendarView.Monthly);
  yearlyMonths = signal<Date[]>([]);

  // Expose enums to template
  PriceType = PriceType;
  CalendarView = CalendarView;

  monthName = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  });

  yearName = computed(() => {
    return this.currentDate().getFullYear().toString();
  });

  weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProduct(+productId);
    }
  }

  loadProduct(id: number) {
    this.dataService.getProduct(id).subscribe(product => {
      if (product) {
        this.product.set(product);
        this.generateCalendar();
      }
    });
  }

  generateCalendar() {
    const product = this.product();
    if (!product) return;

    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from Monday
    let startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - diff);

    const days: CalendarDay[] = [];

    // Generate 6 weeks to always fill the calendar
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      const dateString = this.formatDateToISO(currentDay);

      const calendarDay: CalendarDay = {
        date: currentDay,
        dateString: dateString,
        basePrice: product.price || 0,
        finalPrice: product.price || 0,
        priceType: PriceType.Base,
        isToday: currentDay.getTime() === today.getTime(),
        isPast: currentDay < today,
        isWeekend: currentDay.getDay() === 0 || currentDay.getDay() === 6
      };

      days.push(calendarDay);
    }

    this.calendarDays.set(days);
    this.loadPricesForVisibleDays(product.id);
  }

  loadPricesForVisibleDays(productId: number) {
    const days = this.calendarDays();
    if (days.length === 0) return;

    // Calcola il range di date visibili nel calendario
    const firstDay = days[0].date;
    const lastDay = days[days.length - 1].date;

    // Carica i prezzi per tutti i mesi che contengono giorni visibili
    const monthsToLoad = new Set<string>();
    days.forEach(day => {
      const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;
      monthsToLoad.add(key);
    });

    // Carica i prezzi per ogni mese
    const priceRequests = Array.from(monthsToLoad).map(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      return this.dataService.getDailyPricesForProduct(productId, year, month);
    });

    // Combina tutti i risultati
    if (priceRequests.length > 0) {
      forkJoin(priceRequests).subscribe(results => {
        const allPrices = results.flat();
        const priceMap = new Map(allPrices.map(p => [p.date, p]));

        this.calendarDays.update(days => days.map(day => {
          const dailyPrice = priceMap.get(day.dateString);
          if (dailyPrice) {
            return {
              ...day,
              finalPrice: dailyPrice.finalPrice,
              priceType: dailyPrice.priceType,
              adjustment: dailyPrice.percentageAdjustment || dailyPrice.fixedPrice,
              stock: dailyPrice.stock,
              isActive: dailyPrice.isActive
            };
          }
          return day;
        }));
      });
    }
  }

  previousMonth() {
    const date = this.currentDate();
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  nextMonth() {
    const date = this.currentDate();
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  previousYear() {
    const date = this.currentDate();
    date.setFullYear(date.getFullYear() - 1);
    this.currentDate.set(new Date(date));
    this.generateYearlyView();
  }

  nextYear() {
    const date = this.currentDate();
    date.setFullYear(date.getFullYear() + 1);
    this.currentDate.set(new Date(date));
    this.generateYearlyView();
  }

  switchView(view: CalendarView) {
    this.calendarView.set(view);
    this.selectedDays.set([]);
    if (view === CalendarView.Yearly) {
      this.generateYearlyView();
    } else {
      this.generateCalendar();
    }
  }

  generateYearlyView() {
    const year = this.currentDate().getFullYear();
    const months: Date[] = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }
    this.yearlyMonths.set(months);
  }

  // Selezione singola o con shift
  selectDay(day: CalendarDay, event?: MouseEvent) {
    if (day.isPast) return;

    // Shift-click: selezione range
    if (event?.shiftKey && this.lastClickedDay()) {
      this.selectRange(this.lastClickedDay()!, day);
      return;
    }

    // Click singolo: seleziona solo questo giorno
    this.selectedDays.set([day]);
    this.lastClickedDay.set(day);
  }

  // Doppio click: inizia drag selection
  onDayDoubleClick(day: CalendarDay) {
    if (day.isPast) return;
    this.isSelecting.set(true);
    this.selectedDays.set([day]);
    this.lastClickedDay.set(day);
  }

  // Mouse enter durante drag
  onDayMouseEnter(day: CalendarDay) {
    if (!this.isSelecting() || day.isPast) return;

    const firstDay = this.lastClickedDay();
    if (firstDay) {
      this.selectRange(firstDay, day);
    }
  }

  // Mouse up: termina drag selection
  onMouseUp() {
    this.isSelecting.set(false);
  }

  // Seleziona range di giorni
  selectRange(start: CalendarDay, end: CalendarDay) {
    const allDays = this.calendarDays();
    const startTime = start.date.getTime();
    const endTime = end.date.getTime();
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);

    const rangeDays = allDays.filter(day => {
      const dayTime = day.date.getTime();
      return dayTime >= minTime && dayTime <= maxTime && !day.isPast;
    });

    this.selectedDays.set(rangeDays);
  }

  setPriceOverride(priceType: PriceType, value?: number, stock?: number, isActive?: boolean) {
    const days = this.selectedDays();
    const product = this.product();
    if (days.length === 0 || !product) return;

    let completed = 0;
    const total = days.length;

    days.forEach(day => {
      const override: PriceOverride = {
        productId: product.id,
        date: day.dateString,
        priceType: priceType,
        value: value,
        stock: stock !== undefined ? stock : day.stock,
        isActive: isActive !== undefined ? isActive : day.isActive
      };

      this.dataService.setPriceOverride(override).subscribe(() => {
        completed++;
        if (completed === total) {
          this.snackBar.open(`Prezzo aggiornato per ${total} ${total === 1 ? 'giorno' : 'giorni'}`, 'Chiudi', { duration: 2000 });
          this.generateCalendar();
          this.selectedDays.set([]);
        }
      });
    });
  }

  setStockOnly(stock: number) {
    const days = this.selectedDays();
    const product = this.product();
    if (days.length === 0 || !product) return;

    let completed = 0;
    const total = days.length;

    days.forEach(day => {
      const override: PriceOverride = {
        productId: product.id,
        date: day.dateString,
        priceType: day.priceType,
        value: day.adjustment,
        stock: stock,
        isActive: day.isActive
      };

      this.dataService.setPriceOverride(override).subscribe(() => {
        completed++;
        if (completed === total) {
          this.snackBar.open(`Disponibilità aggiornata per ${total} ${total === 1 ? 'giorno' : 'giorni'}`, 'Chiudi', { duration: 2000 });
          this.generateCalendar();
        }
      });
    });
  }

  setActiveStatus(isActive: boolean) {
    const days = this.selectedDays();
    const product = this.product();
    if (days.length === 0 || !product) return;

    let completed = 0;
    const total = days.length;

    days.forEach(day => {
      const override: PriceOverride = {
        productId: product.id,
        date: day.dateString,
        priceType: day.priceType,
        value: day.adjustment,
        stock: day.stock,
        isActive: isActive
      };

      this.dataService.setPriceOverride(override).subscribe(() => {
        completed++;
        if (completed === total) {
          const status = isActive ? 'attivato' : 'disattivato';
          this.snackBar.open(`Prodotto ${status} per ${total} ${total === 1 ? 'giorno' : 'giorni'}`, 'Chiudi', { duration: 2000 });
          this.generateCalendar();
        }
      });
    });
  }

  removeOverride() {
    const days = this.selectedDays();
    const product = this.product();
    if (days.length === 0 || !product) return;

    let completed = 0;
    const total = days.length;

    days.forEach(day => {
      this.dataService.removePriceOverride(product.id, day.dateString).subscribe(() => {
        completed++;
        if (completed === total) {
          this.snackBar.open(`Personalizzazione rimossa per ${total} ${total === 1 ? 'giorno' : 'giorni'}`, 'Chiudi', { duration: 2000 });
          this.generateCalendar();
          this.selectedDays.set([]);
        }
      });
    });
  }

  goBack() {
    this.router.navigate(['/pricing']);
  }

  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPrice(price: number): string {
    return '€' + price.toFixed(2);
  }

  getDayClass(day: CalendarDay): string {
    const classes = ['calendar-day'];
    if (day.isPast) classes.push('past');
    if (day.isToday) classes.push('today');
    if (day.isWeekend) classes.push('weekend');
    if (day.date.getMonth() !== this.currentDate().getMonth()) classes.push('other-month');
    if (day.priceType !== PriceType.Base) classes.push('has-override');
    if (day.isActive === false) classes.push('inactive'); // Giorno non attivo

    // Check if day is in selected days array
    const isSelected = this.selectedDays().some(d => d.dateString === day.dateString);
    if (isSelected) classes.push('selected');

    return classes.join(' ');
  }
}
