import { component$ } from "@builder.io/qwik";
import { QwikLogo } from "../icons/qwik";
import styles from "./header.module.css";

export default component$(() => {
  return (
   <header class="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <a href="/" class="flex items-center space-x-2 text-white no-underline">
        <span class="text-2xl">🐱</span>
        <span class="text-xl font-bold">Herding Cats</span>
      </a>
      <div class="flex items-center space-x-4">
        <a href="/login" class="text-gray-400 hover:text-white transition text-sm">Log In</a>
        <a href="/invite" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          Request Invite
        </a>
      </div>
    </header>
  );
});
