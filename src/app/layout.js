import "./globals.css";
import Layout from "@/components/Layout";

export const metadata = {
  title: "DronAlert",
  description: "System zgłaszania incydentów z dronami",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
