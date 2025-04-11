import { Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export interface ClubCardProps {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  image?: string;
  isJoined?: boolean;
}

export function ClubCard({ id, name, description, members, category, image, isJoined }: ClubCardProps) {
  return (
    <Card className="overflow-hidden card-shine h-full flex flex-col border-white/30 shadow-sm hover:shadow-xl">
      <div className="aspect-[16/9] relative overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000'} 
          alt={name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"></div>
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-campus-purple to-campus-blue border-none shadow-md">
          {category}
        </Badge>
      </div>
      <CardContent className="pt-5 px-5 flex-grow">
        <h3 className="text-xl font-bold line-clamp-1 text-gradient">{name}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
        
        <div className="flex items-center mt-4 bg-campus-purple/10 px-3 py-2 rounded-lg w-fit">
          <Users className="mr-2 h-4 w-4 text-campus-purple" />
          <span className="text-sm font-medium">{members} members</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-5 px-5">
        <Link to={`/clubs/${id}`} className="w-full">
          <Button 
            variant={isJoined ? "subtle" : "gradient"} 
            className={`w-full ${isJoined ? "" : "shadow-md hover:shadow-lg"}`}
          >
            {isJoined ? 'View Club' : 'Join Club'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
