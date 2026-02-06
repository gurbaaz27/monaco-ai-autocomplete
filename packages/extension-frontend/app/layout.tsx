import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monaco AI - Intelligent Code Completion for Every Editor',
  description: 'Add Cursor-style AI autocompletion to any Monaco editor. Works on Godbolt, StackBlitz, and more. Open source, privacy-first.',
  keywords: ['Monaco', 'AI', 'Autocomplete', 'Code Completion', 'Chrome Extension', 'Godbolt'],
  openGraph: {
    title: 'Monaco AI',
    description: 'Intelligent Code Completion for Every Editor',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
