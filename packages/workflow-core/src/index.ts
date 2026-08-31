// Types
export type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ExecutionContext,
  NodeExecutionResult,
  WorkflowTrigger,
  TriggerContext,
} from './types';

// Logger
export type { Logger } from './logger.interface';
export { noopLogger } from './logger.interface';

// Validator
export { validateWorkflowDefinition } from './validator';
export type { ValidationResult } from './validator';

// Executor
export { WorkflowExecutor } from './executor';
export type { ExecutionResult, CredentialResolver } from './executor';

// Node System
export type {
  NodeTypeDefinition,
  ParameterSchema,
  ParameterDefinition,
  IoSchema,
  CredentialRequirement,
  NodeExecutionContext,
  NodeHandler,
  ValidationResult as NodeParameterValidationResult,
} from './node-system/interfaces';

export { NodeRegistry } from './node-system/registry';
export { validateNode, validateAllNodes } from './node-system/validator';

// Built-in Nodes
export {
  logDefinition,
  LogNodeHandler,
  setVariableDefinition,
  SetVariableNodeHandler,
  noOpDefinition,
  NoOpNodeHandler,
  httpRequestDefinition,
  HttpRequestNodeHandler,
  delayDefinition,
  DelayNodeHandler,
} from './node-system/builtin';

// Credential System
export { EncryptionService } from './credential-system/encryption';
export type {
  CredentialField,
  CredentialTypeDefinition,
  CredentialValidationResult,
} from './credential-system/credential-types';
export {
  validateCredentialData,
  apiKeyCredentialType,
  bearerTokenCredentialType,
  basicAuthCredentialType,
  googleOAuth2CredentialType,
  githubTokenCredentialType,
  smtpCredentialType,
  builtInCredentialTypes,
} from './credential-system/credential-types';
export { IntegrationRegistry } from './credential-system/integration-registry';

// OAuth System
export type {
  OAuthProviderMetadata,
  OAuthFlow,
  PkceChallengeMethod,
  OAuthAuthorizationParams,
  OAuthAuthorizationUrl,
  OAuthTokenExchangeParams,
  OAuthTokenResult,
  OAuthRefreshParams,
  OAuthProvider,
} from './oauth-system/oauth-provider.interface';
export { OAuthError } from './oauth-system/oauth-provider.interface';
export { PkceHelper } from './oauth-system/pkce-helper';
export type { PkceChallenge } from './oauth-system/pkce-helper';
export { OAuthProviderRegistry } from './oauth-system/oauth-provider-registry';
export { OAuthStateManager } from './oauth-system/oauth-state';
export type { OAuthStateData } from './oauth-system/oauth-state';
export { OAuthTokenManager } from './oauth-system/token-manager';
export { GoogleOAuthProvider } from './oauth-system/providers/google-oauth.provider';

// Trigger System
export type {
  TriggerTypeDefinition,
  TriggerConfigSchema,
  TriggerConfigProperty,
  IoSchema as TriggerIoSchema,
  TriggerHandler,
  ValidationResult as TriggerValidationResult,
  TriggerEndpointInfo,
  TriggerActivationResult,
  TriggerContext as TriggerSystemContext,
  WorkflowTrigger as WorkflowTriggerConfig,
} from './trigger-system/trigger-type.interface';
export { TriggerTypeRegistry } from './trigger-system/trigger-type-registry';
export { TriggerExecutor } from './trigger-system/trigger-executor';
export type { TriggerInputMapping } from './trigger-system/trigger-executor';

// Built-in Triggers
export {
  manualTriggerDefinition,
  ManualTriggerHandler,
  webhookTriggerDefinition,
  WebhookTriggerHandler,
  scheduledTriggerDefinition,
  ScheduledTriggerHandler,
} from './trigger-system/triggers';

// Preview System
export type {
  PreviewMode,
  WorkflowPreviewRequest,
  PreviewOptions,
  WorkflowPreviewResult,
  PreviewNodeResult,
} from './preview-system/preview-types';
export { PreviewExecutor } from './preview-system/preview-executor';
export { createPreviewRegistry } from './preview-system/node-mock-registry';

// Component System
export type {
  ComponentStatus,
  ComponentDefinition,
  ComponentConfigSchema,
  ComponentConfigProperty,
  ComponentCredentialSchema,
  ComponentIoSchema,
  ComponentImplementation,
  ComponentMetadata,
  ComponentVersion,
  CreateComponentInput,
  UpdateComponentInput,
  ComponentQuery,
  ComponentListResult,
  ValidationResult as ComponentValidationResult,
} from './component-system/component-types';
export { ComponentRegistry } from './component-system/component-registry';
export { ComponentValidator } from './component-system/component-validator';
