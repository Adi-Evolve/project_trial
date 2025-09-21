export const PROJECT_CATEGORIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health & Medicine', icon: '🏥' },
  { value: 'environment', label: 'Environment', icon: '🌱' },
  { value: 'social', label: 'Social Impact', icon: '🤝' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'nonprofit', label: 'Non-Profit', icon: '❤️' },
  { value: 'hardware', label: 'Hardware', icon: '🔧' },
  { value: 'software', label: 'Software', icon: '💾' },
  { value: 'mobile', label: 'Mobile Apps', icon: '📱' },
  { value: 'web', label: 'Web Development', icon: '🌐' },
  { value: 'ai', label: 'Artificial Intelligence', icon: '🤖' },
  { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { value: 'iot', label: 'Internet of Things', icon: '📡' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const IDEA_CATEGORIES = [
  { value: 'app_idea', label: 'App Idea', icon: '💡' },
  { value: 'business_model', label: 'Business Model', icon: '📈' },
  { value: 'feature_request', label: 'Feature Request', icon: '⭐' },
  { value: 'research_topic', label: 'Research Topic', icon: '🔍' },
  { value: 'design_concept', label: 'Design Concept', icon: '✨' },
  { value: 'technical_solution', label: 'Technical Solution', icon: '⚡' },
  { value: 'social_impact', label: 'Social Impact', icon: '🌍' },
  { value: 'innovation', label: 'Innovation', icon: '🚀' },
  { value: 'other', label: 'Other', icon: '💭' },
] as const;

export const SKILL_CATEGORIES = [
  {
    category: 'Programming Languages',
    skills: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'SQL'
    ]
  },
  {
    category: 'Frontend Development',
    skills: [
      'React', 'Vue.js', 'Angular', 'Svelte', 'HTML5', 'CSS3', 'Sass/SCSS',
      'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Next.js', 'Nuxt.js'
    ]
  },
  {
    category: 'Backend Development',
    skills: [
      'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails',
      'ASP.NET', 'Laravel', 'FastAPI', 'GraphQL', 'REST API', 'Microservices'
    ]
  },
  {
    category: 'Database & Storage',
    skills: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Firebase',
      'Supabase', 'DynamoDB', 'Cassandra', 'Neo4j', 'SQLite', 'Oracle'
    ]
  },
  {
    category: 'Cloud & DevOps',
    skills: [
      'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins',
      'GitLab CI/CD', 'GitHub Actions', 'Terraform', 'Ansible', 'Nginx'
    ]
  },
  {
    category: 'Mobile Development',
    skills: [
      'React Native', 'Flutter', 'iOS Development', 'Android Development',
      'Xamarin', 'Ionic', 'Cordova', 'SwiftUI', 'Jetpack Compose'
    ]
  },
  {
    category: 'Design & UX/UI',
    skills: [
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision',
      'Principle', 'Framer', 'User Research', 'Wireframing', 'Prototyping'
    ]
  },
  {
    category: 'Data Science & AI',
    skills: [
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas',
      'NumPy', 'Scikit-learn', 'Jupyter', 'Data Visualization', 'NLP', 'Computer Vision'
    ]
  },
  {
    category: 'Blockchain & Web3',
    skills: [
      'Solidity', 'Web3.js', 'Ethers.js', 'Smart Contracts', 'DeFi', 'NFTs',
      'Ethereum', 'Polygon', 'Binance Smart Chain', 'IPFS', 'MetaMask'
    ]
  },
  {
    category: 'Project Management',
    skills: [
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Asana', 'Monday.com',
      'Slack', 'Microsoft Teams', 'Product Management', 'Strategy Planning'
    ]
  },
  {
    category: 'Marketing & Business',
    skills: [
      'Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing',
      'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Business Strategy',
      'Market Research', 'Sales', 'Customer Success'
    ]
  },
  {
    category: 'Quality Assurance',
    skills: [
      'Manual Testing', 'Automated Testing', 'Selenium', 'Jest', 'Cypress',
      'Playwright', 'Postman', 'Load Testing', 'Security Testing'
    ]
  }
] as const;

export const PROJECT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'gray', icon: '📝' },
  { value: 'seeking_team', label: 'Seeking Team', color: 'blue', icon: '👥' },
  { value: 'seeking_funding', label: 'Seeking Funding', color: 'yellow', icon: '💰' },
  { value: 'in_progress', label: 'In Progress', color: 'orange', icon: '🚧' },
  { value: 'completed', label: 'Completed', color: 'green', icon: '✅' },
  { value: 'paused', label: 'Paused', color: 'purple', icon: '⏸️' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '❌' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'trending', label: 'Trending' },
] as const;

export const TIME_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
] as const;

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'ETH', label: 'Ethereum', symbol: 'Ξ' },
  { value: 'MATIC', label: 'Polygon', symbol: 'MATIC' },
] as const;

export const NOTIFICATION_TYPES = [
  { value: 'project_update', label: 'Project Update', icon: '📢' },
  { value: 'comment_reply', label: 'Comment Reply', icon: '💬' },
  { value: 'collaboration_request', label: 'Collaboration Request', icon: '🤝' },
  { value: 'vote_received', label: 'Vote Received', icon: '👍' },
  { value: 'milestone_completed', label: 'Milestone Completed', icon: '🎯' },
  { value: 'funding_received', label: 'Funding Received', icon: '💰' },
  { value: 'system_announcement', label: 'System Announcement', icon: '📢' },
] as const;

export const APP_CONFIG = {
  name: 'ProjectForge',
  tagline: 'Where Ideas Meet Innovation',
  description: 'A decentralized platform for crowdfunding innovative projects and sharing groundbreaking ideas.',
  version: '1.0.0',
  author: 'ProjectForge Team',
  social: {
    twitter: '@projectforge',
    github: 'https://github.com/projectforge',
    discord: 'https://discord.gg/projectforge',
    telegram: 'https://t.me/projectforge',
  },
  limits: {
    maxProjectImages: 10,
    maxProjectVideos: 3,
    maxTeamSize: 50,
    maxTagsPerProject: 10,
    maxSkillsPerUser: 20,
    maxCommentLength: 1000,
    maxProjectDescriptionLength: 5000,
    maxIdeaDescriptionLength: 2000,
  },
  pagination: {
    defaultLimit: 12,
    maxLimit: 100,
  },
  features: {
    enableBlockchain: true,
    enableCrypto: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableChat: true,
    enableVideoChat: false,
  }
} as const;