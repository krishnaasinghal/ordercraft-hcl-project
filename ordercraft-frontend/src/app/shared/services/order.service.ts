import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManufacturingOrder } from '../models/order.model';
import { PurchaseOrder } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getAll(status?: string, priority?: string, search?: string): Observable<ManufacturingOrder[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (search) params = params.set('search', search);
    return this.http.get<ManufacturingOrder[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<ManufacturingOrder> {
    return this.http.get<ManufacturingOrder>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(order: any): Observable<ManufacturingOrder> {
    return this.http.post<ManufacturingOrder>(this.apiUrl, order).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, order: any): Observable<ManufacturingOrder> {
    return this.http.put<ManufacturingOrder>(`${this.apiUrl}/${id}`, order).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  updateStatus(id: number, status: string): Observable<ManufacturingOrder> {
    return this.http.put<ManufacturingOrder>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  explodeBom(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/explode-bom`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  generatePurchaseOrders(id: number): Observable<PurchaseOrder[]> {
    return this.http.post<PurchaseOrder[]>(`${this.apiUrl}/${id}/generate-pos`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  generateInvoice(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/generate-invoice`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getRecent(limit: number = 5): Observable<ManufacturingOrder[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ManufacturingOrder[]>(`${this.apiUrl}/recent`, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
