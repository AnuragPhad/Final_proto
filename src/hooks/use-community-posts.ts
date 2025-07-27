
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityPost } from '@/data/community-posts';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

interface PostFromFirestore extends Omit<CommunityPost, 'timestamp'> {
    timestamp: Timestamp | { _seconds: number, _nanoseconds: number };
}

export const useCommunityPosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Helper to process a post from either API fetch or Firestore snapshot
    const processPost = (post: PostFromFirestore, id: string): CommunityPost => {
        let timestampInMillis: number;

        if (post.timestamp instanceof Timestamp) {
            // Comes from Firestore snapshot
            timestampInMillis = post.timestamp.toMillis();
        } else if (post.timestamp && typeof post.timestamp === 'object' && '_seconds' in post.timestamp) {
            // Comes from initial API fetch (serialized)
            timestampInMillis = post.timestamp._seconds * 1000;
        } else {
            // Fallback for any other case
            timestampInMillis = new Date().getTime();
        }

        return {
            id,
            ...post,
            timestamp: timestampInMillis,
            isLikedByCurrentUser: user ? post.likedBy?.includes(user.name) : false,
        };
    };

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/community/posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data: PostFromFirestore[] = await response.json();
            
            // The real-time listener will handle updates, but this gives a quick initial load.
            const processedData = data.map((post: any) => processPost(post, post.id));
            setPosts(processedData);

        } catch (err: any) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch community posts.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, user]);

    useEffect(() => {
        // Initial fetch for quick load
        fetchPosts();

        // Set up real-time listener
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('timestamp', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsArray: CommunityPost[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as PostFromFirestore;
                postsArray.push(processPost(data, doc.id));
            });
            setPosts(postsArray);
            setIsLoading(false);
        }, (err) => {
            console.error(err);
            setError("Failed to listen for post updates.");
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to community feed.' });
            setIsLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [fetchPosts, toast, user]);


    const performAction = async (url: string, method: string, body?: any) => {
        setIsLoading(true);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred.');
            }
            // No need to manually refetch, real-time listener will handle it.
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const addPost = async (content: string, author: { name: string; avatar: string; }, image: string | null = null) => {
        await performAction('/api/community/posts', 'POST', { content, user: author, image });
    };

    const likePost = async (postId: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in.' });
            return;
        }
        await performAction(`/api/community/posts/${postId}/like`, 'POST', { userName: user.name });
    };

    const addComment = async (postId: string, text: string, author: { name: string; avatar: string; }) => {
        await performAction(`/api/community/posts/${postId}/comment`, 'POST', { text, user: author });
    };

    const deletePost = async (postId: string) => {
        await performAction(`/api/community/posts/${postId}/delete`, 'POST');
    };

    return { posts, isLoading, error, addPost, likePost, addComment, deletePost };
};
