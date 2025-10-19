import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '发生未知错误';
        
        if (error.error instanceof ErrorEvent) {
          // 客户端错误
          errorMessage = `客户端错误: ${error.error.message}`;
        } else {
          // 服务器错误
          switch (error.status) {
            case 0:
              errorMessage = '无法连接到服务器';
              break;
            case 400:
              errorMessage = '请求参数错误';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '拒绝访问';
              break;
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误';
              break;
            case 503:
              errorMessage = '服务暂时不可用';
              break;
            default:
              errorMessage = `服务器错误: ${error.status} ${error.statusText}`;
          }
        }
        
        console.error('HTTP Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}