import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

/** Runs after express-validator chains; throws a 400 ApiError with the first failing field per message. */
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => e.msg);
  next(new ApiError(400, "Validation failed", errors));
};
