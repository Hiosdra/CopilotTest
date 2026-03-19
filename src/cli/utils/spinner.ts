class Spinner {
  private message: string = "";
  private isSpinning: boolean = false;

  start(message: string) {
    this.message = message;
    this.isSpinning = true;
    process.stdout.write(`⏳ ${message}...`);
  }

  succeed(message?: string) {
    if (this.isSpinning) {
      process.stdout.write("\r");
      process.stdout.clearLine(0);
      console.log(`✓ ${message || this.message}`);
      this.isSpinning = false;
    }
  }

  fail(message?: string) {
    if (this.isSpinning) {
      process.stdout.write("\r");
      process.stdout.clearLine(0);
      console.log(`✗ ${message || this.message}`);
      this.isSpinning = false;
    }
  }

  stop() {
    if (this.isSpinning) {
      process.stdout.write("\r");
      process.stdout.clearLine(0);
      this.isSpinning = false;
    }
  }
}

export const spinner = new Spinner();
