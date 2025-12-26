
export interface Comment {
  id: string;
  usuario: string;
  userAvatar: string;
  church: string;
  texto: string;
  likes: number;
  hora: number;
  postId?: string;
  parentId?: string;
  postTitle?: string;
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
  church: string;
  whatsapp: string;
  education: string;
  isPastor: boolean;
  isDarkMode: boolean;
  isProfileComplete: boolean;
  role: 'user' | 'admin';
  savedPostIds: string[];
  likedPostIds: string[];
  likedCommentIds: string[]; // Controle de likes em comentários
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
