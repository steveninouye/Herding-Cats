import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const activeFeature = useSignal(0);

  const features = [
    { icon: "fa-users-gear", title: "Groups & Events", desc: "Create private, visible, or public groups. Organize events with hard-cap RSVPs, waitlists, and priority queuing." },
    { icon: "fa-star", title: "Social Score (Karma)", desc: "Gamified reliability tracking. Show up on time, help out, and climb the ranks. Flake out, and you'll feel it." },
    { icon: "fa-location-dot", title: "Geo Check-In", desc: "Privacy-first geolocation check-in. No location data stored—just a simple confirmation you showed up." },
    { icon: "fa-calendar-check", title: "Smart RSVPs", desc: "Priority algorithm rewards reliable members. Your effective RSVP time improves as your Social Score rises." },
    { icon: "fa-building", title: "Venue Management", desc: "Register locations, manage reservations, and control calendar visibility. Perfect for facility owners." },
    { icon: "fa-envelope-open-text", title: "Invite-Only Access", desc: "Quality over quantity. Every member is vouched for through a tracked invite chain." },
  ];

  const howItWorks = [
    { step: "1", title: "Get Invited", desc: "Receive an invite from an existing member to join the platform." },
    { step: "2", title: "Join Groups", desc: "Find or create groups for your activities—sports leagues, game nights, meetups." },
    { step: "3", title: "RSVP to Events", desc: "Claim your spot. Priority goes to members with the best track record." },
    { step: "4", title: "Show Up & Check In", desc: "Arrive on time, check in via geolocation, and build your reputation." },
  ];

  useVisibleTask$(() => {
    const interval = setInterval(() => {
      activeFeature.value = (activeFeature.value + 1) % features.length;
    }, 4000);
    return () => clearInterval(interval);
  });

  return (
    <>
      {/* Hero */}
      <section class="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div class="inline-block bg-indigo-900 bg-opacity-40 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          Invite-Only Event Platform
        </div>
        <h1 class="text-5xl font-extrabold leading-tight mb-6">
          Stop Herding Cats.<br />
          <span class="text-indigo-400">Start Building Culture & Community.</span>
        </h1>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          An invite-only event platform that gamifies reliability. Reward the people who show up,
          and stop letting flakes ruin your plans.
        </p>
        <div class="flex justify-center space-x-4">
          <a href="/login" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg shadow-indigo-900/50 text-base">
            Get Started
          </a>
          <a href="#features" class="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-3 rounded-lg transition text-base">
            Learn More ↓
          </a>
        </div>
      </section>

      {/* Social Score Preview */}
      <section class="max-w-4xl mx-auto px-6 pb-20">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-2">Your Social Score</h3>
            <p class="text-gray-400 text-sm mb-4">
              Every action builds your reputation. On-time arrivals, helping out, and reliability
              boost your score. No-shows and late cancels bring it down.
            </p>
            <div class="flex items-center space-x-6 text-sm">
              <div class="flex items-center space-x-1 text-green-400">
                <span>↑ on_time</span>
              </div>
              <div class="flex items-center space-x-1 text-green-400">
                <span>↑ helped_out</span>
              </div>
              <div class="flex items-center space-x-1 text-red-400">
                <span>↓ no_show</span>
              </div>
              <div class="flex items-center space-x-1 text-red-400">
                <span>↓ late_cancel</span>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 text-center">
            <div class="relative w-32 h-32">
              <svg viewBox="0 0 120 120" class="w-full h-full">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e1b4b" stroke-width="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#6366f1" stroke-width="8"
                  stroke-dasharray="326.7" stroke-dashoffset="32.67" stroke-linecap="round"
                  transform="rotate(-90 60 60)" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-indigo-400">92.5</span>
                <span class="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="max-w-6xl mx-auto px-6 pb-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-3">Built for Reliability</h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Every feature is designed to reward the people who show up and make organizing effortless.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              class={`p-6 rounded-xl border transition-all cursor-pointer ${
                activeFeature.value === i
                  ? "bg-indigo-950 border-indigo-700 shadow-lg shadow-indigo-900/20"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700"
              }`}
              onClick$={() => { activeFeature.value = i; }}
            >
              <h3 class="font-semibold text-base mb-2">{f.title}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section class="max-w-4xl mx-auto px-6 pb-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-3">How It Works</h2>
          <p class="text-gray-400">Four simple steps to a more reliable community.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          {howItWorks.map((item, i) => (
            <div key={i} class="text-center">
              <div class="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h4 class="font-semibold mb-1">{item.title}</h4>
              <p class="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="max-w-4xl mx-auto px-6 pb-20">
        <div class="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-800 rounded-2xl p-12 text-center">
          <h2 class="text-3xl font-bold mb-4">Ready to Stop Herding Cats?</h2>
          <p class="text-indigo-200 mb-8 max-w-lg mx-auto">
            Join an invite-only community that values showing up. Request an invite or ask a member to bring you in.
          </p>
          <a href="/login" class="bg-white text-indigo-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg text-base">
            Request an Invite
          </a>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Herding Cats — Invite-Only Event Management",
  meta: [
    {
      name: "description",
      content: "An invite-only event platform that gamifies reliability. Organize groups, manage events, and reward the people who show up.",
    },
  ],
};