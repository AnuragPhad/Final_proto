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
    image?: string;
    likes: number;
    comments: Comment[];
}

export const communityPostsData: CommunityPost[] = [
    {
        id: 1,
        user: {
            name: 'Rajesh Kumar',
            avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
        },
        timestamp: '2 hours ago',
        content: `The monsoon has been good this year in Punjab. My paddy crop is looking very healthy. Sharing a recent picture. #farming #monsoon`,
        image: 'https://placehold.co/600x400.png',
        likes: 45,
        comments: [
            { id: 1, user: { name: 'Priya Sharma', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random' }, text: 'Looks great, Rajesh! Best of luck for the harvest.' },
            { id: 2, user: { name: 'Amit Singh', avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=random' }, text: 'Very nice. Which variety have you planted?' },
        ],
    },
    {
        id: 2,
        user: {
            name: 'Priya Sharma',
            avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
        },
        timestamp: '5 hours ago',
        content: `I'm planning to use a new organic pesticide for my tomato plants in Maharashtra. Has anyone tried neem oil mixtures? What were your results? Any advice would be appreciated.`,
        likes: 22,
        comments: [],
    },
    {
        id: 3,
        user: {
            name: 'Amit Singh',
            avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=random',
        },
        timestamp: '1 day ago',
        content: `Just got my soil health card. It recommends adding more nitrogen to my field before sowing wheat. This is such a useful scheme! #SoilHealth #PMKisan`,
        likes: 78,
        comments: [
            { id: 3, user: { name: 'Rajesh Kumar', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random' }, text: 'Yes, the soil health card is very helpful. Saved me a lot on fertilizer costs.' },
        ],
    },
    {
        id: 4,
        user: {
            name: 'Sunita Devi',
            avatar: 'https://ui-avatars.com/api/?name=Sunita+Devi&background=random',
        },
        timestamp: '2 days ago',
        content: `The price for onions in Nashik mandi seems to be going up. Is now a good time to sell, or should I wait a bit longer? Any thoughts from fellow farmers in the region?`,
        likes: 31,
        comments: [],
    },
];
