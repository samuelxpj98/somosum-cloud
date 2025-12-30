
export interface Comment {
  id: string;
  userId: string; // Adicionado para saber quem notificar
  usuario: string;
  userAvatar: string;
  userColor?: string; 
  church: string;
  texto: string;
  likes: number;
  hora: number;
  postId?: string;
  parentId?: string;
  postTitle?: string;
}

export interface AppNotification {
  id: string;
  type: 'reply' | 'like' | 'system';
  senderName: string;
  text: string;
  postId: string;
  postTitle: string;
  timestamp: number;
  read: boolean;
}

export interface ResourceLink {
  title: string;
  description: string;
  type: 'book' | 'video' | 'link';
  url: string;
}

export interface Expresso {
  id: string;
  category: string;
  categoryFull?: string;
  categoryType?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  content: string;
  analogy?: {
    icon: string;
    title: string;
    text: string;
  };
  readingTime: string;
  views?: string;
  bibleReference?: string;
  videoUrl?: string;
  resources?: ResourceLink[];
  tags: string[];
  isClassic?: boolean;
  status?: 'draft' | 'pending' | 'published';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  avatarColor?: string; 
  church: string;
  whatsapp: string;
  education: string;
  isPastor: boolean;
  leadershipRole?: 'pastor' | 'lider_juventude' | 'none';
  isDarkMode: boolean;
  isProfileComplete: boolean;
  role: 'user' | 'admin';
  savedPostIds: string[];
  likedPostIds: string[];
  likedCommentIds: string[];
  readPostIds: string[];
  loginCount: number;
  lastLoginDate?: number;
  stats: {
    daysInRow: number;
    savedPosts: number;
    writtenPosts: number;
  };
}

export interface AppContent {
  branding: {
    appName: string;
    region: string;
    motto: string;
  };
  landing: {
    title: string;
    description: string;
    heroImage: string;
  };
  expressos: Expresso[];
  comments: Comment[];
  profile: UserProfile;
}
