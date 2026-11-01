import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/suppliers`;

  getAll(search?: string): Observable<Supplier[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Supplier[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
