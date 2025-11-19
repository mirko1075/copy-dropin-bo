import { Response } from 'express';

/**
 * Standardized API response format
 * Following DRY principle - reusable response handlers
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  timestamp: string;
}

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Operation failed',
    statusCode: number = 500,
    errors: any[] = []
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: any[],
    message: string = 'Validation failed'
  ): Response {
    return this.error(res, message, 400, errors);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    return this.error(res, message, 403);
  }
}
