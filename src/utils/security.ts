/**
 * Security utilities for fraud detection and prevention
 */

export interface SecurityFlags {
  suspiciousActivity: boolean;
  profileVerificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  riskScore: number; // 0-100, higher = more risky
  flags: string[];
}

export interface ProfileVerification {
  email: boolean;
  phone: boolean;
  identity: boolean;
  socialMedia: boolean;
  linkedin: boolean;
  github: boolean;
}

export interface ProjectVerification {
  hasValidDescription: boolean;
  hasRealImages: boolean;
  hasValidTimeline: boolean;
  teamMembersVerified: boolean;
  hasExternalLinks: boolean;
  budgetRealistic: boolean;
}

/**
 * Analyze user profile for suspicious patterns
 */
export const analyzeProfileSecurity = (profile: any): SecurityFlags => {
  const flags: string[] = [];
  let riskScore = 0;

  // Check for generic/fake names
  if (profile.fullName && /^(test|user|admin|fake)/i.test(profile.fullName)) {
    flags.push('Suspicious name pattern');
    riskScore += 20;
  }

  // Check for temporary email domains
  const tempEmailDomains = ['10minutemail', 'tempmail', 'guerrillamail', 'mailinator'];
  if (profile.email && tempEmailDomains.some(domain => profile.email.includes(domain))) {
    flags.push('Temporary email detected');
    riskScore += 30;
  }

  // Check profile completion
  const completionScore = calculateProfileCompletion(profile);
  if (completionScore < 30) {
    flags.push('Incomplete profile');
    riskScore += 15;
  }

  // Check for rapid-fire actions
  if (profile.createdAt && isNewAccount(profile.createdAt) && profile.projectsCreated > 3) {
    flags.push('New account with high activity');
    riskScore += 25;
  }

  // Determine verification level
  let verificationLevel: SecurityFlags['profileVerificationLevel'] = 'none';
  if (completionScore > 70 && profile.emailVerified) verificationLevel = 'basic';
  if (verificationLevel === 'basic' && profile.phoneVerified) verificationLevel = 'verified';
  if (verificationLevel === 'verified' && profile.identityVerified) verificationLevel = 'premium';

  return {
    suspiciousActivity: riskScore > 40,
    profileVerificationLevel: verificationLevel,
    riskScore: Math.min(riskScore, 100),
    flags
  };
};

/**
 * Analyze project for fraudulent indicators
 */
export const analyzeProjectSecurity = (project: any): ProjectVerification & { riskScore: number; flags: string[] } => {
  const flags: string[] = [];
  let riskScore = 0;

  // Check description quality
  const hasValidDescription = project.description && 
    project.description.length > 100 && 
    !hasExcessiveKeywords(project.description);

  if (!hasValidDescription) {
    flags.push('Poor description quality');
    riskScore += 20;
  }

  // Check for realistic budget
  const budgetRealistic = project.fundingGoal && 
    project.fundingGoal >= 1000 && 
    project.fundingGoal <= 1000000;

  if (!budgetRealistic) {
    flags.push('Unrealistic funding goal');
    riskScore += 25;
  }

  // Check for valid timeline
  const hasValidTimeline = project.timeline && 
    project.timeline.length > 0 && 
    project.timeline.every((milestone: any) => 
      milestone.title && milestone.description && milestone.date
    );

  if (!hasValidTimeline) {
    flags.push('Invalid or missing timeline');
    riskScore += 15;
  }

  // Check for external validation
  const hasExternalLinks = project.links && 
    (project.links.website || project.links.github || project.links.social);

  if (!hasExternalLinks) {
    flags.push('No external validation links');
    riskScore += 10;
  }

  // Check images for AI generation indicators
  const hasRealImages = project.images && 
    project.images.length > 0 && 
    !containsSuspiciousImagePatterns(project.images);

  if (!hasRealImages) {
    flags.push('Suspicious or missing images');
    riskScore += 15;
  }

  return {
    hasValidDescription,
    hasRealImages,
    hasValidTimeline,
    teamMembersVerified: checkTeamVerification(project.team),
    hasExternalLinks,
    budgetRealistic,
    riskScore: Math.min(riskScore, 100),
    flags
  };
};

/**
 * Generate security recommendations
 */
