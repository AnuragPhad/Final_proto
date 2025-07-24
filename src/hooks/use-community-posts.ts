
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommunityPost, Comment } from '@/data/community-posts';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';


export const useCommunityPosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/community/posts');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data: CommunityPost[] = await response.json();
            
            // Add isLikedByCurrentUser field based on current user
            const processedData = data.map(post => ({
                ...post,
                isLikedByCurrentUser: user ? post.likedBy?.includes(user.name) : false
            }));

            setPosts(processedData.sort((a, b) => b.id - a.id)); // Sort by newest first
            setError(null);
        } catch (err: any) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load community posts.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, user]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

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

            const updatedPost: CommunityPost = await response.json();
             // After any action, re-fetch all posts to ensure UI consistency
            await fetchPosts();

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };

    const addPost = useCallback(async (content: string, author: { name: string; avatar: string; }, image: string | null = null) => {
        await performAction('/api/community/posts', 'POST', { content, user: author, image });
    }, []);

    const likePost = useCallback(async (postId: number) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in.' });
            return;
        }
        await performAction(`/api/community/posts/${postId}/like`, 'POST', { userName: user.name });
    }, [user, toast]);

    const addComment = useCallback(async (postId: number, text: string, author: { name: string; avatar: string; }) => {
        await performAction(`/api/community/posts/${postId}/comment`, 'POST', { text, user: author });
    }, []);

    const deletePost = useCallback(async (postId: number) => {
        await performAction(`/api/community/posts/${postId}/delete`, 'POST');
    }, []);

    return { posts, isLoading, error, fetchPosts, addPost, likePost, addComment, deletePost };
};
