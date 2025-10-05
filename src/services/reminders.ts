// Automated reminders logic stub
// TODO: Implement scheduleReminder(userId, type, date) and sendReminders()
import { supabase } from './supabase';
import { logAction } from './auditLogs';

// Schedule a reminder by inserting into reminders table
export const scheduleReminder = async (userId: string, whenIso: string, message: string, meta: any = {}) => {
  try {
    const payload = {
      user_id: userId,
      remind_at: whenIso,
      message,
      meta: JSON.stringify(meta || {}),
      created_at: new Date().toISOString(),
      sent: false
    };
    const { error } = await supabase.from('reminders').insert([payload]);
    if (error) throw error;
    await logAction('reminder_scheduled', userId, { when: whenIso, message, meta });
    return { success: true };
  } catch (err) {
    console.error('scheduleReminder error', err);
    return { success: false, error: err };
  }
};

// In-memory fallback for local development if Supabase is unavailable
type InMemoryReminder = { id: string; user_id: string | null; remind_at: string; message: string; meta: any; sent: boolean };
const inMemoryQueue: InMemoryReminder[] = [];

export const scheduleReminderLocal = async (userId: string | null, whenIso: string, message: string, meta: any = {}) => {
  const entry: InMemoryReminder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    remind_at: whenIso,
    message,
    meta,
    sent: false
  };
  inMemoryQueue.push(entry);
  await logAction('reminder_scheduled_local', userId, { when: whenIso, message, meta });
  return { success: true, id: entry.id };
};

// Finds reminders that are due (remind_at <= now and not sent) and marks them sent after returning
export const fetchDueReminders = async () => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .lte('remind_at', now)
      .eq('sent', false)
      .order('remind_at', { ascending: true })
      .limit(100);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('fetchDueReminders error', err);
    return { success: false, error: err };
  }
};

export const fetchDueRemindersLocal = async () => {
  const now = new Date().toISOString();
  const due = inMemoryQueue.filter((r) => !r.sent && r.remind_at <= now);
  return { success: true, data: due };
};

export const markReminderSent = async (id: string) => {
  try {
    const { error } = await supabase.from('reminders').update({ sent: true, sent_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('markReminderSent error', err);
    return { success: false, error: err };
  }
};

export const markReminderSentLocal = async (id: string) => {
  const idx = inMemoryQueue.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false, error: 'not_found' };
  inMemoryQueue[idx].sent = true;
  return { success: true };
};

// sendDueReminders can be executed by a cron/Edge Function: fetch due, send notifications, mark sent
export const sendDueReminders = async (sendFn: (r: any) => Promise<any>) => {
  const res = await fetchDueReminders();
  if (!res.success) return res;
  const reminders = res.data || [];
  for (const r of reminders) {
    try {
      await sendFn(r);
      await markReminderSent(r.id);
      await logAction('reminder_sent', r.user_id, { reminderId: r.id });
    } catch (err) {
      console.error('sendDueReminders: send error', err, r);
    }
  }
  return { success: true, count: reminders.length };
};

// Local runner to send due reminders from in-memory queue
export const sendDueRemindersLocal = async (sendFn: (r: any) => Promise<any>) => {
  const res = await fetchDueRemindersLocal();
  if (!res.success) return res;
  const reminders = res.data || [];
  for (const r of reminders) {
    try {
      await sendFn(r);
      await markReminderSentLocal(r.id);
      await logAction('reminder_sent_local', r.user_id, { reminderId: r.id });
    } catch (err) {
      console.error('sendDueRemindersLocal: send error', err, r);
    }
  }
  return { success: true, count: reminders.length };
};
