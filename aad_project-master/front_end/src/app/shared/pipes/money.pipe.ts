// shared/pipes/money.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'money',
  standalone: false
 })
export class MoneyPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
    if (value == null) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }
}