export const generateSecurityRecommendations = (
  profileSecurity: SecurityFlags,
  projectSecurity?: ProjectVerification & { riskScore: number; flags: string[] }
): string[] => {
  const recommendations: string[] = [];

  if (profileSecurity.profileVerificationLevel === 'none') {
    recommendations.push('Verify your email address to increase trust');
  }

  if (profileSecurity.profileVerificationLevel === 'basic') {
    recommendations.push('Add phone verification for enhanced security');
  }

  if (profileSecurity.riskScore > 30) {
    recommendations.push('Complete your profile to reduce risk score');
  }

  if (projectSecurity) {
    if (!projectSecurity.hasValidDescription) {
      recommendations.push('Improve project description with more details');
    }
    if (!projectSecurity.hasExternalLinks) {
      recommendations.push('Add external links (website, GitHub, social media)');
    }
    if (!projectSecurity.hasValidTimeline) {
      recommendations.push('Create a detailed project timeline');
    }
  }

  return recommendations;
};

/**
 * Real-time fraud detection
 */
export const detectFraudulentBehavior = (userActions: any[]): boolean => {
  // Check for bot-like behavior patterns
  const rapidActions = userActions.filter(action => 
    Date.now() - new Date(action.timestamp).getTime() < 60000 // Last minute
  );

  if (rapidActions.length > 10) return true;

  // Check for duplicate content
  const duplicateActions = userActions.filter(action => 
    action.type === 'project_creation' || action.type === 'comment'
  );

  const uniqueContent = new Set(duplicateActions.map(action => action.content));
  if (duplicateActions.length > 3 && uniqueContent.size < duplicateActions.length * 0.5) {
    return true;
  }

  return false;
};

/**
 * Helper functions
 */
const calculateProfileCompletion = (profile: any): number => {
  const fields = [
    'fullName', 'bio', 'skills', 'fieldsOfInterest', 
    'avatar', 'location', 'website', 'social'
  ];
  
  const completed = fields.filter(field => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
  });

  return (completed.length / fields.length) * 100;
};

const isNewAccount = (createdAt: string): boolean => {
  const accountAge = Date.now() - new Date(createdAt).getTime();
  return accountAge < (7 * 24 * 60 * 60 * 1000); // Less than 7 days
};

const hasExcessiveKeywords = (text: string): boolean => {
  const spamKeywords = ['guaranteed', 'revolutionary', 'unique opportunity', 'limited time'];
  const keywordCount = spamKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  return keywordCount > 2;
};

const containsSuspiciousImagePatterns = (images: string[]): boolean => {
  // This would integrate with AI image detection services
  // For now, check for common AI-generated image indicators
  return images.some(url => 
    url.includes('generated') || 
    url.includes('placeholder') ||
    url.includes('stock-photo')
  );
};

const checkTeamVerification = (team: any[]): boolean => {
  if (!team || team.length === 0) return false;
  return team.every(member => member.verified || member.linkedinProfile);
};

/**
 * Content moderation utilities
 */
export const moderateContent = (content: string): { isAppropriate: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  // Check for inappropriate language
  const inappropriateWords = ['scam', 'fraud', 'fake', 'steal', 'illegal'];
  const hasInappropriateContent = inappropriateWords.some(word => 
    content.toLowerCase().includes(word)
  );

  if (hasInappropriateContent) {
    reasons.push('Contains potentially inappropriate language');
  }

  // Check for excessive promotional content
  const promotionalIndicators = ['buy now', 'limited offer', 'click here', 'visit our website'];
  const promotionalCount = promotionalIndicators.filter(indicator =>
    content.toLowerCase().includes(indicator)
  ).length;

  if (promotionalCount > 2) {
    reasons.push('Contains excessive promotional content');
  }

  // Check for personal information sharing
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phonePattern = /(\+\d{1,3}[- ]?)?\d{10}/;
  
  if (emailPattern.test(content) || phonePattern.test(content)) {
    reasons.push('Contains personal contact information');
  }

  return {
    isAppropriate: reasons.length === 0,
    reasons
  };
};

/**
 * Rate limiting utilities
 */
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (userId: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => 
      now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    validRequests.push(now);
    requests.set(userId, validRequests);
    return true;
  };
};

export default {
  analyzeProfileSecurity,
  analyzeProjectSecurity,
  generateSecurityRecommendations,
  detectFraudulentBehavior,
  moderateContent,
  createRateLimit
};