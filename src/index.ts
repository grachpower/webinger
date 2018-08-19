import { Http, HttpMethod } from './request';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const http = new Http();

function pingAddress<T>(method: HttpMethod, url: string, RPS: number): void {
    const request: Observable<T> = getMethod(method, url);

    setInterval(() => {
        request
            .pipe(
                catchError(err => throwError(err))
            )
            .subscribe((res: T) => console.log(res));
    }, 1000 / RPS);
}

function getMethod<T>(method: HttpMethod, url: string): Observable<T> {
    switch (method) {
        case HttpMethod.GET:
            return http.get<T>(url);
        case HttpMethod.POST:
            return http.post<T>(url);
        case HttpMethod.DELETE:
            return http.delete<T>(url);
        case HttpMethod.PUT:
            return http.put<T>(url);
    }
}


// ============= INIT ============= //
pingAddress(
    HttpMethod.GET,
    'http://localhost:8888/shop-item/4c821277-fd3c-4f71-b6cb-4f2db771d97b/men-portfel-viola-castellani',
    10,
);