
export interface Comment {
    id: string; // Changed to string for Firebase keys
    user: {
        name: string;
        avatar: string;
    };
    text: string;
}

export interface CommunityPost {
    id: string; // Changed to string for Firebase keys
    user: {
        name: string;
        avatar: string;
    };
    timestamp: number; // Changed to number for server timestamps
    content: string;
    image?: string | null;
    likes: number;
    comments: Comment[];
    likedBy?: string[];
    isLikedByCurrentUser?: boolean;
}
