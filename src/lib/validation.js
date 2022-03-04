import { body } from 'express-validator';
import xss from 'xss';

// Endurnýtum mjög líka validation

export function registrationValidationMiddleware(textField) {
  return [
    body('name')
      .isLength({ max: 64 })
      .withMessage('Nafn má að hámarki vera 64 stafir'),
    body(textField)
      .isLength({ max: 400 })
      .withMessage(
        `${
          textField === 'comment' ? 'Athugasemd' : 'Lýsing'
        } má að hámarki vera 400 stafir`
      ),
  ];
}

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(textField) {
  return [body(textField).customSanitizer((v) => xss(v))];
}

export function sanitizationMiddleware(textField) {
  return [body(textField).trim().escape()];
}
