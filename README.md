# Sourceable

A mobile-first web app for capturing photos with verifiable time and location metadata.

## Features

- 📸 Capture photos with camera
- 📍 Automatic GPS location capture
- ⏰ Verified timestamps (local + UTC)
- 🔒 Anonymous by default
- 🌐 Public verification pages
- 📱 Mobile-first design
- 🎨 Beautiful UI with Tailwind CSS

## Tech Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (Storage + Postgres)
- Hosting: Vercel

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sourceable.git
   cd sourceable
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Database Schema

The app uses a single table in Supabase:

```sql
create table media_metadata (
  id uuid default uuid_generate_v4() primary key,
  timestamp_local timestamp with time zone not null,
  timestamp_utc timestamp with time zone not null,
  gps_lat double precision not null,
  gps_lng double precision not null,
  media_url text not null,
  public_url text not null unique,
  watermark_url text not null,
  uploader_name text,
  map_snapshot_url text not null,
  qr_code_url text,
  created_at timestamp with time zone default now()
);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 