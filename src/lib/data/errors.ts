export class DataAccessError extends Error {
  constructor(resource: string, cause?: unknown) {
    super(`No se pudieron cargar ${resource}.`);
    this.name = "DataAccessError";
    this.cause = cause;
  }
}
