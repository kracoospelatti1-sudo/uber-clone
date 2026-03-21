import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import pg from 'pg';

const { Pool } = pg;

const server = new Server(
  { name: 'neon-mcp', version: '1.0.0' },
  { capabilities: { tools: true } }
);

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const tools = [
  {
    name: 'sql_execute',
    description: 'Execute SQL query on Neon database',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL query to execute' },
        params: { type: 'array', description: 'Query parameters' }
      },
      required: ['query']
    }
  },
  {
    name: 'schema_list',
    description: 'List all tables in the database schema',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'table_describe',
    description: 'Get table structure',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' }
      },
      required: ['table']
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'sql_execute') {
      const result = await pool.query(args.query, args.params || []);
      return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
    }

    if (name === 'schema_list') {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
    }

    if (name === 'table_describe') {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [args.table]);
      return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
