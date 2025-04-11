# Plore - Setup Guide

This guide will walk you through setting up the Plore application with Supabase authentication and database integration.

## 1. Clone the Repository

If you haven't already, clone the repository to your local machine.

```bash
git clone <repository-url>
cd Terminal-Tribe
```

## 2. Install Dependencies

Install all necessary dependencies:

```bash
npm install
```

## 3. Set Up Supabase

### 3.1 Create a Supabase Account

1. Go to [Supabase.com](https://supabase.com/) and sign up for a free account
2. After logging in, click "New Project"
3. Give your project a name (e.g., "Plore")
4. Set a secure database password (save this for later)
5. Choose a region closest to you
6. Click "Create new project"

### 3.2 Get Your Supabase Credentials

1. Once your project is created, go to the Supabase dashboard
2. In the left sidebar, click on "Project Settings" → "API"
3. Copy your "Project URL" and "anon/public" key

### 3.3 Create Environment Variables

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and update the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://postgres:your-password@your-project-url.supabase.co:5432/postgres
   VITE_JWT_SECRET=your-random-string
   ```

   Replace:
   - `your-project-url` with your Supabase project URL (without the `https://` prefix)
   - `your-anon-key` with your Supabase anon key
   - `your-password` with the database password you set earlier
   - `your-random-string` with any random string (you can generate one [here](https://randomkeygen.com/))

## 4. Set Up the Database with Prisma

### 4.1 Initialize Prisma

Generate the Prisma client based on your schema:

```bash
npx prisma generate
```

### 4.2 Push the Schema to Your Database

Push your Prisma schema to your Supabase PostgreSQL database:

```bash
npx prisma db push
```

This will create all necessary tables in your Supabase database according to the schema defined in `prisma/schema.prisma`.

## 5. Start the Development Server

Start the frontend development server:

```bash
npm run dev
```

The server should now be running at [http://localhost:8080](http://localhost:8080)

## 6. Create Your Admin Account

### 6.1 Register a New User

1. Go to [http://localhost:8080/signup](http://localhost:8080/signup)
2. Create a new account with your email and password
3. You'll need to verify your email (check your inbox for a verification link)

### 6.2 Promote Your User to Admin

There are three ways to make your user an admin:

#### Option 1: Using the Helper Script

We've created a helper script to easily make a user an admin:

1. Make sure you've installed the dependencies:
   ```bash
   npm install dotenv
   ```

2. Run the script:
   ```bash
   node scripts/create-admin.js
   ```

3. Enter your email when prompted and confirm

#### Option 2: Using the Supabase Dashboard

1. Go to your Supabase dashboard
2. Click on "Table Editor" in the sidebar
3. Select the "User" table (not "auth.users")
4. Find your user (search by email)
5. Click on the record to edit
6. Change the "role" field from "USER" to "ADMIN"
7. Click "Save"

#### Option 3: Using SQL

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the sidebar
3. Create a new query
4. Paste the following SQL (replace `your@email.com` with your email):

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your@email.com';
```

5. Click "Run" to execute the query

## 7. Access the Admin Panel

1. After making yourself an admin, go to [http://localhost:8080/login](http://localhost:8080/login)
2. Log in with your email and password
3. Once logged in, you should now see an "Admin Panel" option in the dropdown when you click on your profile picture in the top-right corner
4. Click on "Admin Panel" to access the admin dashboard at `/admin/dashboard`

## 8. Accessing Your Profile Page

Now that we've added a profile page, you can access it in two ways:

1. Click on your avatar in the top-right corner and select "Profile" from the dropdown menu
2. Directly navigate to [http://localhost:8080/profile](http://localhost:8080/profile)

## Troubleshooting

### Authentication Issues

If you're having trouble with authentication:

1. Check that your Supabase URL and anon key are correct in the `.env` file
2. Make sure you've verified your email address
3. Check the browser console for any errors
4. Try clearing your browser cache and local storage

### Database Issues

If you're having issues with the database:

1. Make sure your `DATABASE_URL` is correctly formatted in the `.env` file
2. Check that you have run `npx prisma db push` successfully
3. Verify that the tables have been created in your Supabase database
4. Check that your database password is correct

### Admin Panel Access

If you can't access the admin panel:

1. Verify that your user's role is set to "ADMIN" in the database
2. Make sure you're logged in with the correct account
3. Try logging out and logging back in

## Next Steps

Now that you have set up your Plore application, you can:

1. Add content to the platform
2. Create events and clubs
3. Invite other users to join
4. Customize the application further

Happy exploring with Plore! 