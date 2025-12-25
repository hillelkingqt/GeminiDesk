// Global Constants Module

const { app } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';
const execPath = process.execPath;
const launcherPath = isMac ? path.resolve(execPath, '..', '..', '..') : execPath;

const margin = 20;
const originalSize = { width: 500, height: 650 };
const canvasSize = { width: 1400, height: 800 };

const REAL_CHROME_UA = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`;
const STABLE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const SESSION_PARTITION = 'persist:gemini-session';
const GEMINI_URL = 'https://gemini.google.com/app';
const AISTUDIO_URL = 'https://aistudio.google.com/prompts/new_chat';

module.exports = {
  isMac,
  execPath,
  launcherPath,
  margin,
  originalSize,
  canvasSize,
  REAL_CHROME_UA,
  STABLE_USER_AGENT,
  SESSION_PARTITION,
  GEMINI_URL,
  AISTUDIO_URL
};
