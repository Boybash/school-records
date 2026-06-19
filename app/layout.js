import Providers from "./provider";
import "./globals.css";

export const metadata = {
  title: "School Records",
  description: "School Records Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
