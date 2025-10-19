import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ReferenceDetail } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private selectedReference$ = new BehaviorSubject<ReferenceDetail | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getReferenceDetail(referenceId: string): Observable<ReferenceDetail> {
    this.loading$.next(true);
    return this.apiService.getReferenceDetail(referenceId).pipe(
      tap(response => {
        if (response.data) {
          this.selectedReference$.next(response.data);
        }
        this.loading$.next(false);
      }),
      map(response => response.data!)
    );
  }

  setSelectedReference(reference: ReferenceDetail | null): void {
    this.selectedReference$.next(reference);
  }

  getSelectedReference(): Observable<ReferenceDetail | null> {
    return this.selectedReference$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  clearSelectedReference(): void {
    this.selectedReference$.next(null);
  }
}