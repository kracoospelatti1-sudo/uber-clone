import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';

const server = new Server(
  { name: 'render-mcp', version: '1.0.0' },
  { capabilities: { tools: true } }
);

const tools = [
  {
    name: 'render_deploy',
    description: 'Trigger deployment on OnRender',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: { type: 'string' },
        dryRun: { type: 'boolean', default: false }
      }
    }
  },
  {
    name: 'render_logs',
    description: 'Get deployment logs from OnRender',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: { type: 'string' }
      }
    }
  },
  {
    name: 'render_services',
    description: 'List all OnRender services',
    inputSchema: { type: 'object', properties: {} }
  }
];

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const apiKey = process.env.RENDER_API_KEY;

  try {
    if (name === 'render_deploy') {
      if (!apiKey) throw new Error('RENDER_API_KEY not set');
      const result = execSync(
        `curl -s -X POST "https://api.render.com/v1/services/${args.serviceId}/deploys" -H "Authorization: Bearer ${apiKey}" -H "Content-Type: application/json"`,
        { encoding: 'utf-8' }
      );
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'render_logs') {
      if (!apiKey) throw new Error('RENDER_API_KEY not set');
      const result = execSync(
        `curl -s "https://api.render.com/v1/services/${args.serviceId}/logs" -H "Authorization: Bearer ${apiKey}"`,
        { encoding: 'utf-8' }
      );
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'render_services') {
      if (!apiKey) throw new Error('RENDER_API_KEY not set');
      const result = execSync(
        `curl -s "https://api.render.com/v1/services" -H "Authorization: Bearer ${apiKey}"`,
        { encoding: 'utf-8' }
      );
      return { content: [{ type: 'text', text: result }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
