import { Http, HttpMethod } from './request';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as args from 'yargs';

const argv = args.argv;

let method: HttpMethod;
let url: string;
let RPS: number;
let output: string;

if (!argv.method) {
    method = HttpMethod.GET;
} else {
    method = argv.method;
}

if (!argv.url) {
    throw new Error('Url is not defined, use "--url=http://yoururl.com" notation');
} else {
    url = argv.url;
}

if (!argv.rps) {
    RPS = 1;
} else {
    RPS = argv.rps;
}



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
    method,
    url,
    RPS,
);
