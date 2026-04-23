import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class UptimeApi implements ICredentialType {
	name = 'uptimeApi';
	displayName = 'Upptime API';
	icon = 'file:../icons/upptime.svg' as const;
	documentationUrl = 'https://upptime.js.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'Summary JSON URL',
			name: 'summaryUrl',
			type: 'string',
			default: '',
			placeholder: 'https://raw.githubusercontent.com/user/repo/master/history/summary.json',
			description: 'The raw GitHub URL to your Upptime summary.json file',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.summaryUrl}}',
			method: 'GET',
		},
	};
}
