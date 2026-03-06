// src/components/Header.tsx
import { component$, useSignal } from "@builder.io/qwik";

interface HeaderProps {
  user?: { displayName: string; email: string } | null;
}

export const Header = component$<HeaderProps>(({ user }) => {
  const menuOpen = useSignal(false);

  return (
    <header class="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={user ? "/dashboard" : "/"} class="flex items-center gap-2 no-underline">
          <span class="text-2xl">🐱</span>
          <span class="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Herding Cats
          </span>
        </a>

        {/* Desktop Nav */}
        <nav class="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <a href="/dashboard" class="text-slate-600 hover:text-amber-600 font-medium text-sm transition-colors">
                Dashboard
              </a>
              <a href="/groups" class="text-slate-600 hover:text-amber-600 font-medium text-sm transition-colors">
                Groups
              </a>
              <a href="/groups/join" class="text-slate-600 hover:text-amber-600 font-medium text-sm transition-colors">
                Join Group
              </a>
              <div class="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <span class="text-sm text-slate-500">{user.displayName}</span>
                <a
                  href="/logout"
                  class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Log out
                </a>
              </div>
            </>
          ) : (
            <>
              <a
                href="/login"
                class="text-slate-600 hover:text-amber-600 font-medium text-sm transition-colors"
              >
                Log In
              </a>
              <a
                href="/signup"
                class="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Sign Up
              </a>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          class="md:hidden p-2 text-slate-600 hover:text-amber-600"
          onClick$={() => {
            menuOpen.value = !menuOpen.value;
          }}
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen.value ? (
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen.value && (
        <div class="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          {user ? (
            <>
              <a href="/dashboard" class="block text-slate-600 hover:text-amber-600 font-medium py-2">
                Dashboard
              </a>
              <a href="/groups" class="block text-slate-600 hover:text-amber-600 font-medium py-2">
                Groups
              </a>
              <a href="/groups/join" class="block text-slate-600 hover:text-amber-600 font-medium py-2">
                Join Group
              </a>
              <div class="pt-3 border-t border-slate-100">
                <p class="text-sm text-slate-500 mb-2">{user.displayName}</p>
                <a href="/logout" class="text-red-500 hover:text-red-600 font-medium text-sm">
                  Log out
                </a>
              </div>
            </>
          ) : (
            <>
              <a href="/login" class="block text-slate-600 hover:text-amber-600 font-medium py-2">
                Log In
              </a>
              <a href="/signup" class="block text-amber-600 font-medium py-2">
                Sign Up
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
});
