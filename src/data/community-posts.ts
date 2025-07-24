
export interface Comment {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    text: string;
}

export interface CommunityPost {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    timestamp: string;
    content: string;
    image?: string | null;
    likes: number;
    comments: Comment[];
    isLikedByCurrentUser?: boolean;
}
