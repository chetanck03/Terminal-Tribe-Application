import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for email
const askForEmail = () => {
  return new Promise((resolve) => {
    rl.question('Enter the email of the user you want to make an admin: ', (email) => {
      resolve(email);
    });
  });
};

// Function to confirm action
const confirmAction = (email) => {
  return new Promise((resolve) => {
    rl.question(`Are you sure you want to make ${email} an admin? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

// Main function to make a user an admin
async function makeUserAdmin(email) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`User with email ${email} not found. Please make sure the user has registered.`);
      return false;
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
    const email = await askForEmail();
    
    if (!email) {
      console.log('Email is required');
      rl.close();
      return;
    }

    const confirmed = await confirmAction(email);
    
    if (confirmed) {
      const success = await makeUserAdmin(email);
      if (success) {
        console.log('✅ Admin user created successfully!');
        console.log('You can now log in with this account and access the admin panel.');
      }
    } else {
      console.log('Operation cancelled');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Start the script
run(); 