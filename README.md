# WNY AI Website

A single-page React application for Western New York's AI community.

## Features

- Modern, responsive design with interactive 3D animation background
- Email newsletter subscription with Airtable backend
- Dynamic event listing
- Discord community invitation
- Social media links
- Privacy Policy and Terms of Service modals

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Animations**: Three.js, Anime.js
- **Backend**: Airtable (serverless)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/wnyai.git
   cd wnyai
   ```

2. Install frontend dependencies:
   ```bash
   cd wnyai-frontend
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Airtable credentials to `.env.local`

### Development

Run the development server:
```bash
npm run dev
```

### Build

Create a production build:
```bash
npm run build
```

## Airtable Setup

This project uses Airtable as a serverless backend. See [AIRTABLE-SETUP.md](AIRTABLE-SETUP.md) for detailed instructions on setting up your Airtable base.

### Airtable Tables

1. **Subscribers** - Stores email newsletter subscriptions
2. **Events** - Manages upcoming events
3. **Site Content** - Stores site configuration (social links, legal documents)

## Implementation Details

See [AIRTABLE-IMPLEMENTATION.md](AIRTABLE-IMPLEMENTATION.md) for complete details on how Airtable is integrated with the React frontend.

## Deployment

The site can be deployed to any static hosting service:

1. Netlify (recommended with Forms support)
2. Vercel
3. GitHub Pages
4. Firebase Hosting

## License

[MIT](LICENSE)