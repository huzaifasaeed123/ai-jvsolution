import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

/**
 * Global exception filter.
 *
 * Two jobs. First, translate Prisma's error codes into the HTTP status the
 * client actually needs: a duplicate key is a 409, not a 500, and a caller
 * cannot act sensibly on "Internal server error". Second, make sure nothing
 * unexpected leaks — a raw Prisma message names tables, columns and
 * constraints, which is a free schema map for anyone probing the API.
 *
 * Everything unrecognised becomes a generic 500 to the client and a full stack
 * trace in the server log, which is the only place it belongs.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { status, message, code } = this.translate(exception);

    // 5xx is a fault on our side and gets the stack; 4xx is the caller's and
    // would otherwise fill the log with routine validation noise.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${req.method} ${req.url} -> ${status}: ${message}`);
    }

    res.status(status).json({
      statusCode: status,
      message,
      ...(code ? { code } : {}),
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  private translate(exception: unknown): {
    status: number;
    message: string | string[];
    code?: string;
  } {
    // Anything the application raised deliberately already carries its status.
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ??
            exception.message);
      return { status: exception.getStatus(), message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          // Unique constraint. Name the field, not the constraint or table.
          const target = exception.meta?.target;
          const field = Array.isArray(target) ? target.join(', ') : 'value';
          return {
            status: HttpStatus.CONFLICT,
            message: `A record with this ${field} already exists`,
            code: exception.code,
          };
        }
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'The requested record does not exist',
            code: exception.code,
          };
        case 'P2003':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'A referenced record does not exist',
            code: exception.code,
          };
        case 'P2014':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'This change would break a required relation',
            code: exception.code,
          };
        default:
          // Deliberately not exception.message — it names schema internals.
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'The request could not be processed',
            code: exception.code,
          };
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid query for the current schema',
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      // The database is unreachable — a dependency failure, not the caller's.
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'The service is temporarily unavailable',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
