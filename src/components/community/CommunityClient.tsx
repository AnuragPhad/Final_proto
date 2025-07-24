
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Share2, Send } from 'lucide-react';
import { Comment } from '@/data/community-posts';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useCommunityPosts } from '@/hooks/use-community-posts';

export default function CommunityClient() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, addPost, likePost, addComment } = useCommunityPosts();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const handlePost = () => {
    if (newPostContent.trim() && user) {
        addPost(newPostContent, {
            name: user.name,
            avatar: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
        });
        setNewPostContent('');
    }
  };

  const handleLike = (postId: number) => {
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

  const toggleCommentInput = (postId: number) => {
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

  const handlePostComment = (postId: number) => {
    if (commentContent.trim() && user) {
        const newCommentUser = {
            name: user.name,
            avatar: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
        };
        addComment(postId, commentContent, newCommentUser);
        setCommentContent('');
    }
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
                    <Button onClick={handlePost} disabled={!newPostContent.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        {t.create_post_button}
                    </Button>
                </div>
            </CardContent>
            </Card>
        )}

        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = post.isLikedByCurrentUser;
            return (
                <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
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
                            <MessageSquare className="h-4 w-4" /> {t.comment_button} {post.comments.length > 0 && `(${post.comments.length})`}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2">
                            <Share2 className="h-4 w-4" /> {t.share_button}
                        </Button>
                    </div>
                    {(activeCommentId === post.id || post.comments.length > 0) && (
                        <div className="p-4 pt-2 border-t w-full mt-2">
                            <div className="space-y-4">
                                {post.comments.map(comment => (
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
          })}
        </div>
      </div>
    </div>
  );
}
