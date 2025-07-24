
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { CommunityPost, Comment } from '@/data/community-posts';

const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'community-posts.json');

// Helper function to read posts from the JSON file
async function getPosts(): Promise<CommunityPost[]> {
    try {
        const fileData = await fs.readFile(jsonFilePath, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        return [];
    }
}

// Helper function to write posts to the JSON file
async function savePosts(posts: CommunityPost[]): Promise<void> {
    await fs.writeFile(jsonFilePath, JSON.stringify(posts, null, 4));
}

export async function POST(
  request: Request,
  { params }: { params: { postId: string; action: string } }
) {
    const postId = parseInt(params.postId, 10);
    const action = params.action;

    if (isNaN(postId)) {
        return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }

    let posts = await getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    let updatedPost: CommunityPost | undefined;

    switch (action) {
        case 'like': {
            const { userName } = await request.json();
            if (!userName) {
                 return NextResponse.json({ message: 'User name is required to like a post' }, { status: 400 });
            }
            const post = posts[postIndex];
            const likedBy = post.likedBy || [];
            
            if (likedBy.includes(userName)) {
                // Unlike
                post.likes = Math.max(0, post.likes - 1);
                post.likedBy = likedBy.filter(name => name !== userName);
            } else {
                // Like
                post.likes += 1;
                post.likedBy = [...likedBy, userName];
            }
            updatedPost = post;
            break;
        }

        case 'comment': {
            const { text, user } = await request.json();
             if (!text || !user) {
                return NextResponse.json({ message: 'Text and user are required for a comment' }, { status: 400 });
            }
            const post = posts[postIndex];
            const newComment: Comment = {
                id: Date.now(),
                text,
                user,
            };
            post.comments.push(newComment);
            updatedPost = post;
            break;
        }

        case 'delete': {
            posts.splice(postIndex, 1);
            await savePosts(posts);
            return NextResponse.json({ message: 'Post deleted successfully' });
        }

        default:
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (updatedPost) {
        posts[postIndex] = updatedPost;
        await savePosts(posts);
        return NextResponse.json(updatedPost);
    }

    return NextResponse.json({ message: 'Could not perform action' }, { status: 500 });
}
