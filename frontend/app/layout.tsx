import type { Metadata } from 'next';
import './globals.css';
import Navigation from './components/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';
// The ThemeHandler component is a client component that handles the theme switching logic.
// It is a separate component because the root layout is a server component and cannot contain client-side logic.
import { ThemeHandler } from './ThemeHandler';

export const metadata: Metadata = {
  title: 'Codebase Q&A with Proof',
  description: 'Ask questions about your codebase with cited references',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ThemeHandler>
            <Navigation />
            <main className="max-w-4xl mx-auto px-6 py-12">
              {children}
            </main>
          </ThemeHandler>
        </ThemeProvider>
      </body>
    </html>
  );
}