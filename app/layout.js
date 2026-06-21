import Providers from "./provider";
import "./globals.css";
import Navbar from "./landingPage/component/navbar";

export const metadata = {
  title: "School Records",
  description: "School Records Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

// export function LandingLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//       </head>

//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
