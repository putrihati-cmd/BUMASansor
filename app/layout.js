import './globals.css';

export const metadata = {
  title: 'BUMAS Ansor',
  description: 'Baseline project after hard reset',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}