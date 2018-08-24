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
}