import type { Metadata } from "next";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Gerency Leads | CRM & E-mail Marketing",
  description: "Gerenciamento inteligente de leads e campanhas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
