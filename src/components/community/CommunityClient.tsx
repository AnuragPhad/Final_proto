
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Share2, Send } from 'lucide-react';
import { communityPostsData } from '@/data/community-posts';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

export default function CommunityClient() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState(communityPostsData);
  const [newPostContent, setNewPostContent] = useState('');

  const handlePost = () => {
    if (newPostContent.trim() && user) {
        const newPost = {
            id: posts.length + 1,
            user: {
                name: user.name,
                avatar: `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`,
            },
            timestamp: 'Just now',
            content: newPostContent,
            likes: 0,
            comments: 0,
        };
        setPosts([newPost, ...posts]);
        setNewPostContent('');
    }
  };


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
                <CardTitle>{t.create_post_title}</CardTitle>
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
          {posts.map((post) => (
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
              <CardFooter className="bg-muted/50 p-2 border-t">
                  <div className="flex w-full justify-around">
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                        <ThumbsUp className="h-4 w-4" /> {t.like_button} {post.likes > 0 && `(${post.likes})`}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                        <MessageSquare className="h-4 w-4" /> {t.comment_button} {post.comments > 0 && `(${post.comments})`}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                        <Share2 className="h-4 w-4" /> {t.share_button}
                    </Button>
                  </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
