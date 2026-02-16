// Deprecated: this file previously used @wix/sdk.
// The server now uses direct REST calls to https://www.wixapis.com in index.js.
export function getWixClient() {
  throw new Error('getWixClient is removed. Use REST endpoints implemented in server/index.js');
}
