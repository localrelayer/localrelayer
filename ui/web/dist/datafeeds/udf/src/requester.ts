import { RequestParams, UdfResponse, UdfErrorResponse, logMessage } from './helpers';

export class Requester {
	private _headers: object | undefined;

	public constructor(headers?: object) {
		if (headers) {
			this._headers = headers;
		}
	}

	public sendRequest<T extends UdfResponse>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T | UdfErrorResponse>;
	public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T>;
	public sendRequest<T>(datafeedUrl: string, urlPath: string, params?: RequestParams): Promise<T> {
		if (params !== undefined) {
			const paramKeys = Object.keys(params);
			if (paramKeys.length !== 0) {
				urlPath += '?';
			}

			urlPath += paramKeys.map((key: string) => {
				return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
			}).join('&');
		}

		logMessage('New request: ' + urlPath);

		const options: RequestInit = {};
		if (this._headers !== undefined) {
			options.headers = this._headers;
		}

		return fetch(`${datafeedUrl}/${urlPath}`, options)
			.then((response: Response) => response.text())
			.then((responseTest: string) => JSON.parse(responseTest));
	}
}
