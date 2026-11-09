export class SyncClock {
  private epoch: number | null = null;
  private anchor = 0;
  constructor(
    private monotonic = () => performance.now(),
    private deviceNow = () => Date.now(),
  ) {}
  synchronize(serverTime: number, roundTripMs = 0) {
    if (!Number.isFinite(serverTime) || serverTime <= 0)
      throw new Error("Invalid server time");
    this.epoch = serverTime + Math.max(0, roundTripMs) / 2;
    this.anchor = this.monotonic();
  }
  now() {
    return this.epoch === null
      ? this.deviceNow()
      : Math.floor(this.epoch + Math.max(0, this.monotonic() - this.anchor));
  }
}
export function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
