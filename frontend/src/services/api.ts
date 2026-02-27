import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const scraperApi = {
  extract: (url: string) => api.post('/scraper/extract', { url }).then(r => r.data.data),
};

export const aiApi = {
  generate: (product: any) => api.post('/ai/generate', { product }).then(r => r.data.data),
};

export const pinDesignerApi = {
  design: (product: any, content: any, theme?: string) =>
    api.post('/pin-designer/design', { product, content, theme }).then(r => r.data.data),
};

export const pinterestApi = {
  getBoards: (accessToken = 'demo') =>
    api.post('/pinterest/boards', { accessToken }).then(r => r.data.data),
  schedule: (params: any) =>
    api.post('/pinterest/schedule', params).then(r => r.data.data),
  getPins: () => api.get('/pinterest/pins').then(r => r.data.data),
};

export const affiliateApi = {
  generateLink: (asin: string, tag: string) =>
    api.post('/affiliate/generate', { asin, tag }).then(r => r.data.data),
  getStats: () => api.get('/affiliate/stats').then(r => r.data.data),
  getLinks: () => api.get('/affiliate/links').then(r => r.data.data),
  recordClick: (linkId: string) => api.post('/affiliate/click', { linkId }),
};
