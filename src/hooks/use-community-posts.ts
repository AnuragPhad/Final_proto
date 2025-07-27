
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityPost } from '@/data/community-posts';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { database } from '@/lib/firebase';
import { ref, onValue, get, set, serverTimestamp, push } from "firebase/database";

// Helper function to seed initial data if the database is empty
const seedInitialData = async () => {
    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);
    if (!snapshot.exists()) {
        console.log("No posts found. Seeding initial data...");
        const samplePosts: Omit<CommunityPost, 'id' | 'timestamp'>[] = [
            {
                user: { name: 'Ravi Kumar', avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=random' },
                content: 'Just finished planting my wheat crop for the season! Hoping for a good yield this year. What is everyone else planting?',
                image: `https://placehold.co/600x400.png`,
                likes: 5,
                comments: [],
                likedBy: ['Sunita', 'Anil'],
            },
            {
                user: { name: 'Sunita Sharma', avatar: 'https://ui-avatars.com/api/?name=Sunita+Sharma&background=random' },
                content: 'I noticed some yellowing leaves on my tomato plants. Has anyone seen this before? Any advice would be appreciated!',
                image: `https://placehold.co/600x400.png`,
                likes: 12,
                comments: [],
                likedBy: ['Ravi Kumar'],
            },
            {
                user: { name: 'Anil Verma', avatar: 'https://ui-avatars.com/api/?name=Anil+Verma&background=random' },
                content: 'The market price for onions in Nashik seems to be rising. Is now a good time to sell?',
                likes: 8,
                comments: [],
                likedBy: [],
            }
        ];

        for (const postData of samplePosts) {
            const newPostRef = push(postsRef);
            const newPost = {
                ...postData,
                timestamp: serverTimestamp(),
            };
            await set(newPostRef, newPost);
        }
        console.log("Initial data seeded.");
    }
};


export const useCommunityPosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const postsRef = ref(database, 'posts');
        setIsLoading(true);

        const unsubscribe = onValue(postsRef, async (snapshot) => {
            if (snapshot.exists()) {
                const postsObject = snapshot.val();
                const postsArray = Object.keys(postsObject).map(key => ({
                    id: key,
                    ...postsObject[key]
                })).sort((a, b) => b.timestamp - a.timestamp);

                const processedData = postsArray.map(post => ({
                    ...post,
                    isLikedByCurrentUser: user ? post.likedBy?.includes(user.name) : false
                }));
                setPosts(processedData);
            } else {
                // If no posts, seed the data and then let the listener pick it up
                await seedInitialData();
                // The onValue listener will be triggered again once data is seeded.
                 setPosts([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            setError("Failed to listen for post updates.");
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to community feed.' });
            setIsLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [user, toast]);


    const performAction = async (url: string, method: string, body?: any) => {
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
