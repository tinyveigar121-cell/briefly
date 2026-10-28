# Briefly

A professional web application that helps graphic designers, artists, and freelancers turn vague client requests into clear, structured project briefs.

## Features

- **Authentication**: Secure user registration and login with Supabase Auth
- **Dashboard**: Create, edit, save, and manage all your project briefs
- **Interactive Forms**: Adaptive forms for Logo Design, Branding, Social Media, and Web Design projects
- **Professional Briefs**: Auto-generates structured briefs with goals, target audience, visual direction, colors, deliverables, requirements, and notes
- **Preview & Export**: Preview, edit, copy to clipboard, and export as PDF
- **Secure Storage**: All data stored securely in Supabase with row-level security
- **Stunning Design**: Bold dark theme with animated gradients, particles, and smooth transitions
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Respects reduced-motion preferences

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Supabase](https://supabase.com/) for authentication and database
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF export

## Setup Instructions

### 1. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API to get your URL and anon key
4. Go to the SQL Editor and run this schema:

`sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  client_name TEXT,
  goals TEXT,
  target_audience TEXT,
  visual_direction TEXT,
  colors TEXT,
  deliverables TEXT,
  requirements TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY \"Users can view their own projects\" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY \"Users can create their own projects\" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY \"Users can update their own projects\" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY \"Users can delete their own projects\" ON projects
  FOR DELETE USING (auth.uid() = user_id);
`

### 2. Configure the app

1. Open pp.js
2. Replace YOUR_SUPABASE_URL with your Supabase project URL
3. Replace YOUR_SUPABASE_ANON_KEY with your Supabase anon/public key

### 3. Run locally

Simply open index.html in a modern web browser, or use a local server:

`ash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
`

Then navigate to http://localhost:8000

## Usage

1. Create an account or sign in
2. Click \"New Brief\" from the dashboard
3. Fill in the project details across all sections
4. Click \"Generate Brief\" to save and preview
5. From the preview, you can edit, copy, or export as PDF
6. All your briefs are saved in your dashboard

## Design Notes

- **Color Palette**: Deep purple, electric blue, magenta accents on rich dark backgrounds
- **Typography**: Outfit for display, Space Grotesk for body, JetBrains Mono for accents
- **Effects**: Animated gradient orbs, floating particles, glowing elements, smooth transitions
- **Accessibility**: Respects prefers-reduced-motion

## Security

- All authentication handled by Supabase Auth
- Row Level Security ensures users can only access their own projects
- No frontend-only authentication simulation
- All data encrypted in transit and at rest

## License

MIT
