
import { NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, set, push, runTransaction } from "firebase/database";
import type { CommunityPost, Comment } from '@/data/community-posts';

export async function POST(
  request: Request,
  { params }: { params: { postId: string; action: string } }
) {
    const { postId, action } = params;

    if (!postId) {
        return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }
    
    const postRef = ref(database, `posts/${postId}`);

    try {
        let updatedData: any = null;

        switch (action) {
            case 'like': {
                const { userName } = await request.json();
                if (!userName) {
                    return NextResponse.json({ message: 'User name is required' }, { status: 400 });
                }
                
                await runTransaction(postRef, (post: CommunityPost) => {
                    if (post) {
                        if (post.likedBy && post.likedBy.includes(userName)) {
                            post.likes--;
                            post.likedBy = post.likedBy.filter(u => u !== userName);
                        } else {
                            post.likes++;
                            if (!post.likedBy) {
                                post.likedBy = [];
                            }
                            post.likedBy.push(userName);
                        }
                    }
                    updatedData = post;
                    return post;
                });
                break;
            }

            case 'comment': {
                const { text, user } = await request.json();
                if (!text || !user) {
                    return NextResponse.json({ message: 'Text and user are required' }, { status: 400 });
                }
                
                const commentsRef = ref(database, `posts/${postId}/comments`);
                const newCommentRef = push(commentsRef);
                const newComment: Omit<Comment, 'id'> = { text, user };
                await set(newCommentRef, newComment);
                
                const snapshot = await get(postRef);
                updatedData = snapshot.val();
                break;
            }

            case 'delete': {
                await set(postRef, null);
                return NextResponse.json({ message: 'Post deleted successfully' });
            }

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        const finalSnapshot = await get(postRef);
        return NextResponse.json({ id: postId, ...finalSnapshot.val() });

    } catch (error) {
        console.error(`Firebase action '${action}' error:`, error);
        return NextResponse.json({ message: 'Failed to perform action on Firebase post' }, { status: 500 });
    }
}
