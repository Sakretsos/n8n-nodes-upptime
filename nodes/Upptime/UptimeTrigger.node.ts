/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class UptimeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Upptime Trigger',
		name: 'uptimeTrigger',
		icon: 'file:upptime.svg',
		usableAsTool: true,
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when a monitor changes status (goes down or comes back up)',
		defaults: {
			name: 'Upptime Trigger',
		},
		polling: true,
		inputs: [] as INodeTypeDescription['inputs'],
		outputs: ['main'] as INodeTypeDescription['outputs'],
		credentials: [
			{
				name: 'uptimeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Monitor Went Down',
						value: 'down',
						description: 'Triggers when any monitor goes down',
						action: 'Monitor went down',
					},
					{
						name: 'Monitor Came Back Up',
						value: 'up',
						description: 'Triggers when a monitor recovers',
						action: 'Monitor came back up',
					},
					{
						name: 'Any Status Change',
						value: 'any',
						description: 'Triggers on any status change (down or recovery)',
						action: 'Any status change',
					},
				],
				default: 'down',
			},
		],
	};

	async poll(this: IPollFunctions) {
		const event = this.getNodeParameter('event') as string;
		const credentials = await this.getCredentials('uptimeApi');
		const summaryUrl = credentials.summaryUrl as string;

		let data: IDataObject[];
		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'uptimeApi',
				{
					method: 'GET',
					url: summaryUrl,
					json: true,
				},
			);
			data = response as IDataObject[];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Failed to fetch status: ${error}`);
		}

		const previousStatuses = (this.getWorkflowStaticData('node').statuses as Record<string, string>) ?? {};
		const currentStatuses: Record<string, string> = {};

		for (const monitor of data) {
			currentStatuses[monitor.slug as string] = monitor.status as string;
		}

		// Save current state for next poll
		this.getWorkflowStaticData('node').statuses = currentStatuses;

		// On first run, just save state without triggering
		if (Object.keys(previousStatuses).length === 0) {
			return null;
		}

		const changedMonitors: IDataObject[] = [];

		for (const monitor of data) {
			const slug = monitor.slug as string;
			const currentStatus = monitor.status as string;
			const previousStatus = previousStatuses[slug];

			// Skip if no change or monitor is new
			if (!previousStatus || previousStatus === currentStatus) {
				continue;
			}

			const changeType = currentStatus === 'up' ? 'up' : 'down';

			if (event === 'any' || event === changeType) {
				changedMonitors.push({
					...monitor,
					previousStatus,
					changeType,
				});
			}
		}

		if (changedMonitors.length === 0) {
			return null;
		}

		return [changedMonitors.map((monitor) => ({ json: monitor }))];
	}
}
