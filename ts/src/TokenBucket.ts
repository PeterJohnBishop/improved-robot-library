export class TokenBucket {
  private readonly capacity: number;
  private readonly refillRatePerMs: number;
  
  private tokens: number;
  private lastRefillTimestamp: number;

  /**
   * @param capacity max tokens the bucket can hold
   * @param refillRatePerSecond How many tokens are added to the bucket every second
   */
  constructor(capacity: number, refillRatePerSecond: number) {
    if (capacity <= 0) throw new Error("Constraint Violation: Capacity must be > 0");
    if (refillRatePerSecond <= 0) throw new Error("Constraint Violation: Refill rate must be > 0");

    this.capacity = capacity;
    this.refillRatePerMs = refillRatePerSecond / 1000;
    
    // Start with a full bucket
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  /**
   * Refills the bucket based on the time elapsed since the last refill.
   */
  private refill(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTimestamp;

    if (elapsedTime > 0) {
      const tokensToAdd = elapsedTime * this.refillRatePerMs;
      
      // Add tokens, but strictly cap it at the maximum capacity
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }

  /**
   * Attempts to consume tokens for a request.
   * @param cost How many tokens this request requires (defaults to 1).
   * @returns true if the request is allowed, false if rate limited.
   */
  public consume(cost: number = 1): boolean {
    if (cost <= 0) throw new Error("Constraint Violation: Cost must be > 0");
    if (cost > this.capacity) throw new Error("Constraint Violation: Cost cannot exceed bucket capacity");

    this.refill();

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true; // Request allowed
    }

    return false; // Request denied (Rate Limited)
  }
}
