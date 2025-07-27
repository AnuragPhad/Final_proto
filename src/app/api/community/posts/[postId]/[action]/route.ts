
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";
import type { CommunityPost, Comment } from '@/data/community-posts';

export async function POST(
  request: Request,
  { params }: { params: { postId: string; action: string } }
) {
    const { postId, action } = params;

    if (!postId) {
        return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }
    
    const postRef = doc(db, "posts", postId);

    try {
        switch (action) {
            case 'like': {
                const { userName } = await request.json();
                if (!userName) {
                    return NextResponse.json({ message: 'User name is required' }, { status: 400 });
                }
                
                await runTransaction(db, async (transaction) => {
                    const postDoc = await transaction.get(postRef);
                    if (!postDoc.exists()) {
                        throw "Document does not exist!";
                    }
                    const postData = postDoc.data() as CommunityPost;
                    if (postData.likedBy && postData.likedBy.includes(userName)) {
                        // Unlike
                        transaction.update(postRef, { 
                            likes: (postData.likes || 1) - 1,
                            likedBy: arrayRemove(userName)
                        });
                    } else {
                        // Like
                        transaction.update(postRef, { 
                            likes: (postData.likes || 0) + 1,
                            likedBy: arrayUnion(userName)
                        });
                    }
                });
                break;
            }

            case 'comment': {
                const { text, user } = await request.json();
                if (!text || !user) {
                    return NextResponse.json({ message: 'Text and user are required' }, { status: 400 });
                }
                
                const newComment: Omit<Comment, 'id'> = { text, user };
                await updateDoc(postRef, {
                    comments: arrayUnion(newComment)
                });
                break;
            }

            case 'delete': {
                await deleteDoc(postRef);
                return NextResponse.json({ message: 'Post deleted successfully' });
            }

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        const finalSnapshot = await getDoc(postRef);
        if (!finalSnapshot.exists()) {
            return NextResponse.json({ id: postId }); // Post might have been deleted
        }
        return NextResponse.json({ id: postId, ...finalSnapshot.data() });

    } catch (error) {
        console.error(`Firestore action '${action}' error:`, error);
        return NextResponse.json({ message: 'Failed to perform action on Firestore post' }, { status: 500 });
    }
}
