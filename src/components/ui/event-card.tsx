import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
  image?: string;
}

export function EventCard({ id, title, date, location, attendees, category, image }: EventCardProps) {
  return (
    <Card className="overflow-hidden card-hover h-full flex flex-col border-white/30 shadow-sm hover:shadow-xl">
      <div className="aspect-[16/9] relative overflow-hidden">
        <img 
          src={image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000'} 
          alt={title}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-campus-blue to-campus-purple border-none shadow-md">
          {category}
        </Badge>
        <h3 className="absolute bottom-3 left-3 text-lg font-semibold line-clamp-1 text-white shadow-text">
          {title}
        </h3>
      </div>
      <CardContent className="pt-4 flex-grow">
        <div className="mt-2 space-y-2.5">
          <div className="flex items-center text-sm">
            <div className="p-1.5 rounded-full bg-campus-blue/10 mr-3">
              <Calendar className="h-4 w-4 text-campus-blue" />
            </div>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="p-1.5 rounded-full bg-campus-purple/10 mr-3">
              <MapPin className="h-4 w-4 text-campus-purple" />
            </div>
            <span className="line-clamp-1 font-medium">{location}</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="p-1.5 rounded-full bg-campus-green/10 mr-3">
              <Users className="h-4 w-4 text-campus-green" />
            </div>
            <span className="font-medium">{attendees} attending</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/events/${id}`} className="w-full">
          <Button variant="gradient" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
