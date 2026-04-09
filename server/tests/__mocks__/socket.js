/**
 * Mock for socket/socket.js
 *
 * All socket operations are no-ops during tests.
 * Jest's moduleNameMapper replaces the real socket module with this file
 * for every test file, so controllers that call io.to(...).emit(...) or
 * getReceiverSocketId() won't throw or try to bind a port.
 */

import express from "express";

const app = express();

const io = {
  to: () => ({ emit: () => {} }),
  emit: () => {},
  on: () => {},
};

const server = {
  listen: () => {},
  close: () => {},
};

const getReceiverSocketId = () => null;

export { app, io, server, getReceiverSocketId };
