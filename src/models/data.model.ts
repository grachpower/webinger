import { HttpMethod } from "../request";
import { RequestModel } from "./request.model";

export interface DataModel {
    initDate: Date;
    endDate: Date;
    requestsCount: number;
    url: string;
    method: HttpMethod;
    rps: number;
    requests: RequestModel[];
    successRequests: number;
    errorRequests: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
    allTime: number;
    successPercent: number;
    errorPercent: number;
    statusCodes: {statusCode: number, count: number}[];
}