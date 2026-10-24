import express, { Application, Request, Response, NextFunction } from 'express';
import { TokenBucket } from './TokenBucket';

export class WebServer {
  private readonly app: Application;
  private readonly port: number;
  private rateLimiters = new Map<string, TokenBucket>();

  constructor(port: number) {
    if (port <= 0 || port > 65535) {
      throw new Error("Constraint Violation: Invalid port number.");
    }
    
    this.port = port;
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
  }

  // Express middleware for rate limiting.
  private rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Fallback to a generic identifier if IP is missing
    const identifier = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

    if (!this.rateLimiters.has(identifier)) {
      this.rateLimiters.set(identifier, new TokenBucket(5, 1));
    }

    const userBucket = this.rateLimiters.get(identifier)!;

    if (userBucket.consume(1)) {
      // Token consumed successfully, proceed to the next middleware or route
      next();
    } else {
      // Bucket empty, reject the request immediately
      res.status(429).json({ 
        error: "Too Many Requests", 
        message: "You have exceeded your rate limit. Please try again later." 
      });
    }
  };

  private configureMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Register the rate limiter globally for all routes
    this.app.use(this.rateLimitMiddleware);
  }

  private configureRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Route not found" });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running and listening on http://localhost:${this.port}`);
    });
  }
}
