import { type Env, handleRequest } from './handle-request';

// Cloudflare Worker entry point (the framework requires a default export).
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
