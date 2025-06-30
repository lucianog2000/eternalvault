# EternalVault - Digital Legacy Platform

A secure platform for protecting and transmitting digital legacy information, now powered by **Supabase Auth** for robust user management.

## 🚀 Features

### Authentication (Supabase)
- **Secure Registration**: Email + password with profile creation
- **User Login**: Persistent sessions with automatic token refresh
- **Session Management**: Automatic session detection and restoration
- **Profile Management**: Update user information
- **Secure Logout**: Complete session cleanup

### Core Features
- **Legacy Capsules**: Secure storage for passwords, messages, instructions, and digital assets
- **AI Guardian Angel**: Empathetic AI assistant for legacy access
- **Access Key System**: Granular control over who can access specific information
- **Life Verification**: Automatic detection system for legacy activation
- **Self-Destructing Capsules**: Messages that destroy after reading
- **RevenueCat Integration**: Premium subscription management

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📋 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd eternalvault
npm install
```

### 2. Supabase Setup
1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to Settings > API to get your credentials
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup
Create the profiles table in your Supabase database:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Run the Application
```bash
# Start the development server
npm run dev

# Or start with JSON server for legacy features
npm run dev:full
```

## 🔐 Authentication Flow

### Registration
1. User provides email, password, and full name
2. Supabase creates auth user with metadata
3. Profile record is automatically created via trigger
4. User receives email verification (if enabled)
5. Life verification service is activated

### Login
1. User provides email and password
2. Supabase validates credentials
3. Session is established and persisted
4. User profile is loaded from database
5. Life verification service confirms user is active

### Session Management
- Sessions are automatically refreshed by Supabase
- User state is maintained across browser refreshes
- Logout clears all session data

## 🏗️ Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── types/
│   └── auth.ts              # Authentication type definitions
├── contexts/
│   ├── AuthContext.tsx      # Supabase auth context
│   ├── CapsuleContext.tsx   # Capsule management
│   └── LegacyContext.tsx    # Legacy access system
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx    # Supabase login form
│   │   └── RegisterForm.tsx # Supabase registration form
│   └── ...
├── pages/
│   ├── Dashboard.tsx        # User dashboard
│   ├── Settings.tsx         # Profile management
│   └── ...
└── services/
    ├── lifeVerificationService.ts
    └── ...
```

## 🔑 Environment Variables

Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Key Features

### User Management
- **Real Authentication**: Powered by Supabase Auth
- **Profile System**: User profiles with customizable information
- **Session Persistence**: Automatic session restoration
- **Security**: Built-in protection against common attacks

### RevenueCat Integration
- Uses Supabase user ID for subscription management
- Seamless premium upgrade flow
- Persistent user identification across sessions

### Legacy Features
- All existing capsule and access key functionality
- AI chat system with contextual responses
- Life verification with real user sessions
- Self-destructing messages

## 🚀 Deployment

The application is configured for easy deployment to platforms like Netlify, Vercel, or any static hosting service.

### Build for Production
```bash
npm run build
```

### Environment Setup
Ensure your production environment has the correct Supabase credentials configured.

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure session management
- **Email Verification**: Optional email confirmation
- **Password Requirements**: Configurable password policies
- **Session Timeout**: Automatic session expiration

## 📱 Mobile Support

The application is fully responsive and works seamlessly on:
- Desktop browsers
- Mobile devices
- Tablets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@eternalvault.com
- Documentation: [Supabase Docs](https://supabase.com/docs)
- Issues: GitHub Issues

---

**EternalVault** - Protecting your digital legacy with enterprise-grade security powered by Supabase.