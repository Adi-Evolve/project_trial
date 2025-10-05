// Third-party integrations logic stub
// TODO: Implement sendToSlack, sendToDiscord, sendEmailNotification
import { supabase } from './supabase';
import { logAction } from './auditLogs';

type IntegrationResult = { success: boolean; noop?: boolean; error?: any };

export const isIntegrationsDisabled = () => process.env.REACT_APP_DISABLE_EXTERNAL_INTEGRATIONS === 'true';

// Create a notification record in the notifications table
export const createNotification = async (userId: string | null, title: string, message: string, meta: any = {}) => {
	try {
		const payload = {
			user_id: userId,
			title,
			message,
			meta: JSON.stringify(meta || {}),
			created_at: new Date().toISOString(),
			read: false
		};
		const { error } = await supabase.from('notifications').insert([payload]);
		if (error) throw error;
		await logAction('notification_created', userId, { title, message, meta });
		return { success: true };
	} catch (err) {
		console.error('createNotification error', err);
		return { success: false, error: err };
	}
};

// For backward compatibility keep the sendToSlack/sendToDiscord names but implement simple webhook callers
export const sendToSlack = async (message: string, webhookUrl?: string): Promise<IntegrationResult> => {
	const integrationsDisabled = isIntegrationsDisabled();
	if (!webhookUrl) {
		if (integrationsDisabled) {
			console.info('sendToSlack: integrations disabled, noop');
			return { success: true, noop: true };
		}

		// try to invoke a Supabase Edge Function if present
		try {
			// supabase.functions.invoke can throw if no functions configured
			// @ts-ignore
			if (supabase && supabase.functions && supabase.functions.invoke) {
				await supabase.functions.invoke('send-to-slack', { body: { message } });
				return { success: true };
			}
		} catch (err) {
			console.warn('sendToSlack Edge Function failed', err);
		}
		return { success: false, error: 'no webhook url provided' };
	}
	if (integrationsDisabled) {
		console.info('sendToSlack: integrations disabled, noop');
		return { success: true, noop: true };
	}
	return sendSlackWebhook(webhookUrl, { text: message });
};

export const sendToDiscord = async (message: string, webhookUrl?: string): Promise<IntegrationResult> => {
	const integrationsDisabled = isIntegrationsDisabled();
	if (!webhookUrl) {
		if (integrationsDisabled) {
			console.info('sendToDiscord: integrations disabled, noop');
			return { success: true, noop: true };
		}
		try {
			// @ts-ignore
			if (supabase && supabase.functions && supabase.functions.invoke) {
				await supabase.functions.invoke('send-to-discord', { body: { message } });
				return { success: true };
			}
		} catch (err) {
			console.warn('sendToDiscord Edge Function failed', err);
		}
		return { success: false, error: 'no webhook url provided' };
	}
	if (integrationsDisabled) {
		console.info('sendToDiscord: integrations disabled, noop');
		return { success: true, noop: true };
	}
	return sendDiscordWebhook(webhookUrl, { content: message });
};

// Send to Slack webhook URL directly
export const sendSlackWebhook = async (webhookUrl: string, payload: any): Promise<IntegrationResult> => {
	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
		await logAction('slack_webhook_sent', null, { status: res.status });
		return { success: true };
	} catch (err) {
		console.error('sendSlackWebhook error', err);
		return { success: false, error: err };
	}
};

export const sendDiscordWebhook = async (webhookUrl: string, payload: any): Promise<IntegrationResult> => {
	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`);
		await logAction('discord_webhook_sent', null, { status: res.status });
		return { success: true };
	} catch (err) {
		console.error('sendDiscordWebhook error', err);
		return { success: false, error: err };
	}
};

// Queue an outbound email by inserting into outbound_emails table. External worker should send them.
export const sendEmailNotification = async (email: string, subject: string, body: string, meta: any = {}): Promise<IntegrationResult> => {
	try {
		const payload = {
			to_email: email,
			subject,
			body,
			meta: JSON.stringify(meta || {}),
			created_at: new Date().toISOString(),
			sent: false
		};

		const integrationsDisabled = isIntegrationsDisabled();
		if (integrationsDisabled) {
			await logAction('email_queued_noop', null, { to: email, subject });
			return { success: true, noop: true };
		}

		const { error } = await supabase.from('outbound_emails').insert([payload]);
		if (error) throw error;
		await logAction('email_queued', null, { to: email, subject });
		return { success: true };
	} catch (err) {
		console.error('sendEmailNotification error', err);
		return { success: false, error: err };
	}
};
