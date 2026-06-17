import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocket } from './socket';
import { supabase } from './lib/supabase';
import logger from './lib/logger';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

async function bootstrap() {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    logger.info('Supabase connected');

    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Startup failed', err);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', async () => {
  server.close();
  process.exit(0);
});
