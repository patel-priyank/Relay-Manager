import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api') && environment.apiUrl) {
    // Strip trailing slash from API url to ensure no double slashes like domain.com//api/
    const baseUrl = environment.apiUrl.replace(/\/$/, '');

    // Instead of using relative request, prepend the base url.
    const apiReq = req.clone({ url: `${baseUrl}${req.url}` });
    return next(apiReq);
  }

  return next(req);
};
