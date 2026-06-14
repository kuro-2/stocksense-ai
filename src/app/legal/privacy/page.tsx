import { LegalLayout } from '@/components/layout/LegalLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains what information StockSense AI (&quot;we&quot;, &quot;us&quot;) collects, why we
        collect it, and how you can control it. By using StockSense AI, you agree to this policy.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account information:</strong> your email address and password (handled securely via Supabase Auth).</li>
        <li><strong>Watchlist &amp; portfolio data:</strong> stocks you save, notes you add, and paper trades you place.</li>
        <li><strong>Analysis history:</strong> stocks you&apos;ve analyzed and the AI outputs generated for you.</li>
        <li><strong>Usage data:</strong> basic technical information such as IP address and browser type, for security and debugging.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide core features — authentication, watchlist, portfolio tracking, and analysis history.</li>
        <li>To improve the reliability and accuracy of our AI analysis pipeline.</li>
        <li>To maintain the security of your account and our platform.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal data, and we do not use your email for marketing
        beyond what you explicitly opt into.
      </p>

      <h2>3. Data Storage &amp; Security</h2>
      <p>
        Your data is stored in Supabase (PostgreSQL) with industry-standard security practices, including
        hashed passwords and encrypted connections (HTTPS/TLS). Service role keys and other secrets are
        kept server-side only and never exposed to the browser.
      </p>

      <h2>4. Your Rights (DPDP Act, 2023)</h2>
      <p>Under India&apos;s Digital Personal Data Protection Act, 2023, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate or outdated information.</li>
        <li>Request deletion of your account and associated data — your watchlist, portfolio, and analysis history will be removed.</li>
        <li>Withdraw consent for any optional data processing (e.g. email digests) at any time.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at the email address listed at the bottom of this page.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        We use third-party services to operate StockSense AI, including Supabase (authentication &amp;
        database), Google Gemini (AI analysis generation), and Yahoo Finance (live market data).
        These providers may process limited technical data as part of delivering their service to us, under
        their own privacy policies.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies for authentication and session management only. We do not use third-party
        advertising or tracking cookies.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of this
        page reflects the most recent changes. Continued use of StockSense AI after changes constitutes
        acceptance of the updated policy.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or wish to exercise your data rights, please reach
        out via the contact details provided on our website.
      </p>
    </LegalLayout>
  );
}
