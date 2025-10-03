import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'Notre Dame of Kidapawan College - RFID Attendance System',
  description: 'RFID Classroom Attendance Management System for Notre Dame of Kidapawan College',
  keywords: 'Notre Dame, Kidapawan, RFID, Attendance, School Management System',
  authors: [{ name: 'Notre Dame of Kidapawan College' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Notre Dame RFID System" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}