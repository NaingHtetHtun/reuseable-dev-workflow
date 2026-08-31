/**
 * Trigger Executor
 *
 * Integrates triggers with workflow execution.
 * Maps trigger payloads to workflow input.
 */

import { WorkflowExecutor, ExecutionResult } from '../executor';
import { WorkflowDefinition } from '../types';
import { TriggerTypeRegistry } from './trigger-type-registry';
import { TriggerContext } from './trigger-type.interface';

/**
 * Input mapping configuration
 */
export interface TriggerInputMapping {
  /** Source path in trigger payload (dot notation) */
  source: string;
  /** Target field name in workflow input */
  target: string;
}

/**
 * Trigger Executor
 *
 * Executes workflows via triggers, mapping trigger payloads to workflow input.
 */
export class TriggerExecutor {
  constructor(
    private readonly triggerRegistry: TriggerTypeRegistry,
    private readonly workflowExecutor: WorkflowExecutor,
  ) {}

  /**
   * Execute a workflow via a trigger.
   */
  async executeViaTrigger(
    triggerContext: TriggerContext,
    workflowDefinition: WorkflowDefinition,
    inputMapping?: TriggerInputMapping[],
  ): Promise<ExecutionResult> {
    // Map trigger payload to workflow input
    const input = this.mapTriggerInput(triggerContext, inputMapping);

    // Execute workflow
    return this.workflowExecutor.execute(
      triggerContext.workflowId,
      triggerContext.eventId,
      workflowDefinition,
      input,
    );
  }

  /**
   * Map trigger payload to workflow input.
   */
  private mapTriggerInput(context: TriggerContext, mapping?: TriggerInputMapping[]): unknown {
    if (mapping && mapping.length > 0) {
      // Apply mapping rules
      return this.applyMapping(context.payload, mapping);
    }

    // Default: wrap trigger payload with metadata
    return {
      trigger: {
        type: context.triggerType,
        payload: context.payload,
        firedAt: context.firedAt.toISOString(),
        eventId: context.eventId,
      },
    };
  }

  /**
   * Apply mapping rules to transform trigger payload.
   */
  private applyMapping(payload: unknown, mapping: TriggerInputMapping[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const sourceObj = (payload as Record<string, unknown>) || {};

    for (const map of mapping) {
      const value = this.getNestedValue(sourceObj, map.source);
      if (value !== undefined) {
        result[map.target] = value;
      }
    }

    return result;
  }

  /**
   * Get nested value using dot notation.
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * Create a TriggerContext from incoming data.
   */
  static createTriggerContext(
    workflowId: string,
    triggerType: string,
    triggerConfig: Record<string, unknown>,
    payload: unknown,
    endpoint?: { url: string; method?: string; headers?: Record<string, string>; secret?: string },
  ): TriggerContext {
    return {
      workflowId,
      triggerType,
      triggerConfig,
      payload,
      firedAt: new Date(),
      eventId: crypto.randomUUID(),
      endpoint,
    };
  }
}
