import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";

interface PostCardProps {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export const PostCard = ({
  id,
  content,
  author,
  community,
  createdAt,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  onShare
}: PostCardProps) => {
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card>
      <CardHeader className="space-y-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{author.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatRelativeTime(createdAt)} • 
                <Link 
                  to={`/communities/${community.id}`} 
                  className="hover:underline ml-1"
                >
                  {community.name}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={onLike}
          >
            <Heart
              size={16}
              className={isLiked ? "fill-red-500 text-red-500" : ""}
            />
            {likes}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={onComment}
          >
            <MessageSquare size={16} />
            {comments}
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={onShare}
        >
          <Share2 size={16} />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}; 