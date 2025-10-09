import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppShellComponent } from './app/app-shell.component';
import { localAuthInterceptor } from './app/services/local-auth.interceptor';

bootstrapApplication(AppShellComponent, {
  providers: [ provideHttpClient(withInterceptors([localAuthInterceptor])) ]
}).catch(err => console.error(err));
