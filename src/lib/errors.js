export class ImportTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImportTooLargeError';
  }
}
