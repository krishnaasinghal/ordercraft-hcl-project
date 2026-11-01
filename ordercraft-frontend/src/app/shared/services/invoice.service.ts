import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  getAll(status?: string): Observable<Invoice[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Invoice[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateStatus(id: number, status: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
