# Media.net Emergency Response System

A modern emergency response management system built with Next.js, Supabase, and Prisma.

## 🚀 Features

- **Magic Link Authentication** - Passwordless login via Supabase
- **Role-Based Access Control** - Dispatcher and user roles
- **Emergency Management** - Create, track, and assign emergencies
- **Responder Management** - Manage emergency responders and their availability
- **Real-time Updates** - Live data synchronization
- **Type-Safe Database** - Full TypeScript support with Prisma

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo>
   cd frontend
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Set up the database:**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📚 Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 🗄️ Database Schema

- **Profiles** - User profiles with role management
- **Responders** - Emergency responders with skills and availability
- **Emergencies** - Emergency incidents with severity and status tracking
- **EmergencyResponders** - Many-to-many assignments

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Open an issue on GitHub
- Contact the development team
