export interface ErrorDetail {
    path: string;
    message: string;
}

export class AppError extends Error{
    public readonly statusCode: number;
    public readonly code?:string
    public readonly details?: ErrorDetail[]
    constructor(message:string,  statusCode=500, code="INTERNAL_SERVER_ERROR", details?: ErrorDetail[]){
        super(message)
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this,this.constructor)
    }
}
