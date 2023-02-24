export interface IResponse {
    message?: string;
    status?: string;
    content?: unknown;
	message: string;
}

export interface IResponseMsg extends IResponse {
    message: string;
}