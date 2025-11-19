import "./globals.css";
import Layout from "@/components/Layout";
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: "DronAlert",
  description: "System zgłaszania incydentów z dronami",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <div className="layout-wrapper">
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
