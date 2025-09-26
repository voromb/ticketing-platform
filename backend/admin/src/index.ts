import { startServer } from './server';

// Iniciar el servidor
startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
