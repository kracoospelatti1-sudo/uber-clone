import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';

const server = new Server(
  { name: 'github-mcp', version: '1.0.0' },
  { capabilities: { tools: true } }
);

const tools = [
  {
    name: 'github_repo_create',
    description: 'Create a new GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        private: { type: 'boolean', default: true }
      },
      required: ['name']
    }
  },
  {
    name: 'github_push',
    description: 'Push code to GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        branch: { type: 'string', default: 'main' },
        message: { type: 'string' }
      }
    }
  },
  {
    name: 'github_status',
    description: 'Check git status',
    inputSchema: { type: 'object', properties: {} }
  }
];

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'github_repo_create') {
      const result = execSync(
        `gh repo create ${args.name} ${args.description ? `--description "${args.description}"` : ''} ${args.private !== false ? '--private' : '--public'} --source . --push`,
        { encoding: 'utf-8' }
      );
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'github_push') {
      const message = args.message || 'Update';
      execSync(`git add . && git commit -m "${message}"`, { encoding: 'utf-8' });
      execSync(`git push origin ${args.branch || 'main'}`, { encoding: 'utf-8' });
      return { content: [{ type: 'text', text: 'Pushed successfully' }] };
    }

    if (name === 'github_status') {
      const result = execSync('git status', { encoding: 'utf-8' });
      return { content: [{ type: 'text', text: result }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
