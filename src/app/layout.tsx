import "./globals.css";

export const metadata = {
  title: "Weekly Life Plan",
  description: "Generate a weekly life plan you can save, share, and re-run.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
