import { Observable, Observer } from 'rxjs';
import axios, { AxiosResponse } from "axios";

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}

export interface RequestParams {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: any;
    params?: any;
    paramsSerializer?: (params: any) => string;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    maxContentLength?: number;
    validateStatus?: (status: number) => boolean;
    maxRedirects?: number;
    httpAgent?: any;
    httpsAgent?: any;
  }

export class Http {
    get<T>(request: string, params: RequestParams = {}): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            axios.get<T>(request, params)
            .then((response: AxiosResponse) => {
                observer.next(response.data);
                observer.complete();
            })
            .catch((response: AxiosResponse) => {
                observer.error(response.statusText);
                observer.complete();
            })
        })
    }

    post<T>(request: string, params: any = {}): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            axios.post<T>(request, params)
            .then((response: AxiosResponse) => {
                observer.next(response.data);
                observer.complete();
            })
            .catch((response: AxiosResponse) => {
                observer.error(response.statusText);
                observer.complete();
            })
        })
    }

    delete<T>(request: string, params: any = {}): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            axios.delete(request, params)
            .then((response: AxiosResponse) => {
                observer.next(response.data);
                observer.complete();
            })
            .catch((response: AxiosResponse) => {
                observer.error(response.statusText);
                observer.complete();
            })
        })
    }

    put<T>(request: string, params: any = {}): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            axios.put<T>(request, params)
            .then((response: AxiosResponse) => {
                observer.next(response.data);
                observer.complete();
            })
            .catch((response: AxiosResponse) => {
                observer.error(response.statusText);
                observer.complete();
            })
        })
    }
};
