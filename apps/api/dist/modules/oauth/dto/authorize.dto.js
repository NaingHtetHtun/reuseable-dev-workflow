'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthorizeDto = void 0;
const class_validator_1 = require('class-validator');
class AuthorizeDto {
  projectId;
  scopes;
  redirectUri;
  returnUrl;
  credentialId;
}
exports.AuthorizeDto = AuthorizeDto;
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata('design:type', String),
  ],
  AuthorizeDto.prototype,
  'projectId',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  AuthorizeDto.prototype,
  'scopes',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  AuthorizeDto.prototype,
  'redirectUri',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  AuthorizeDto.prototype,
  'returnUrl',
  void 0,
);
__decorate(
  [
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  AuthorizeDto.prototype,
  'credentialId',
  void 0,
);
//# sourceMappingURL=authorize.dto.js.map
