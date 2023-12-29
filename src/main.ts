import App from './App.svelte'
import './app.css';
import { inject } from '@vercel/analytics';

inject({ mode: import.meta.env.MODE })

const app = new App({ target: document.body })

export default app
