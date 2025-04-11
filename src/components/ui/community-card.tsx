import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  category?: string;
  image?: string;
  isJoined?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export const CommunityCard = ({
  id,
  name,
  description,
  memberCount,
  postCount,
  category,
  image,
  isJoined,
  onJoin,
  onLeave
}: CommunityCardProps) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      {image && (
        <div className="relative h-32">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {category && (
            <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {category}
            </span>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{postCount} posts</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isJoined ? (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onLeave}
          >
            Leave Community
          </Button>
        ) : (
          <Button 
            className="flex-1"
            onClick={onJoin}
          >
            Join Community
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to={`/communities/${id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}; 