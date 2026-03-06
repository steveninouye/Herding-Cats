// src/routes/index.tsx
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getSessionUser } from "~/server/auth";

/**
 * Redirect logged-in users to dashboard.
 */
export const useRedirectIfAuthed = routeLoader$(async (requestEvent) => {
  const user = await getSessionUser(requestEvent);
  if (user) {
    throw requestEvent.redirect(302, "/dashboard");
  }
  return {};
});

export default component$(() => {
  useRedirectIfAuthed();
  const activeFeature = useSignal(0);

  const features = [
    {
      icon: "⚽",
      title: "Groups & Events",
      desc: "Create private groups. Organize events with hard-cap RSVPs and automatic waitlists.",
    },
    {
      icon: "💛",
      title: "Community First",
      desc: "Built around the idea of people helping people. Show up, pitch in, be awesome.",
    },
    {
      icon: "📋",
      title: "Smart RSVPs",
      desc: "24-person cap with automatic waitlist promotion. Fair, first-come-first-served.",
    },
    {
      icon: "🔗",
      title: "Invite Codes",
      desc: "Share a simple code to grow your group. Easy for everyone.",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      desc: "Works great on any device. RSVP from anywhere.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      desc: "Built on Cloudflare's edge network. Instant page loads worldwide.",
    },
  ];

  const howItWorks = [
    { step: "1", icon: "✉️", title: "Get Invited", desc: "A current member sends you an invite link to join." },
    { step: "2", icon: "🤝", title: "Join Groups", desc: "Find your people — soccer leagues, game nights, and more." },
    { step: "3", icon: "🎉", title: "RSVP & Play", desc: "Claim your spot. First 24 confirmed, rest go to waitlist." },
    { step: "4", icon: "⭐", title: "Have Fun", desc: "Show up, play hard, and enjoy your community." },
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
      <div class="hero-section">
        <div class="container container-center">
          <p class="hero-badge">🐱 Community Event Platform</p>
          <h1>
            People Helping People.
            <br />
            <span class="highlight">That's the Whole Idea.</span>
          </h1>
          <p class="hero-subtitle">
            Herding Cats is a community-first event platform. Organize your
            group, manage RSVPs with a 24-person cap, and automatic waitlist
            promotion.
          </p>
          <div class="hero-buttons">
            <a href="/login" class="button button-primary">
              Log In
            </a>
            <a href="/signup" class="button button-outline">
              Register with Invite
            </a>
          </div>
          <p class="hero-invite-note">
            🔒 Herding Cats is invite-only. You'll need a current member to
            send you an invite before you can join.
          </p>
        </div>
      </div>

      {/* Features */}
      <div class="features-section">
        <div class="container container-center">
          <h2>
            Built for <span class="highlight">Community</span>
          </h2>
          <p class="section-subtitle">
            Every feature is designed to make organizing easier and keep things fair.
          </p>
          <div class="features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                class={`feature-card ${activeFeature.value === i ? "feature-card-active" : ""}`}
                onMouseEnter$={() => {
                  activeFeature.value = i;
                }}
              >
                <div class="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" class="how-it-works-section">
        <div class="container container-center">
          <h2>
            How It <span class="highlight">Works</span>
          </h2>
          <p class="section-subtitle">
            Four simple steps to getting in the game.
          </p>
          <div class="steps-grid">
            {howItWorks.map((item) => (
              <div key={item.step} class="step-card">
                <div class="step-icon">{item.icon}</div>
                <div class="step-number">Step {item.step}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="cta-section">
        <div class="container container-center">
          <h2>
            Ready to Join a Community
            <br />
            That <span class="highlight">Values You</span>?
          </h2>
          <p class="cta-subtitle">
            Ask a current member to send you an invite and start playing today.
          </p>
          <div class="hero-buttons">
            <a href="/login" class="button button-primary">
              Log In
            </a>
            <a href="/signup" class="button button-outline">
              Register with Invite
            </a>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Herding Cats — Community Event Management",
  meta: [
    {
      name: "description",
      content:
        "A community-first event platform. Organize groups, manage RSVPs with a 24-person cap, and automatic waitlist promotion.",
    },
  ],
};
