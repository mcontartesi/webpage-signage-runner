import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private logDir: string;
  private currentLogDate: string = '';
  private currentLogStream: fs.WriteStream | null = null;

  constructor() {
    // When running in tests or before app is ready, fallback to process.cwd() or temp
    try {
      this.logDir = path.join(app.getPath('userData'), 'logs');
    } catch {
      this.logDir = path.join(process.cwd(), '.logs');
    }
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('[Logger] Failed to create log directory:', err);
    }
  }

  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getLogStream(): fs.WriteStream {
    const today = this.getDateString();
    if (this.currentLogStream && this.currentLogDate === today) {
      return this.currentLogStream;
    }

    if (this.currentLogStream) {
      try {
        this.currentLogStream.end();
      } catch {}
    }

    this.ensureLogDir();
    this.currentLogDate = today;
    const logFilePath = path.join(this.logDir, `signage-${today}.log`);
    this.currentLogStream = fs.createWriteStream(logFilePath, { flags: 'a', encoding: 'utf8' });

    // Clean old logs asynchronously
    this.cleanOldLogs(7);

    return this.currentLogStream;
  }

  private cleanOldLogs(maxDays: number): void {
    try {
      if (!fs.existsSync(this.logDir)) return;
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAgeMs = maxDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('signage-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch {}
  }

  private log(level: LogLevel, tag: string, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? (typeof meta === 'object' ? ` ${JSON.stringify(meta)}` : ` ${meta}`) : '';
    const formattedConsole = `[${timestamp}] [${level.padEnd(5)}] [${tag}] ${message}${metaStr}`;
    const formattedFile = `[${timestamp}] [${level}] [${tag}] ${message}${metaStr}\n`;

    switch (level) {
      case 'DEBUG':
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
          console.debug('\x1b[90m%s\x1b[0m', formattedConsole);
        }
        break;
      case 'INFO':
        console.log('\x1b[36m%s\x1b[0m', formattedConsole);
        break;
      case 'WARN':
        console.warn('\x1b[33m%s\x1b[0m', formattedConsole);
        break;
      case 'ERROR':
        console.error('\x1b[31m%s\x1b[0m', formattedConsole);
        break;
    }

    try {
      const stream = this.getLogStream();
      stream.write(formattedFile);
    } catch (err) {
      console.error('[Logger] Failed to write to file stream:', err);
    }
  }

  public debug(tag: string, message: string, meta?: unknown): void {
    this.log('DEBUG', tag, message, meta);
  }

  public info(tag: string, message: string, meta?: unknown): void {
    this.log('INFO', tag, message, meta);
  }

  public warn(tag: string, message: string, meta?: unknown): void {
    this.log('WARN', tag, message, meta);
  }

  public error(tag: string, message: string, meta?: unknown): void {
    this.log('ERROR', tag, message, meta);
  }

  public getLogDir(): string {
    return this.logDir;
  }
}

export const logger = new Logger();
