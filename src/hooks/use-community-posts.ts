
'use client';

import { useState, useEffect, useCallback } from 'react';
import { communityPostsData, type CommunityPost, type Comment } from '@/data/community-posts';

const STORAGE_KEY = 'kisan-ai-community-posts';

export const useCommunityPosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        try {
            const storedPosts = localStorage.getItem(STORAGE_KEY);
            if (storedPosts) {
                setPosts(JSON.parse(storedPosts));
            } else {
                setPosts(communityPostsData);
            }
        } catch (error) {
            console.error("Failed to load posts from local storage", error);
            setPosts(communityPostsData);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
            } catch (error) {
                console.error("Failed to save posts to local storage", error);
            }
        }
    }, [posts, isMounted]);

    const addPost = useCallback((content: string, user: { name: string; avatar: string; }) => {
        const newPost: CommunityPost = {
            id: Date.now(),
            user,
            timestamp: 'Just now',
            content,
            likes: 0,
            comments: [],
            isLikedByCurrentUser: false,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
    }, []);

    const likePost = useCallback((postId: number) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    const isLiked = !post.isLikedByCurrentUser;
                    const likeAdjustment = isLiked ? 1 : -1;
                    return {
                        ...post,
                        likes: post.likes + likeAdjustment,
                        isLikedByCurrentUser: isLiked,
                    };
                }
                return post;
            })
        );
    }, []);

    const addComment = useCallback((postId: number, text: string, user: { name: string; avatar: string; }) => {
        const newComment: Comment = {
            id: Date.now(),
            user,
            text,
        };
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
    }, []);

    const deletePost = useCallback((postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }, []);

    return { posts, addPost, likePost, addComment, deletePost };
};
