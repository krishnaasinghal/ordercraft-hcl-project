import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  getAll(paymentMethod?: string, startDate?: string, endDate?: string): Observable<Payment[]> {
    let params = new HttpParams();
    if (paymentMethod) params = params.set('paymentMethod', paymentMethod);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Payment[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getByInvoice(invoiceId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/invoice/${invoiceId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
