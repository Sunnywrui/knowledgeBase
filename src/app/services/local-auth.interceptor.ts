import { HttpInterceptorFn } from '@angular/common/http';
export const localAuthInterceptor: HttpInterceptorFn = (req,next)=>{
  const token=sessionStorage.getItem('LOCAL_KB_TOKEN')||'local-only';
  return next(req.clone({setHeaders:{'x-local-token':token}}));
};
