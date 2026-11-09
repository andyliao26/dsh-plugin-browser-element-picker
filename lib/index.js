/**
 * Loader entry for the sidebar-browser element picker.
 *
 * The feature is entirely browser-side: `package.json` declares `dsh.client`,
 * so the Loader row mounts `lib/client.js` in the Web GUI. Nothing model-facing
 * is registered on the Host.
 */
export function apply() {}
