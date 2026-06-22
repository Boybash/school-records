import { Manrope } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Shalom Model College",
  description: "Student Records Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${manrope.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
