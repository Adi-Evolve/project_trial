import { logAction, fetchLogs, _readLocal, _saveToLocal } from '../auditLogs';
import * as supabaseModule from '../supabase';

// Jest style tests should work with react-scripts test

describe('auditLogs', () => {
  beforeEach(() => {
    // clear localStorage
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('logAction writes to supabase when available', async () => {
  const insertFn = jest.fn().mockResolvedValue({ data: [{}], error: null });
  const mockFrom = jest.fn().mockReturnValue({ insert: insertFn });
  // Override exported supabase instance for test
  (supabaseModule as any).supabase = { from: mockFrom };

    const res = await logAction('test_action', 'user123', { foo: 'bar' });
    expect(res.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
  });

  test('logAction falls back to localStorage on supabase failure', async () => {
  const insertFnFail = jest.fn().mockRejectedValue(new Error('network'));
  const mockFrom = jest.fn().mockReturnValue({ insert: insertFnFail });
  (supabaseModule as any).supabase = { from: mockFrom };

    const res = await logAction('test_action', null, { x: 1 });
    expect(res.success).toBe(true);
    expect(res.fallback).toBe('local');
    const local = _readLocal(10);
    expect(local.length).toBe(1);
    expect(local[0].action_type).toBe('test_action');
  });

  test('fetchLogs returns local fallback when supabase unavailable', async () => {
  // Build chainable mock: select().order().limit() -> Promise.reject
  const fromMock = jest.fn().mockReturnValue({
    select: () => ({
      order: () => ({
        limit: () => Promise.reject(new Error('network'))
      })
    })
  });
  (supabaseModule as any).supabase = { from: fromMock };

    // seed local
    _saveToLocal({ action_type: 'a', user_id: null, details: '{}', created_at: new Date().toISOString() });
    const res = await fetchLogs(10);
    expect(res.success).toBe(true);
    expect(res.fallback).toBe('local');
    // @ts-ignore
    expect(res.data.length).toBeGreaterThanOrEqual(1);
  });
});
