import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import your app from server.js without executing the server startup code
// In serverless environment, Vercel will handle the port assignment automatically
// The app variable is already configured with routes and middleware
import { app } from '../server.js';

// Export the Express API for Vercel serverless functions
export default app; 