import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Monaco AI Autocomplete',
    description: 'AI-powered autocompletion for Monaco editors on any webpage',
    version: '0.1.0',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        resources: ['injected.js'],
        matches: ['<all_urls>']
      }
    ]
  },
  modules: ['@wxt-dev/module-react']
});
