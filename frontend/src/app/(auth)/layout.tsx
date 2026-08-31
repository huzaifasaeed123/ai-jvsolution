import { Header } from "@/components/layout/Header";
import { AuthPanel } from "@/components/layout/AuthPanel";

/**
 * Split shell for sign-in and registration: the form on the left, live
 * institutional proof on the right. No footer — at this point the visitor is
 * completing one task, and a full sitemap underneath only invites them away.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <main className="flex items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <AuthPanel />
      </div>
    </div>
  );
}
