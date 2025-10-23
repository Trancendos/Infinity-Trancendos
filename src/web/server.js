/**
 * @fileoverview This script sets up a simple Express server to serve static
 * files and provide an API endpoint for running a shell script.
 * @module src/web/server
 */

import express from 'express';
import path from 'node:path';
import { exec } from 'node:child_process';

/**
 * The Express application instance.
 * @type {import('express').Express}
 */
const app = express();

/**
 * Serves static files from the 'public' directory.
 * @name static
 * @function
 * @memberof module:express
 */
app.use(express.static(path.join(process.cwd(), 'public')));

/**
 * API endpoint to trigger the installation script.
 * When a POST request is made to /api/install, it executes the
 * `unified-install.sh` script.
 * @name /api/install
 * @function
 * @param {import('express').Request} _ - The Express request object (unused).
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
app.post('/api/install', (_,res)=>
  exec('bash ./bootstrap/unified-install.sh', (e,out,err)=>
    e ? res.status(500).send(err) : res.type('text').send(out)
  ));

/**
 * Starts the Express server.
 * It listens on the port specified by the PORT environment variable,
 * or 3000 if not specified.
 * @function
 * @param {number} port - The port to listen on.
 * @param {Function} callback - The function to call once the server is listening.
 */
app.listen(process.env.PORT||3000, ()=>console.log('UI live'));
