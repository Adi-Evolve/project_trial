// Audit log utilities with Supabase + localStorage fallback
// Implements: logAction(actionType, userId, details) and fetchLogs()
import { supabase } from './supabase';

export interface AuditLog {
  id?: string;
  action_type: string;
  user_id: string | null;
  details: string; // JSON string
  created_at: string; // ISO
}

const LOCAL_KEY = 'audit_logs_local';

const saveToLocal = (entry: AuditLog) => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const arr: AuditLog[] = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
    return true;
  } catch (e) {
    console.error('saveToLocal error', e);
    return false;
  }
};

const readLocal = (limit = 100): AuditLog[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const arr: AuditLog[] = raw ? JSON.parse(raw) : [];
    return arr.slice(-limit).reverse();
  } catch (e) {
    console.error('readLocal error', e);
    return [];
  }
};

// Logs an action into the audit_logs table; falls back to localStorage if Supabase fails
export const logAction = async (actionType: string, userId: string | null, details: any = {}) => {
  const entry: AuditLog = {
    action_type: actionType,
    user_id: userId,
    details: typeof details === 'string' ? details : JSON.stringify(details || {}),
    created_at: new Date().toISOString()
  };

  try {
    // Attempt to write to Supabase
    // supabase.from(...).insert(...) chain may throw or return error
    const resp = await supabase.from('audit_logs').insert([entry]);
    // Some Supabase clients return { error } or { data, error }
    // Normalize
    // @ts-ignore
    const error = resp?.error || null;
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('logAction: Supabase unavailable, falling back to localStorage', err);
    const ok = saveToLocal(entry);
    if (!ok) return { success: false, error: 'local_save_failed' };
    return { success: true, fallback: 'local' };
  }
};

// Fetch logs from Supabase, fallback to localStorage when necessary
export const fetchLogs = async (limit = 100) => {
  try {
    const resp = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    // @ts-ignore
    const error = resp?.error || null;
    // @ts-ignore
    const data = resp?.data || null;
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('fetchLogs: Supabase unavailable, reading local logs', err);
    const data = readLocal(limit);
    return { success: true, data, fallback: 'local' };
  }
};

// Expose helpers for tests and debug
export const _readLocal = readLocal;
export const _saveToLocal = saveToLocal;
