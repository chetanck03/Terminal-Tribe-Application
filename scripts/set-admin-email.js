import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const EMAIL_TO_MAKE_ADMIN = 'chetanck1230@gmail.com';

// Main function to make a user an admin
async function makeUserAdmin(email) {
  try {
    console.log(`Attempting to make ${email} an admin...`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`User with email ${email} not found. Please make sure the user has registered.`);
      
      // If user doesn't exist, create one with admin role
      console.log(`Creating new admin user with email ${email}...`);
      try {
        const newUser = await prisma.user.create({
          data: {
            email,
            name: 'Admin User',
            password: 'changeme', // This should be changed on first login
            role: 'ADMIN'
          }
        });
        console.log(`Created new admin user with ID: ${newUser.id}`);
        return true;
      } catch (createError) {
        console.error('Error creating new admin user:', createError);
        return false;
      }
    }

    // Update the user role to ADMIN
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`Successfully made ${email} an admin!`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}

// Run the script
async function run() {
  try {
    const success = await makeUserAdmin(EMAIL_TO_MAKE_ADMIN);
    if (success) {
      console.log('✅ Admin user set successfully!');
      console.log('You can now log in with this account and access the admin panel.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Start the script
run(); 