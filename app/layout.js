import { Inter } from "next/font/google";
import Providers from "./provider";
import "./globals.css";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Shalom Model College",
  description: "Student Records Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
