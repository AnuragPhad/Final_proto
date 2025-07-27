
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Send, Trash2, Paperclip, X } from 'lucide-react';
import type { Comment, CommunityPost } from '@/data/community-posts';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useCommunityPosts } from '@/hooks/use-community-posts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';


export default function CommunityClient() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, isLoading, addPost, likePost, addComment, deletePost } = useCommunityPosts();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if ((newPostContent.trim() || newPostImage) && user) {
        await addPost(
          newPostContent, 
          {
            name: user.name,
            avatar: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
          }, 
          newPostImage
        );
        setNewPostContent('');
        setNewPostImage(null);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Login Required',
            description: 'You must be logged in to like a post.',
        });
        return;
    }
    likePost(postId);
  };

  const toggleCommentInput = (postId: string) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Login Required',
            description: 'You must be logged in to comment on a post.',
        });
        return;
    }
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentContent(''); // Reset content when switching
    }
  };

  const handlePostComment = async (postId: string) => {
    if (commentContent.trim() && user) {
        const newCommentUser = {
            name: user.name,
            avatar: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
        };
        await addComment(postId, commentContent, newCommentUser);
        setCommentContent('');
    }
  }

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
  }
  
  const getCommentsForPost = (post: CommunityPost): Comment[] => {
    return post.comments ? Object.keys(post.comments).map(key => ({ id: key, ...((post.comments as any)[key]) })) : [];
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
            {t.community_title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
            {t.community_subtitle}
          </p>
        </div>

        {user && (
            <Card className="mb-8">
            <CardHeader>
                <h2 className="text-lg font-semibold">{t.create_post_title}</h2>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-2">
                    <Textarea 
                        placeholder={t.create_post_placeholder}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    {newPostImage && (
                        <div className="relative mt-2">
                            <Image src={newPostImage} alt="Preview" width={100} height={100} className="rounded-md border" />
                            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => setNewPostImage(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <Input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
            </CardContent>
             <CardFooter className="justify-between">
                <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Photo
                </Button>
                <Button onClick={handlePost} disabled={(!newPostContent.trim() && !newPostImage) || isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {t.create_post_button}
                </Button>
             </CardFooter>
            </Card>
        )}

        <div className="space-y-6">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-12 w-full" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))
          ) : (
            posts.map((post) => {
                const isLiked = post.isLikedByCurrentUser;
                const isOwnPost = user && user.name === post.user.name;
                const comments = getCommentsForPost(post);

                return (
                    <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar>
                        <AvatarImage src={post.user.avatar} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <p className="font-semibold">{post.user.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</p>
                        </div>
                        {isOwnPost && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your post.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        {post.image && (
                        <div className="mt-4 rounded-lg overflow-hidden border">
                            <Image
                            src={post.image}
                            alt="Post image"
                            width={600}
                            height={400}
                            className="object-cover w-full h-auto"
                            data-ai-hint="farm harvest"
                            />
                        </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-2 border-t flex-col items-stretch">
                        <div className="flex w-full justify-around">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn("flex-1 gap-2", isLiked && "text-primary")}
                                onClick={() => handleLike(post.id)}
                            >
                                <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} /> {t.like_button} {post.likes > 0 && `(${post.likes})`}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => toggleCommentInput(post.id)}>
                                <MessageSquare className="h-4 w-4" /> {t.comment_button} {comments.length > 0 && `(${comments.length})`}
                            </Button>
                        </div>
                        {(activeCommentId === post.id || comments.length > 0) && (
                            <div className="p-4 pt-2 border-t w-full mt-2">
                                <div className="space-y-4">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                                                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-background rounded-lg p-2 flex-1">
                                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {activeCommentId === post.id && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <Input 
                                            placeholder="Add a comment..." 
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            className="flex-1"
                                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                                        />
                                        <Button size="sm" onClick={() => handlePostComment(post.id)} disabled={!commentContent.trim()}>
                                            Post
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardFooter>
                    </Card>
                )
            })
          )}
        </div>
      </div>
    </div>
  );
}
