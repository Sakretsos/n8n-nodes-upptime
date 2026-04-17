# n8n-nodes-upptime

This is an n8n community node that lets you fetch monitoring data from any [Upptime](https://upptime.js.org/) status page.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

### Docker

```bash
docker exec -it n8n-n8n-1 sh -c "mkdir -p /home/node/.n8n/custom/node_modules/n8n-nodes-upptime"
docker cp n8n-nodes-upptime-0.1.0.tgz n8n-n8n-1:/tmp/
docker exec -it n8n-n8n-1 sh -c "cd /tmp && tar xzf n8n-nodes-upptime-0.1.0.tgz && cp -r package/* /home/node/.n8n/custom/node_modules/n8n-nodes-upptime/"
docker restart n8n-n8n-1
```

### Manual

1. Go to **Settings > Community Nodes** in your n8n instance
2. Install the package `n8n-nodes-upptime`

Or manually copy the package contents to:

```
~/.n8n/custom/node_modules/n8n-nodes-upptime/
```

Then restart n8n.

## Credentials

Before using the node, you need to create **Upptime API** credentials:

1. In n8n, go to **Credentials > Add Credential**
2. Search for **Upptime API**
3. Paste your Upptime `summary.json` raw GitHub URL, for example:
   ```
   https://raw.githubusercontent.com/your-user/your-repo/master/history/summary.json
   ```
4. Save the credential

## Operations

| Operation | Description |
|---|---|
| **Get All Monitors** | Returns all monitored services with their status and uptime data |
| **Get Monitor by Name** | Fetch a specific monitor by name (case-insensitive) |
| **Get Down Services** | Returns only services that are currently down |

## Output Fields

Each monitor returns the following data:

| Field | Description |
|---|---|
| `name` | Monitor display name |
| `slug` | URL-friendly identifier |
| `status` | Current status (`up` or `down`) |
| `uptime` | Overall uptime percentage |
| `uptimeDay` | Uptime percentage for the last 24 hours |
| `uptimeWeek` | Uptime percentage for the last 7 days |
| `uptimeMonth` | Uptime percentage for the last 30 days |
| `uptimeYear` | Uptime percentage for the last year |
| `time` | Overall average response time (ms) |
| `timeDay` | Average response time last 24 hours (ms) |
| `timeWeek` | Average response time last 7 days (ms) |
| `timeMonth` | Average response time last 30 days (ms) |
| `timeYear` | Average response time last year (ms) |
| `dailyMinutesDown` | Object with dates as keys and minutes of downtime as values |

## Additional Options

- **Include Downtime History** - Toggle whether to include the `dailyMinutesDown` field in the output (enabled by default)

## Building from Source

```bash
npm install --ignore-scripts
npm run build
npm pack
```

## License

MIT
