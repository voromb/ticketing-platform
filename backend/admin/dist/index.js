"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
// Iniciar el servidor
(0, server_1.startServer)().catch(error => {
    console.error('Error starting server:', error);
    process.exit(1);
});
