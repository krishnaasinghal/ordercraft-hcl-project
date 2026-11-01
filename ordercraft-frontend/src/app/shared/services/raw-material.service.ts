import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RawMaterial } from '../models/raw-material.model';

@Injectable({ providedIn: 'root' })
export class RawMaterialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/raw-materials`;

  getAll(search?: string): Observable<RawMaterial[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<RawMaterial[]>(this.apiUrl, { params }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getById(id: number): Observable<RawMaterial> {
    return this.http.get<RawMaterial>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  create(material: RawMaterial): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(this.apiUrl, material).pipe(
      catchError(error => throwError(() => error))
    );
  }

  update(id: number, material: RawMaterial): Observable<RawMaterial> {
    return this.http.put<RawMaterial>(`${this.apiUrl}/${id}`, material).pipe(
      catchError(error => throwError(() => error))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getLowStock(): Observable<RawMaterial[]> {
    return this.http.get<RawMaterial[]>(`${this.apiUrl}/low-stock`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
