import axios from 'axios';
export const getCookie = async (): Promise<string> => {
	const response: any = await axios.get('http://discord.com');
	// console.log(response);
	const cookieArray: string[] = response.headers['set-cookie'];
	const cookie: string = cookieArray.join(';');
	return cookie;
};

export const userAgent: string =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.263 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36';

export const referer: string = 'https://discord.com/channels/@me';

export const secProps = {
	'sec-fetch-mode': 'cors',
	'sec-fetch-site': 'same-origin',
	'sec-fetch-dest': 'empty'
};
export const superProperties =
	'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MDA0Iiwib3NfdmVyc2lvbiI6IjEwLjAuMTkwNDMiLCJvc19hcmNoIjoieDY0Iiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE1NjMzLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==';

export default {
	referer: referer,
	'content-type': 'application/json',
	'user-agent': userAgent,
	'x-super-properties': superProperties,
	...secProps
};
