import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(json());

// Define custom interface for Request with user property
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

// Auth middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  try {
    const secret = process.env.VITE_JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Check admin middleware
const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication routes
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // In a real app, you would hash the password and compare with stored hash
    // For now, we'll do a simple comparison (NOT SECURE - just for demo)
    if (password !== user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const secret = process.env.VITE_JWT_SECRET as string;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn: '24h' }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // In a real app, you would hash the password before storing
    // For now, we'll store it as is (NOT SECURE - just for demo)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, this should be hashed
        role: 'USER', // Default role
      },
    });

    // Generate JWT token
    const secret = process.env.VITE_JWT_SECRET as string;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        role: newUser.role 
      },
      secret,
      { expiresIn: '24h' }
    );

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error during signup' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, isAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    // Only admins can update role
    if (role && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can update roles' });
      return;
    }
    
    // Users can only update their own profile unless they're an admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Avatar update endpoint
app.put('/api/users/:id/avatar', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    
    // Users can only update their own avatar unless they're an admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only update your own avatar' });
      return;
    }
    
    // Validate the avatar data
    if (!avatar || typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
      res.status(400).json({ error: 'Invalid avatar format' });
      return;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { avatar },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Error updating avatar' });
  }
});

// Delete user
app.delete('/api/users/:id', authenticateToken, isAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Event routes
app.get('/api/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status as string }),
        status: 'APPROVED', // Only return approved events
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

app.get('/api/events/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { 
        id,
        status: 'APPROVED', // Only return approved events
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching event' });
  }
});

app.post('/api/events', authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { title, description, content, date, location, image, clubId } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        content,
        date: new Date(date),
        location,
        image,
        userId: req.user.id,
        status: 'APPROVED', // Auto-approve events created by admins
        ...(clubId && { clubId }),
      },
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.put('/api/events/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, content, date, location, image } = req.body;
    
    // Check if user is the creator or an admin
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    if (event.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to update this event' });
      return;
    }
    
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        content,
        ...(date && { date: new Date(date) }),
        location,
        image,
      },
    });
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if user is the creator or an admin
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    if (event.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to delete this event' });
      return;
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Event approval/rejection (admin only)
app.post('/api/events/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    
    // Notify the event creator
    await prisma.notification.create({
      data: {
        userId: event.userId,
        message: `Your event "${event.title}" has been approved.`,
        type: 'success',
      },
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error approving event' });
  }
});

app.post('/api/events/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    
    // Notify the event creator
    await prisma.notification.create({
      data: {
        userId: event.userId,
        message: `Your event "${event.title}" has been rejected.`,
        type: 'error',
      },
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting event' });
  }
});

// Event participation
app.post('/api/events/:id/join', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, status: true, title: true },
    });
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    if (event.status !== 'APPROVED') {
      res.status(400).json({ error: 'Event is not approved yet' });
      return;
    }
    
    // Check if user already joined
    const existingJoin = await prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    if (existingJoin) {
      res.status(400).json({ error: 'Already joined this event' });
      return;
    }
    
    // Join the event
    await prisma.eventUser.create({
      data: {
        eventId: id,
        userId,
      },
    });
    
    res.status(201).json({ message: 'Joined event successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error joining event' });
  }
});

app.delete('/api/events/:id/join', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if the join entry exists
    const join = await prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    if (!join) {
      res.status(404).json({ error: 'Not joined this event' });
      return;
    }
    
    // Leave the event
    await prisma.eventUser.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error leaving event' });
  }
});

// Club routes
app.get('/api/clubs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    const clubs = await prisma.club.findMany({
      where: {
        ...(status && { status: status as string }),
        status: 'ACTIVE', // Only return active clubs
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clubs' });
  }
});

app.get('/api/clubs/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { 
        id,
        status: 'ACTIVE', // Only return active clubs
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        events: {
          where: {
            status: 'APPROVED',
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }
    
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club' });
  }
});

// Update club
app.put('/api/clubs/:id', authenticateToken, isAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const club = await prisma.club.findUnique({
      where: { id },
    });
    
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }
    
    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        name,
        description,
        status,
      },
    });
    
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ error: 'Error updating club' });
  }
});

// Delete club
app.delete('/api/clubs/:id', authenticateToken, isAdmin as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id },
    });
    
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }
    
    // Delete the club
    await prisma.club.delete({
      where: { id },
    });
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting club' });
  }
});

app.post('/api/clubs', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, content, image } = req.body;
    
    const club = await prisma.club.create({
      data: {
        name,
        description,
        content,
        image,
        userId: req.user.id,
      },
    });
    
    // Add creator as an admin member
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });
    
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club' });
  }
});

// Admin dashboard stats
app.get('/api/admin/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const clubCount = await prisma.club.count();
    const pendingEvents = await prisma.event.count({
      where: { status: 'PENDING' },
    });
    
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json({
      stats: {
        userCount,
        eventCount,
        clubCount,
        pendingEvents,
      },
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

// Join club
app.post('/api/clubs/:id/join', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId: userId
          }
        }
      }
    });

    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    // Check if user is already a member
    if (club.members.length > 0) {
      res.status(400).json({ error: 'You are already a member of this club' });
      return;
    }

    // Add user as a member
    const member = await prisma.clubMember.create({
      data: {
        clubId: id,
        userId: userId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ error: 'Error joining club' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 