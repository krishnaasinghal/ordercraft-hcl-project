import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BillOfMaterial } from '../models/bom.model';

@Injectable({ providedIn: 'root' })
export class BomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bom`;

  getAll(status?: string): Observable<BillOfMaterial[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<BillOfMaterial[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<BillOfMaterial> {
    return this.http.get<BillOfMaterial>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(bom: BillOfMaterial): Observable<BillOfMaterial> {
    return this.http.post<BillOfMaterial>(this.apiUrl, bom).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, bom: BillOfMaterial): Observable<BillOfMaterial> {
    return this.http.put<BillOfMaterial>(`${this.apiUrl}/${id}`, bom).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  activate(id: number): Observable<BillOfMaterial> {
    return this.http.put<BillOfMaterial>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getByProduct(productId: number): Observable<BillOfMaterial[]> {
    return this.http.get<BillOfMaterial[]>(`${this.apiUrl}/product/${productId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
