// The router lives in its own module so src/App.tsx (render) and
// src/server-config.ts (single-flight collector) share one instance.
import { pageRoutes } from 'virtual:file-routes';
import { createRouter, intentPreload } from '@solidjs/router';
import { fileRoutes } from '@solidjs/router/fs';
import Home from './routes';
import z from 'zod';
import NotFound from './routes/[...404]';

// Link preloading is opt-in. intentPreload() is the hover/focus/touch
// strategy: resting on a link warms its code and runs its preload, which is
// what makes navigation feel instant once the data lives on the server.
export const Router = createRouter({
  routes: [{
    path: "/",
    component: Home,
    search: z.object({
      dialog: z.enum(["signup", "signin"]).optional().catch(undefined)
    }).optional()
  }, {
    path: "*404",
    component: NotFound
  }],
});

export const { paths } = Router;
