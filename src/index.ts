import { throwError, Observable, BehaviorSubject, interval } from 'rxjs';
import { catchError, filter, finalize, mergeMap, takeUntil, tap } from 'rxjs/operators';
import * as yargs from 'yargs'
import { AxiosResponse } from "axios";

import { Http, HttpMethod } from './request';
import { DataModel } from "./models/data.model";
import { RequestModel } from "./models/request.model";

const argv = yargs.argv;

let method: HttpMethod;
let url: string;
let RPS: number;
let requests: number;
let output: string;

/**
 * Default GET http method
 */
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

/**
 * Default one request per second
 */
if (!argv.rps) {
    RPS = 1;
} else {
    RPS = argv.rps;
}

/**
 * Default 100 requests
 */
if (!argv.requests) {
    requests = 100;
} else {
    requests = argv.requests;
}

const http = new Http();

const initialDataState: DataModel = {
    initDate: null, // on init
    endDate: null, // on finalize
    requestsCount: null, // on init
    url: null, // on init
    method: null, // on init
    rps: null, // on init
    requests: [], // in runtime
    successRequests: null, // on finalize
    errorRequests: null, // on finalize
    averageTime: null, // on finalize
    maxTime: null, // on finalize
    minTime: null, // on finalize
    allTime: null, // on finalize
    successPercent: null,
    errorPercent: null,
    statusCodes: null,
};

function pingAddress<T>(method: HttpMethod, url: string, rps: number, requestsCount: number): void {
    updateState({url, method, requestsCount, rps});

    const dateInit = new Date;
    const count$ = new BehaviorSubject<number>(0);
    const status$ = count$.pipe(filter((count: number) => count >= requestsCount));

    consoleInitial(dateInit);

    interval(1000 / rps)
        .pipe(
            takeUntil(status$),
            finalize(() => consoleFinalize()),
            mergeMap(() => sendRequst(new Date(), count$)),
        )
        .subscribe();
}

function updateState(item: Partial<DataModel>): void {
    Object.assign(initialDataState, item);
}

function addRequestToState(request: RequestModel): void {
    initialDataState.requests.push(request);
}

function calcFinalize(): void {
    const endDate = new Date();
    const errorRequests: number = initialDataState.requests
        .filter((request: RequestModel) => request.statusCode >= 400).length;
    const successRequests: number = initialDataState.requests
        .filter((request: RequestModel) => request.statusCode < 400).length;
    const averageTime: number = calcAverageTime(initialDataState.requests);
    const sortedByAsc: number[] = initialDataState.requests
        .sort((a: RequestModel, b: RequestModel) => a.time - b.time)
        .map(({time}: RequestModel) => time);
    const maxTime = sortedByAsc[0];
    const minTime = sortedByAsc[sortedByAsc.length];
    const allTime = (initialDataState.initDate as any) - (endDate as any);
    const successPercent = (successRequests / initialDataState.requestsCount) * 100;
    const errorPercent = (errorRequests / initialDataState.requestsCount) * 100;

    updateState({
        endDate,
        errorRequests,
        successRequests,
        averageTime,
        maxTime,
        minTime,
        allTime,
        successPercent,
        errorPercent,
    });
}

function calcAverageTime(requests: RequestModel[]): number {
    const arrTime = requests
        .map(({time}: RequestModel) => time);

    const average: number = arrTime.reduce(function(acc, curr) { return acc+curr; }) / arrTime.length;

    return Math.sqrt(arrTime.reduce((acc: number, curr: number) => {
        const dev = curr - average;

        return acc + dev * dev;
    }) / arrTime.length);
}

function getMethod<T>(method: HttpMethod, url: string): Observable<AxiosResponse<T>> {
    switch (method) {
        case HttpMethod.GET:
            return http.get<T>(url);
        case HttpMethod.POST:
            return http.post<AxiosResponse<T>>(url);
        case HttpMethod.DELETE:
            return http.delete<AxiosResponse<T>>(url);
        case HttpMethod.PUT:
            return http.put<AxiosResponse<T>>(url);
    }
}

function sendRequst<T>(requestTimeStart: Date, count$: BehaviorSubject<number>): Observable<AxiosResponse<T>> {
    return getMethod(method, url)
        .pipe(
            catchError((err: AxiosResponse<T>) => {
                const requestTimeEnd = new Date();

                addRequestToState({
                    statusCode: err.status,
                    initDate: requestTimeStart,
                    endDate: requestTimeEnd,
                    time: (requestTimeEnd as any) - (requestTimeStart as any),
                    err: err.statusText,
                } as RequestModel);

                count$.next(count$.value + 1);

                return throwError(err);
            }),
            tap((res: AxiosResponse<T>) => {
                const requestTimeEnd = new Date();

                addRequestToState({
                    statusCode: res.status,
                    initDate: requestTimeStart,
                    endDate: requestTimeEnd,
                    time: (requestTimeEnd as any) - (requestTimeStart as any),
                } as RequestModel);

                count$.next(count$.value + 1);
            })
        );
}

function consoleInitial(dateInit: Date): void {
    console.log(`Webinger inited at ${dateInit.getSeconds()}:${dateInit.getMinutes()}:${dateInit.getHours()}`);
    console.log(`  Selected url: ${url}`);
    console.log(`  Selected method: ${method}`);
    console.log(`  Selected rps: ${RPS}`);
    console.log(`  Selected requests count: ${RPS}`);
    console.log('================================');
}

function consoleFinalize(): void {
    calcFinalize();

    console.log(`Webinger finished in ${initialDataState.allTime}`);
    console.log(`Success requests: ${initialDataState.successRequests} - ${initialDataState.successPercent}`);
    console.log(`Error requests: ${initialDataState.errorRequests} - ${initialDataState.errorPercent}`);
    console.log(`Average response time: ${initialDataState.averageTime}`);
    console.log(`Max response time: ${initialDataState.maxTime}`);
    console.log(`Min response time: ${initialDataState.minTime}`);
}


// ============= INIT ============= //
pingAddress(
    method,
    url,
    RPS,
    requests,
);
