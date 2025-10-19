import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map, filter, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({providedIn:'root'})
export class UploadService{
  constructor(private http:HttpClient){}
  upload(files:File[]):Observable<number>{
    const fd=new FormData(); files.forEach(f=>fd.append('files',f));
    return this.http.post('/api/ingest',fd,{reportProgress:true,observe:'events'}).pipe(
      filter(e=>e.type===HttpEventType.UploadProgress||e.type===HttpEventType.Response),
      map(e=> e.type===HttpEventType.UploadProgress && e.total ? Math.round(100*(e.loaded/e.total)) : 100),
      catchError(()=>of(0))
    );
  }
}
