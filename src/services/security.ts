import { supabase } from './supabase';
import { errorHandler } from './errorHandler';

/**
 * Minimal security helper: performs a DB lookup to confirm project ownership.
 * This is intentionally small — later replace callers with a server-side RPC
 * that enforces RLS or server verification.
 */
class SecurityService {
  async isProjectOwner(projectId: string, userIdentifier?: string): Promise<{ success: boolean; isOwner?: boolean; error?: string }> {
    const context = errorHandler.createContext('isProjectOwner', 'SecurityService', `projectId: ${projectId}`);
    try {
      if (!userIdentifier) {
        return { success: false, isOwner: false, error: 'no_user_identifier' };
      }

      const { data, error } = await supabase
        .from('projects')
        .select('creatorId, creatorAddress')
        .eq('id', projectId)
        .single();

      if (error) {
        const e = errorHandler.handleError(error, context);
        return { success: false, isOwner: false, error: e.userMessage };
      }

      if (!data) {
        return { success: false, isOwner: false, error: 'project_not_found' };
      }

      const given = userIdentifier;
      const matchId = data.creatorId && given === data.creatorId;
      const matchAddress = typeof data.creatorAddress === 'string' && typeof given === 'string' && data.creatorAddress.toLowerCase() === given.toLowerCase();

      return { success: true, isOwner: Boolean(matchId || matchAddress) };
    } catch (err: any) {
      const e = errorHandler.handleError(err, context);
      return { success: false, isOwner: false, error: e.userMessage };
    }
  }

  /**
   * Client-side wrapper that will be replaced by RPC when available.
   */
  async enforceOwnerRpc(projectId: string, userIdentifier?: string): Promise<{ success: boolean; error?: string }> {
    const check = await this.isProjectOwner(projectId, userIdentifier);
    if (!check.success) return { success: false, error: check.error };
    return { success: !!check.isOwner };
  }
}

export const securityService = new SecurityService();
