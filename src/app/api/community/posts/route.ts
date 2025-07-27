
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { CommunityPost } from '@/data/community-posts';

// GET handler to fetch all posts
export async function GET() {
    try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const postsArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(postsArray);
    } catch (error) {
        console.error("Firestore read error:", error);
        return NextResponse.json({ message: 'Failed to fetch posts from Firestore' }, { status: 500 });
    }
}

// POST handler to add a new post
export async function POST(request: Request) {
    try {
        const newPostData = await request.json();
        if (!newPostData.content || !newPostData.user) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const postsCollection = collection(db, 'posts');

        const newPost: Omit<CommunityPost, 'id' | 'timestamp'> = {
            user: newPostData.user,
            content: newPostData.content,
            image: newPostData.image || null,
            likes: 0,
            comments: [],
            likedBy: [],
        };
        
        const docRef = await addDoc(postsCollection, {
            ...newPost,
            timestamp: serverTimestamp(),
        });
        
        return NextResponse.json({ id: docRef.id, ...newPost }, { status: 201 });

    } catch (error) {
        console.error("Firestore write error:", error);
        return NextResponse.json({ message: 'Failed to create post in Firestore' }, { status: 500 });
    }
}
