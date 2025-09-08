const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4011;
const CACHEFLOW_URL = process.env.CACHEFLOW_URL || 'http://localhost:8000';

// Enable CORS
app.use(cors());

// Create proxy server
const proxy = httpProxy.createProxyServer({
    target: CACHEFLOW_URL,
    changeOrigin: true,
    ws: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
        error: 'Proxy Error',
        message: 'Failed to connect to cacheflow backend',
        details: err.message
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cacheflow_url: CACHEFLOW_URL
    });
});

// Proxy all requests to cacheflow
app.all('*', (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    proxy.web(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production Proxy Server running on port ${PORT}`);
    console.log(`📡 Forwarding requests to: ${CACHEFLOW_URL}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down proxy server...');
    proxy.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down proxy server...');
    proxy.close();
    process.exit(0);
});