import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { json } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use a secure secret from env

// Middleware
app.use(cors());
app.use(json({ limit: '50mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import API routes from src/server/index.ts
// Since we can't directly import TypeScript files in Node without transpilation,
// we'll need to read the file and extract the routes

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  try {
    // For Supabase tokens, decode the JWT to extract user info
    // In production, you should verify with Supabase's API
    
    // Decode the JWT without verification 
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid token format');
      return res.status(403).json({ error: 'Invalid token format' });
    }
    
    try {
      const decodedToken = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Decoded token user info:', decodedToken.sub);
      
      // Extract user info
      req.user = {
        id: decodedToken.sub,
        email: decodedToken.email || '',
      };
      
      // Check admin status in database
      checkAdminStatus(req, res, next);
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(403).json({ error: 'Invalid token format' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token - ' + error.message });
  }
};

// Helper function to check admin status
const checkAdminStatus = async (req, res, next) => {
  try {
    // Check database for user role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });
    
    // If user exists, set role from database
    if (user) {
      req.user.role = user.role;
      console.log(`User ${req.user.id} has role: ${req.user.role}`);
    } else {
      // If no user found, create one with USER role
      console.log(`User ${req.user.id} not found in database, creating...`);
      try {
        const newUser = await prisma.user.create({
          data: {
            id: req.user.id,
            email: req.user.email,
            role: 'USER'
          }
        });
        req.user.role = newUser.role;
      } catch (createError) {
        console.error('Error creating user:', createError);
        req.user.role = 'USER'; // Default to USER role
      }
    }
    
    next();
  } catch (error) {
    console.error('Admin status check error:', error);
    req.user.role = 'USER'; // Default to USER role on error
    next();
  }
};

// Check admin middleware
const isAdmin = async (req, res, next) => {
  try {
    // For security, always check role from the database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });
    
    const isUserAdmin = user && user.role === 'ADMIN';
    
    if (!isUserAdmin) {
      console.log(`Admin check failed for user ${req.user.id} with role ${user?.role || 'unknown'}`);
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    console.log('Admin access granted for user:', req.user.id);
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Server error in admin check' });
  }
};

// User routes
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
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

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio } = req.body;
    
    // Only admins can update role
    if (role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }
    
    // Users can only update their own profile unless they're an admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        ...(bio && { bio }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Avatar update endpoint
app.put('/api/users/:id/avatar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    
    // Users can only update their own avatar unless they're an admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only update your own avatar' });
    }
    
    // Validate the avatar data
    if (!avatar || typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid avatar format' });
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

app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// API Routes
// Events routes
app.get('/api/events', async (req, res) => {
  try {
    const { status } = req.query;
    
    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status }),
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
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Event creation (admin only)
app.post('/api/events', authenticateToken, isAdmin, async (req, res) => {
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

// Get specific event
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
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
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Error fetching event' });
  }
});

// Event approval (admin only)
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
    console.error('Error approving event:', error);
    res.status(500).json({ error: 'Error approving event' });
  }
});

// Event rejection (admin only)
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
    console.error('Error rejecting event:', error);
    res.status(500).json({ error: 'Error rejecting event' });
  }
});

// Event deletion
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the creator or an admin
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Club routes
app.get('/api/clubs', async (req, res) => {
  try {
    const { status } = req.query;
    
    const clubs = await prisma.club.findMany({
      where: {
        ...(status && { status: status }),
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
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Error fetching clubs' });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id },
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
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ error: 'Error fetching club' });
  }
});

// Update club
app.put('/api/clubs/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const club = await prisma.club.findUnique({
      where: { id },
    });
    
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
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
    console.error('Error updating club:', error);
    res.status(500).json({ error: 'Error updating club' });
  }
});

// Delete club
app.delete('/api/clubs/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id },
    });
    
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    // Delete the club
    await prisma.club.delete({
      where: { id },
    });
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ error: 'Error deleting club' });
  }
});

// Create club
app.post('/api/clubs', authenticateToken, async (req, res) => {
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
    console.error('Error creating club:', error);
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
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

// Test route to fetch a user with connection retry logic
app.get('/api/test-db', async (req, res) => {
  try {
    // First disconnect to ensure clean connection (helps with "prepared statement already exists" error)
    await prisma.$disconnect();
    
    // Then reconnect
    await prisma.$connect();
    
    // Execute query
    const userCount = await prisma.user.count();
    
    res.json({ 
      message: 'Database connection successful', 
      userCount 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Try to disconnect on error to clean up connections
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error during disconnect:', disconnectError);
    }
    
    res.status(500).json({ 
      error: 'Database connection error',
      message: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password - ensure both arguments are strings
    const passwordStr = String(user.password || '');
    const isValidPassword = await bcrypt.compare(String(password), passwordStr);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error during signup' });
  }
});

// Start the server and check database connection
const startServer = async () => {
  try {
    // First disconnect to ensure clean connection
    await prisma.$disconnect();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established successfully');
    
    // Database connection URL (masked for security)
    const dbUrl = process.env.DATABASE_URL || 'No database URL found';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`📊 Database: ${maskedUrl}`);
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 API endpoints available:`);
      console.log(`   - Health check: http://localhost:${PORT}/api/health`);
      console.log(`   - Database test: http://localhost:${PORT}/api/test-db`);
      console.log(`   - Register user: http://localhost:${PORT}/api/auth/register [POST]`);
      console.log(`   - Users: http://localhost:${PORT}/api/users [GET, PUT, DELETE]`);
      console.log(`   - Events: http://localhost:${PORT}/api/events [GET, POST]`);
      console.log(`   - Clubs: http://localhost:${PORT}/api/clubs [GET, POST, PUT, DELETE]`);
      console.log(`   - Admin Dashboard: http://localhost:${PORT}/api/admin/dashboard [GET]`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Handle process termination properly
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
});

startServer(); 