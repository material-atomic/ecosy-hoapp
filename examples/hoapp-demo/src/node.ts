import { serve } from '@hono/node-server'
import app from './index'

const port = 8788;

console.log(`\n🚀 [Node] Emulating Hono server on port ${port}...`);

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✨ Server ready at http://localhost:${info.port}`);
});
