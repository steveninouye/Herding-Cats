import { component$ } from "@builder.io/qwik";
import styles from "./header.module.css";

export default component$(() => {
  return (
    <header class={styles.header}>
      <div class={["container", styles.wrapper]}>
        <div class={styles.logo}>
          <a href="/" title="Herding Cats">
            <span class={styles.logoEmoji}>🐱</span>
            <span class={styles.logoText}>Herding Cats</span>
          </a>
        </div>
        <ul>
          <li>
            <a href="/login">Log In</a>
          </li>
          <li>
            <a href="/invite" class={styles.inviteBtn}>
              Request Invite
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
});