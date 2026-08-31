import { scheduledTriggerDefinition, ScheduledTriggerHandler } from './scheduled.trigger';

describe('ScheduledTriggerHandler', () => {
  let handler: ScheduledTriggerHandler;

  beforeEach(() => {
    handler = new ScheduledTriggerHandler();
  });

  describe('definition', () => {
    it('should have correct type', () => {
      expect(scheduledTriggerDefinition.type).toBe('scheduled');
    });

    it('should have correct category', () => {
      expect(scheduledTriggerDefinition.category).toBe('schedule');
    });

    it('should not have endpoint', () => {
      expect(scheduledTriggerDefinition.hasEndpoint).toBe(false);
    });

    it('should only support active status', () => {
      expect(scheduledTriggerDefinition.supportedStatuses).toEqual(['active']);
    });

    it('should require cron field', () => {
      expect(scheduledTriggerDefinition.configSchema.required).toContain('cron');
    });
  });

  describe('type', () => {
    it('should have type "scheduled"', () => {
      expect(handler.type).toBe('scheduled');
    });
  });

  describe('validateConfig', () => {
    it('should return valid for valid cron expression', () => {
      const result = handler.validateConfig({ cron: '0 9 * * 1-5' });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing cron expression', () => {
      const result = handler.validateConfig({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cron expression is required');
    });

    it('should reject non-string cron expression', () => {
      const result = handler.validateConfig({ cron: 123 });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cron expression is required');
    });

    it('should reject invalid cron field count', () => {
      const result = handler.validateConfig({ cron: '* *' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cron expression must have 5 fields (found 2)');
    });

    it('should reject invalid minute field', () => {
      const result = handler.validateConfig({ cron: '60 * * * *' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('minute'))).toBe(true);
    });

    it('should reject invalid hour field', () => {
      const result = handler.validateConfig({ cron: '* 25 * * *' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('hour'))).toBe(true);
    });

    it('should accept wildcard cron', () => {
      const result = handler.validateConfig({ cron: '* * * * *' });

      expect(result.valid).toBe(true);
    });

    it('should accept cron with step', () => {
      const result = handler.validateConfig({ cron: '*/5 * * * *' });

      expect(result.valid).toBe(true);
    });

    it('should accept cron with range', () => {
      const result = handler.validateConfig({ cron: '0 9-17 * * *' });

      expect(result.valid).toBe(true);
    });

    it('should accept cron with comma-separated values', () => {
      const result = handler.validateConfig({ cron: '0 9,12,18 * * *' });

      expect(result.valid).toBe(true);
    });

    it('should accept valid timezone', () => {
      const result = handler.validateConfig({
        cron: '0 9 * * *',
        timezone: 'America/New_York',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject non-string timezone', () => {
      const result = handler.validateConfig({
        cron: '0 9 * * *',
        timezone: 123,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timezone must be a string');
    });
  });

  describe('activate', () => {
    it('should store schedule configuration', async () => {
      const result = await handler.activate('workflow-1', {
        cron: '0 9 * * 1-5',
        timezone: 'UTC',
      });

      expect(result.success).toBe(true);

      const schedule = handler.getSchedule('workflow-1');
      expect(schedule).toBeDefined();
      expect(schedule!.cron).toBe('0 9 * * 1-5');
      expect(schedule!.timezone).toBe('UTC');
      expect(schedule!.enabled).toBe(true);
    });

    it('should use default timezone', async () => {
      await handler.activate('workflow-1', { cron: '0 9 * * *' });

      const schedule = handler.getSchedule('workflow-1');
      expect(schedule!.timezone).toBe('UTC');
    });
  });

  describe('deactivate', () => {
    it('should remove schedule configuration', async () => {
      await handler.activate('workflow-1', { cron: '0 9 * * *' });
      expect(await handler.isActive('workflow-1')).toBe(true);

      await handler.deactivate('workflow-1');
      expect(await handler.isActive('workflow-1')).toBe(false);
    });

    it('should not error when deactivating non-existent schedule', async () => {
      await expect(handler.deactivate('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('isActive', () => {
    it('should return false when not activated', async () => {
      const active = await handler.isActive('workflow-1');

      expect(active).toBe(false);
    });

    it('should return true after activation', async () => {
      await handler.activate('workflow-1', { cron: '0 9 * * *' });

      const active = await handler.isActive('workflow-1');

      expect(active).toBe(true);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule for active workflow', async () => {
      await handler.activate('workflow-1', {
        cron: '0 9 * * 1-5',
        timezone: 'America/New_York',
      });

      const schedule = handler.getSchedule('workflow-1');

      expect(schedule).toBeDefined();
      expect(schedule!.workflowId).toBe('workflow-1');
      expect(schedule!.cron).toBe('0 9 * * 1-5');
    });

    it('should return undefined for inactive workflow', () => {
      const schedule = handler.getSchedule('nonexistent');

      expect(schedule).toBeUndefined();
    });
  });

  describe('getActiveSchedules', () => {
    it('should return all active schedules', async () => {
      await handler.activate('workflow-1', { cron: '0 9 * * *' });
      await handler.activate('workflow-2', { cron: '0 10 * * *' });

      const schedules = handler.getActiveSchedules();

      expect(schedules).toHaveLength(2);
    });

    it('should not include deactivated schedules', async () => {
      await handler.activate('workflow-1', { cron: '0 9 * * *' });
      await handler.activate('workflow-2', { cron: '0 10 * * *' });
      await handler.deactivate('workflow-2');

      const schedules = handler.getActiveSchedules();

      expect(schedules).toHaveLength(1);
      expect(schedules[0].workflowId).toBe('workflow-1');
    });
  });

  describe('getDueWorkflows', () => {
    it('should return workflows due at specific time', async () => {
      // 9:00 AM on a weekday
      const date = new Date('2024-01-15T09:00:00Z'); // Monday
      await handler.activate('workflow-1', { cron: '0 9 * * 1-5' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toContain('workflow-1');
    });

    it('should not return workflows not due', async () => {
      // 10:00 AM on a weekday
      const date = new Date('2024-01-15T10:00:00Z'); // Monday
      await handler.activate('workflow-1', { cron: '0 9 * * 1-5' });

      const due = await handler.getDueWorkflows(date);

      expect(due).not.toContain('workflow-1');
    });

    it('should not return inactive schedules', async () => {
      const date = new Date('2024-01-15T09:00:00Z'); // Monday
      await handler.activate('workflow-1', { cron: '0 9 * * 1-5' });
      await handler.deactivate('workflow-1');

      const due = await handler.getDueWorkflows(date);

      expect(due).not.toContain('workflow-1');
    });

    it('should handle wildcard cron (every minute)', async () => {
      const date = new Date('2024-01-15T14:30:00Z');
      await handler.activate('workflow-1', { cron: '* * * * *' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toContain('workflow-1');
    });

    it('should handle step cron (every 5 minutes)', async () => {
      const date = new Date('2024-01-15T14:30:00Z');
      await handler.activate('workflow-1', { cron: '*/5 * * * *' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toContain('workflow-1');
    });

    it('should handle range cron (9-17 hours)', async () => {
      const date = new Date('2024-01-15T14:00:00Z');
      await handler.activate('workflow-1', { cron: '0 9-17 * * *' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toContain('workflow-1');
    });

    it('should handle comma-separated cron (9,12,18 hours)', async () => {
      const date = new Date('2024-01-15T12:00:00Z');
      await handler.activate('workflow-1', { cron: '0 9,12,18 * * *' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toContain('workflow-1');
    });

    it('should return multiple due workflows', async () => {
      const date = new Date('2024-01-15T09:00:00Z');
      await handler.activate('workflow-1', { cron: '0 9 * * *' });
      await handler.activate('workflow-2', { cron: '0 9 * * *' });

      const due = await handler.getDueWorkflows(date);

      expect(due).toHaveLength(2);
    });
  });
});
