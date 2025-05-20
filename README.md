# Swiftly AI - Interactive Number Grid

This is a responsive React application that displays a grid of numbered squares across three pages. Users can click on the numbers to assign them one of four statuses: Media, Cafe, Sport EXT, or Sport INT. The application is fully responsive and works on mobile devices, tablets, and desktops.

## Features

- Responsive design for mobile, tablet, and desktop
- Three pages with navigation via top menu
- Grid of numbered squares (54 per page)
- Interactive popup when clicking on a number
- Status selection changes color and updates database
- Supabase integration for data persistence

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Supabase account and project

### Database Setup

1. Create a new Supabase project
2. Create a `numbers` table with the following schema:
   - `id`: int8 (primary key)
   - `number`: text (e.g., "1-01")
   - `page`: int8 (1, 2, or 3)
   - `status`: text (can be "Media", "Cafe", "Sport EXT", "Sport INT", or null)
   - `created_at`: timestamptz

### Environment Configuration

1. Update the `.env` file with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

1. Build the application with `npm run build`
2. Deploy the contents of the `build` folder to your hosting provider

## Technologies Used

- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Supabase for backend database
