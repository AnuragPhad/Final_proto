
import { NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, set, push, serverTimestamp } from 'firebase/database';
import type { CommunityPost } from '@/data/community-posts';

// GET handler to fetch all posts
export async function GET() {
    try {
        const postsRef = ref(database, 'posts');
        const snapshot = await get(postsRef);
        if (snapshot.exists()) {
            const postsObject = snapshot.val();
            const postsArray = Object.keys(postsObject).map(key => ({
                id: key,
                ...postsObject[key]
            })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
            return NextResponse.json(postsArray);
        } else {
            return NextResponse.json([]);
        }
    } catch (error) {
        console.error("Firebase read error:", error);
        return NextResponse.json({ message: 'Failed to fetch posts from Firebase' }, { status: 500 });
    }
}

// POST handler to add a new post
export async function POST(request: Request) {
    try {
        const newPostData = await request.json();
        if (!newPostData.content || !newPostData.user) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const postsRef = ref(database, 'posts');
        const newPostRef = push(postsRef);

        const newPost: Omit<CommunityPost, 'id'> = {
            user: newPostData.user,
            timestamp: serverTimestamp() as any, // Use server-side timestamp
            content: newPostData.content,
            image: newPostData.image || null,
            likes: 0,
            comments: [],
            likedBy: [],
        };
        
        await set(newPostRef, newPost);
        const snapshot = await get(newPostRef);
        const createdPost = { id: newPostRef.key, ...snapshot.val() };
        
        return NextResponse.json(createdPost, { status: 201 });
    } catch (error) {
        console.error("Firebase write error:", error);
        return NextResponse.json({ message: 'Failed to create post in Firebase' }, { status: 500 });
    }
}
