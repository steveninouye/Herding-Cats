import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const activeFeature = useSignal(0);

  const features = [
    {
      icon: "fa-users-gear",
      title: "Groups & Events",
      desc: "Create private, visible, or public groups. Organize events with hard-cap RSVPs, waitlists, and priority queuing.",
    },
    {
      icon: "fa-hand-holding-heart",
      title: "Community Karma",
      desc: "Earn Karma by contributing to your community—show up on time, lend a hand, bring gear. Your good vibes come back to you.",
    },
    {
      icon: "fa-location-dot",
      title: "Geo Check-In",
      desc: "Privacy-first geolocation check-in. No location data stored—just a simple confirmation you showed up.",
    },
    {
      icon: "fa-calendar-check",
      title: "Smart RSVPs",
      desc: "The more you contribute, the better your priority. Reliable community members get first dibs on events.",
    },
    {
      icon: "fa-building",
      title: "Venue Management",
      desc: "Register locations, manage reservations, and control calendar visibility. Perfect for facility owners.",
    },
    {
      icon: "fa-envelope-open-text",
      title: "Invite-Only Access",
      desc: "A trusted community starts with trusted people. Every member is vouched for through a tracked invite chain.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      icon: "✉️",
      title: "Get Invited",
      desc: "A current member sends you an invite link to join the platform.",
    },
    {
      step: "2",
      icon: "🤝",
      title: "Join Groups",
      desc: "Find your people—sports leagues, game nights, meetups, and more.",
    },
    {
      step: "3",
      icon: "🎉",
      title: "RSVP & Contribute",
      desc: "Claim your spot and pitch in. Bring gear, help set up, be awesome.",
    },
    {
      step: "4",
      icon: "⭐",
      title: "Earn Karma",
      desc: "Every contribution earns Karma. Track your impact and unlock priority access.",
    },
  ];

  const karmaActions = [
    { label: "Showed up on time", icon: "⏰", positive: true },
    { label: "Brought gear", icon: "🎒", positive: true },
    { label: "Helped out", icon: "🙌", positive: true },
    { label: "Made someone's day", icon: "💛", positive: true },
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
          <p class="hero-badge">🐱 Invite-Only Community Platform</p>
          <h1>
            People Helping People.
            <br />
            <span class="highlight">That's the Whole Idea.</span>
          </h1>
          <p class="hero-subtitle">
            Herding Cats is a community-first event platform where your
            contributions matter. Show up, pitch in, earn Karma—and get
            priority access to the events you love.
          </p>
          <div class="hero-buttons">
            <a href="/login" class="button button-primary">
              Log In
            </a>
            <a href="/invite" class="button button-outline">
              Register with Invite
            </a>
          </div>
          <p class="hero-invite-note">
            🔒 Herding Cats is invite-only. You'll need a current member to
            send you an invite before you can join.
          </p>
        </div>
      </div>

      {/* Karma Preview */}
      <div class="karma-section">
        <div class="container">
          <div class="karma-card">
            <div class="karma-header">
              <h3>🌟 Your Karma Journey</h3>
              <p>
                Every time you contribute to your community, you earn Karma.
                It's our way of saying <strong>thank you</strong> for being
                awesome.
              </p>
            </div>
            <div class="karma-grid">
              {karmaActions.map((action) => (
                <div key={action.label} class="karma-action">
                  <span class="karma-action-icon">{action.icon}</span>
                  <span class="karma-action-label">{action.label}</span>
                  <span class="karma-action-badge">+Karma</span>
                </div>
              ))}
            </div>
            <div class="karma-score-display">
              <div class="karma-score-ring">
                <span class="karma-score-number">92.5</span>
                <span class="karma-score-label">Your Karma</span>
              </div>
              <p class="karma-score-message">
                You're a community rockstar! 🎸 Your contributions have earned
                you priority access to upcoming events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div class="features-section">
        <div class="container container-center">
          <h2>
            Built for <span class="highlight">Community</span>
          </h2>
          <p class="section-subtitle">
            Every feature is designed to make organizing easier and reward the
            people who make events great.
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
                <div class="feature-icon">
                  <i class={`fa-solid ${f.icon}`}></i>
                </div>
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
            Four simple steps to becoming a valued community contributor.
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
            Herding Cats is invite-only—ask a current member to send you an
            invite and start earning Karma today.
          </p>
          <div class="hero-buttons">
            <a href="/login" class="button button-primary">
              Log In
            </a>
            <a href="/invite" class="button button-outline">
              Register with Invite
            </a>
          </div>
          <p class="cta-invite-note">
            Don't have an invite? Ask a friend who's already on the platform to
            invite you. That's how we keep the community trusted and strong. 💛
          </p>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Herding Cats — Invite-Only Community Event Management",
  meta: [
    {
      name: "description",
      content:
        "An invite-only event platform built around community contributions. Organize groups, manage events, earn Karma, and get priority access by being a great community member.",
    },
  ],
};