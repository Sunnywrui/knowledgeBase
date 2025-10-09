import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface Preview { title: string; url: string; }
@Injectable({providedIn:'root'})
export class PreviewService{
  current$ = new BehaviorSubject<Preview|null>(null);
  open(p:Preview){ this.current$.next(p); }
  close(){ this.current$.next(null); }
}
