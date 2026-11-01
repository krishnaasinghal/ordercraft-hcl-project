import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchaseOrder } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/purchase-orders`;

  getAll(status?: string, supplierId?: number, orderId?: number): Observable<PurchaseOrder[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (supplierId) params = params.set('supplierId', supplierId.toString());
    if (orderId) params = params.set('orderId', orderId.toString());
    return this.http.get<PurchaseOrder[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  receive(id: number): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(po: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, po).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, po: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}`, po).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateStatus(id: number, status: string): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
