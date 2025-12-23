
export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  userInfo: string;
  text: string;
  likes: number;
  time: string;
  postId?: string;
  parentId?: string;
  isLiked?: boolean;
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
  name: string;
  email: string;
  avatarUrl: string;
  church: string;
  education: string;
  course?: string;
  isDarkMode: boolean;
  savedPostIds: string[];
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
