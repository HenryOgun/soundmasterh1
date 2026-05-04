import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const writeToken = import.meta.env.VITE_SANITY_WRITE_TOKEN;

export const client = projectId
  ? createClient({
      projectId,
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  : null;

export const writeClient = projectId && writeToken
  ? createClient({
      projectId,
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token: writeToken,
    })
  : null;
