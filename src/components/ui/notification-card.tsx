
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface NotificationCardProps {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  image?: string;
  isUnread?: boolean;
}

export function NotificationCard({ title, description, timestamp, image, isUnread }: NotificationCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isUnread ? "border-l-4 border-l-campus-blue" : ""
    )}>
      <CardContent className="p-4 flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={image} alt={title} />
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
