
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { CommunityPost } from '@/data/community-posts';

const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'community-posts.json');

// Helper function to read posts from the JSON file
async function getPosts(): Promise<CommunityPost[]> {
    try {
        const fileData = await fs.readFile(jsonFilePath, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
}

// Helper function to write posts to the JSON file
async function savePosts(posts: CommunityPost[]): Promise<void> {
    await fs.writeFile(jsonFilePath, JSON.stringify(posts, null, 4));
}

// GET handler to fetch all posts
export async function GET() {
    const posts = await getPosts();
    return NextResponse.json(posts);
}

// POST handler to add a new post
export async function POST(request: Request) {
    const newPostData = await request.json();
    if (!newPostData.content || !newPostData.user) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const posts = await getPosts();
    
    const newPost: CommunityPost = {
        id: Date.now(),
        user: newPostData.user,
        timestamp: 'Just now',
        content: newPostData.content,
        image: newPostData.image || null,
        likes: 0,
        comments: [],
        likedBy: [],
    };

    const updatedPosts = [newPost, ...posts];
    await savePosts(updatedPosts);

    return NextResponse.json(newPost, { status: 201 });
}
