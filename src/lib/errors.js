export class ImportTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImportTooLargeError';
  }
}
export class DatabaseError extends Error {
  constructor(message, { statusCode, databaseResponse }) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.databaseResponse = databaseResponse;
  }
}
export class LoginError extends Error {
  constructor(message) {
    super(message);
  }
}
