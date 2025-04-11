
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ActivityItemProps {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: {
    type: 'club' | 'event';
    name: string;
    id: string;
  };
  timestamp: Date;
}

export function ActivityItem({ user, action, target, timestamp }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{user.name}</span>{' '}
          <span className="text-muted-foreground">{action}</span>{' '}
          <Link
            to={`/${target.type}s/${target.id}`}
            className="font-medium text-campus-blue hover:underline"
          >
            {target.name}
          </Link>
        </p>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
