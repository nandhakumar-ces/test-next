import { adapter } from '@next/server/api-adapter';

import { middleware as nextMiddleware } from '../src/middleware';

export const handler = adapter.apiHandler(async (req, res) => {
  await nextMiddleware(req, res);
});
