import { Injectable } from '@angular/core';
import { HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse,
    HttpHeaders,
    HttpClient, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Router } from "@angular/router";


@Injectable()

export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,

      ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let token = localStorage.getItem('access_token');

        if(token){
            if(!req.url.includes('/login')){
                const headers =  new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                req = req.clone({
                    headers: headers
                });
            }
        }

        return next.handle(req).pipe(

            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    //console.log(event)
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                if(error instanceof HttpErrorResponse){
                }
                if(error.status == 500){
                    this.showError("Ocurrió un error inesperado");
                }
                if(error.status == 401){
                    this.showError("La sesión expiró");
                    localStorage.setItem("access_token", "")
                    this.router.navigate(['/login']);
                }
                if(error.status == 400){
                    this.showError(error.error.error);
                    console.log(error)
                }

                return throwError(error);
            })
        );
    }


    showError(error: string){
       console.log(error);

    }
}
