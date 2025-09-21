import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import Head from "next/head";


const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dawn Portfolio",
  description: "A portfolio website showcasing projects and skills.",
   openGraph: {
    title: "Dawn Portfolio",
    description:
      "A showcase of my projects and skills, powered by AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <Head>
        <title>Dawn Portfolio</title>
        <meta
          name="description"
          content="A showcase of my projects and skills, powered by AI."
        />
        <meta property="og:image" content="./opengraph-image.png"></meta>
        {/* <meta property="og:url" content="https://dashboard.cellprotocol.science"></meta> */}
        <meta
          property="og:title"
          content="Dawn Portfolio - A portfolio website showcasing projects and skills."
        ></meta>
        {/* <meta property="og:site_name" content="https://dashboard.cellprotocol.science"></meta> */}
        <meta
          property="og:description"
          content="A showcase of my projects and skills, powered by AI."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body
        className={`${comfortaa.variable} font-comfortaa antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
