import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Validation Middleware
 * Uses express-validator to validate and sanitize input
 * Protection against injection attacks and bad data
 */

/**
 * Validate request based on validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    // Throw validation error
    next(new ValidationError('Validation failed', formattedErrors));
  };
};

/**
 * Common validation rules
 */
export { body, param, query, header } from 'express-validator';
