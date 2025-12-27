# PDF Signer - Client-Side PDF Signing Application

This is a [Next.js](https://nextjs.org) application that allows users to sign PDF documents securely in their browser. **All PDF processing happens entirely client-side** - no data is ever sent to any server.

## Features

### 🔒 100% Private & Secure
- PDF processing entirely in browser using JavaScript
- No server-side API routes for PDF processing
- Documents never leave your computer
- All operations use client-side libraries

### ✨ Core Functionality
1. **PDF Upload** - Upload PDF files via file input
2. **PDF Preview** - View uploaded PDFs in an iframe
3. **Signature Drawing** - Draw signatures using mouse or touch
4. **Signature Positioning** - Adjust X/Y position with sliders
5. **Apply Signature** - Embed signature into PDF document
6. **Download** - Download the signed PDF

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **pdf-lib** - Client-side PDF manipulation
- **react-signature-canvas** - Signature drawing
- **Radix UI** - Accessible UI components
- **Sonner** - Toast notifications
- **Geist Font** - Typography

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the application.

The development server runs on port 8000 by default (configured in package.json).

## How to Use

1. **Upload a PDF** - Click "Choose PDF File" and select a PDF document
2. **Draw Your Signature** - Click "Draw Signature" to open the signature pad
3. **Position the Signature** - Use the horizontal and vertical sliders to adjust placement
4. **Apply Signature** - Click "Apply Signature to PDF" to embed your signature
5. **Download** - Click "Download Signed PDF" to save the signed document

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout with font setup and toaster
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── PDFSigner.tsx     # Main PDF signing component
│   └── ui/               # Reusable UI components (Radix UI)
└── lib/
    └── utils.ts          # Utility functions
```

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Privacy & Security

This application is designed with privacy as the top priority:

- **No Backend Required** - All PDF processing happens in the browser
- **No Data Transmission** - PDFs are never uploaded to any server
- **Client-Side Only** - Uses `pdf-lib` for PDF manipulation and `URL.createObjectURL()` for file handling
- **Open Source** - All code is transparent and auditable

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
