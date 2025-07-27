
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityPost } from '@/data/community-posts';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { database } from '@/lib/firebase';
import { ref, onValue } from "firebase/database";

export const useCommunityPosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    // Re-fetcher function for individual actions to call
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/community/posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data: CommunityPost[] = await response.json();
            const processedData = data.map(post => ({
                ...post,
                isLikedByCurrentUser: user ? post.likedBy?.includes(user.name) : false
            }));
            setPosts(processedData);
        } catch (err: any) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load community posts.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, user]);


    useEffect(() => {
        const postsRef = ref(database, 'posts');
        setIsLoading(true);

        const unsubscribe = onValue(postsRef, (snapshot) => {
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

    const likePost = async (postId: number) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in.' });
            return;
        }
        await performAction(`/api/community/posts/${postId}/like`, 'POST', { userName: user.name });
    };

    const addComment = async (postId: number, text: string, author: { name: string; avatar: string; }) => {
        await performAction(`/api/community/posts/${postId}/comment`, 'POST', { text, user: author });
    };

    const deletePost = async (postId: number) => {
        await performAction(`/api/community/posts/${postId}/delete`, 'POST');
    };

    return { posts, isLoading, error, addPost, likePost, addComment, deletePost };
};
