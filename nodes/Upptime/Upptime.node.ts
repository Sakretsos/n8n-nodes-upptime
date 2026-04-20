import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Upptime implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Upptime',
		name: 'upptime',
		icon: 'file:upptime.svg',
		usableAsTool: true,
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Fetch status data from an Upptime status page',
		defaults: {
			name: 'Upptime',
		},
		inputs: ['main'] as INodeTypeDescription['inputs'],
		outputs: ['main'] as INodeTypeDescription['outputs'],
		credentials: [
			{
				name: 'uptimeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get status summary for many monitored services',
						action: 'Get many monitors',
					},
					{
						name: 'Get Monitor by Name',
						value: 'getByName',
						description: 'Get status for a specific monitor by name',
						action: 'Get monitor by name',
					},
					{
						name: 'Get Down Services',
						value: 'getDown',
						description: 'Get only services that are currently down',
						action: 'Get down services',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Monitor Name',
				name: 'monitorName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getByName'],
					},
				},
				description: 'The name of the monitor to fetch (e.g. "S1 Germany", "US Ashburn")',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Include Downtime History',
						name: 'includeDowntime',
						type: 'boolean',
						default: true,
						description: 'Whether to include the dailyMinutesDown field in the output',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as {
			includeDowntime?: boolean;
		};

		const credentials = await this.getCredentials('uptimeApi');
		const summaryUrl = credentials.summaryUrl as string;

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'uptimeApi',
			{
				method: 'GET',
				url: summaryUrl,
				json: true,
			},
		);

		const data = response as IDataObject[];
		let results: IDataObject[];

		switch (operation) {
			case 'getAll':
				results = data;
				break;

			case 'getByName': {
				const monitorName = this.getNodeParameter('monitorName', 0) as string;
				results = data.filter(
					(entry) => String(entry.name).toLowerCase() === monitorName.toLowerCase(),
				);
				if (results.length === 0) {
					const available = data.map((e) => e.name).join(', ');
					throw new NodeOperationError(this.getNode(),
						`Monitor "${monitorName}" not found. Available monitors: ${available}`,
					);
				}
				break;
			}

			case 'getDown':
				results = data.filter((entry) => entry.status !== 'up');
				break;

			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
		}

		const returnData: INodeExecutionData[] = results.map((entry) => {
			const json = { ...entry };
			if (additionalFields.includeDowntime === false) {
				delete json.dailyMinutesDown;
			}
			return { json };
		});

		return [returnData];
	}
}
