/**
 * Represents a client request that failed runtime validation.
 */
export class RequestValidationError extends Error {
  readonly status: number

  constructor(message: string, status = 422) {
    super(message)

    this.name = "RequestValidationError"
    this.status = status
  }
}
