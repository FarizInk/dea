import type { AuthModel } from 'pocketbase';
import { writable } from 'svelte/store';

export const user = writable(null);
export const payload = writable(null);
export const guilds = writable([]);
export const clasement = writable([]);