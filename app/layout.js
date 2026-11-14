export const metadata = {
  title: '3D Interactive Scene',
  description: 'Interactive Three.js playground',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflow: 'hidden', background: '#14110e' }}>{children}</body>
    </html>
  );
}