import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-20">
      <p className="text-sm font-medium text-gray-400">Research Platform</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
        The easiest way to get your first publication.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-gray-600">
        A UK platform connecting students and healthcare professionals with
        research opportunities, collaborators, and supervisors — not just for the
        well-connected.
      </p>

      <div className="mt-8 flex gap-3">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
