# Warrity - Warranty Management Application

<p align="center">
  <img src="/public/icons/icon-192x192.png" alt="Warrity Logo" width="100" />
</p>

## Overview

Warrity is a modern, mobile-friendly web application designed to help users manage and track their product warranties. With an intuitive interface and powerful features, Warrity makes it easy to keep track of warranty expiration dates, product details, and important documents all in one place.

## Features

### Core Functionality

- **Warranty Management**: Add, edit, view, and delete product warranties
- **Dashboard**: Get an overview of all active warranties and those expiring soon
- **Product Details**: Store comprehensive product information including brand, model, and category
- **Document Storage**: Upload and store receipts and warranty documentation
- **Expiration Tracking**: Automatic tracking of warranty expiration dates
- **Reminder System**: Set up reminders for expiring warranties

### Technical Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Offline Support**: Continue working even when the server is unavailable
- **Client-side Caching**: Reduces API calls and provides a smoother experience
- **Rate Limiting Handling**: Graceful degradation when API rate limits are reached
- **Progressive Web App (PWA)**: Install as a native-like app on supported devices

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS
- **State Management**: React Query, Context API
- **Authentication**: JWT-based authentication
- **API Communication**: Fetch API with custom error handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/warrity-mobile-react.git
   cd warrity-mobile-react
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
/src
  /app             # Next.js app router pages
  /components      # React components
    /ui            # UI components
    /warranty      # Warranty-specific components
  /contexts        # React context providers
  /hooks           # Custom React hooks
  /lib             # Utility functions and API client
  /types           # TypeScript type definitions
/public            # Static assets
```

## Key Features in Detail

### Warranty Dashboard

The dashboard provides a quick overview of all warranties with a modern, card-based layout. Users can see at a glance which warranties are active, expiring soon, or already expired.

### Warranty Detail View

Detailed view of each warranty including product information, purchase details, warranty terms, and attached documents.

### Offline Support

The application implements client-side caching to allow users to continue working even when the server is unavailable or rate-limiting requests. Changes are stored locally and synchronized when the connection is restored.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
