export interface IResponse {
    message?: string;
    status?: string;
    content?: object;
}

export interface IResponseMsg extends IResponse {
    message: string;
}