export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',

  async main() {
    console.log('Monaco AI Autocomplete content script loaded');

    // Inject the script that will interact with Monaco
    await injectScript('/injected.js');

    // Bridge messages between page and background
    window.addEventListener('message', async (event) => {
      // Only accept messages from the same window
      if (event.source !== window) return;

      if (event.data?.type === 'COMPLETION_REQUEST') {
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'COMPLETION_REQUEST',
            payload: event.data.payload
          });

          window.postMessage({
            type: 'COMPLETION_RESPONSE',
            requestId: event.data.requestId,
            payload: response.success ? response.data : null,
            error: response.success ? null : response.error
          }, '*');
        } catch (error: any) {
          console.error('Failed to forward completion request:', error);
          window.postMessage({
            type: 'COMPLETION_RESPONSE',
            requestId: event.data.requestId,
            payload: null,
            error: error.message
          }, '*');
        }
      }
    });

    console.log('Monaco AI Autocomplete content script ready');
  }
});

// Helper to inject script into page context
async function injectScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(scriptPath);
    script.onload = () => {
      script.remove();
      resolve();
    };
    script.onerror = reject;
    (document.head || document.documentElement).appendChild(script);
  });
}
