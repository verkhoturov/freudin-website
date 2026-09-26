"use client";

import Link from "next/link";
import { legalConfig, routes, siteConfig } from "@/shared/config";
import { SupportEmailLink } from "@/shared/ui/support-email-link";
import { CodeList, LegalDocument, OperatorDetails } from "@/widgets/legal-document";

// Исходный текст с Google Analytics и Meta Pixel — docs/legal/terms-with-analytics.draft.md

const SITE_HOST = new URL(siteConfig.url).host;

const GOOGLE_SCOPES = ["openid", "userinfo.email", "userinfo.profile"] as const;

function PrivacyPolicyLink() {
  return <Link href={routes.privacy}>Privacy Policy</Link>;
}

function SettingsLink() {
  return <Link href={routes.settings}>Settings</Link>;
}

export function TermsView() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated="September 26, 2026">
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the Freudin website,
        applications, features, and related services available through <strong>{SITE_HOST}</strong>{" "}
        (collectively, the “Service”).
      </p>
      <p>
        The Service is operated by <strong>{legalConfig.operatorName}</strong>, registered in{" "}
        {legalConfig.registrationCountry} under identification number{" "}
        <strong>{legalConfig.registrationNumber}</strong> (“Freudin,” “we,” “us,” or “our”).
      </p>
      <p>
        By accessing or using the Service, you agree to these Terms. If you do not agree to these
        Terms, you must not use the Service.
      </p>

      <h2 id="the-service">1. The Service</h2>
      <p>
        Freudin provides online features, content, and tools made available through the Service.
        Certain features require you to create an account.
      </p>
      <p>
        We may add, modify, suspend, or discontinue any part of the Service. Where reasonably
        possible, we will provide advance notice of material changes that significantly affect
        registered users.
      </p>
      <p>
        The Service is currently provided free of charge. If paid features are introduced in the
        future, their prices and any additional applicable terms will be presented before you make a
        purchase.
      </p>

      <h2 id="eligibility">2. Eligibility</h2>
      <p>You must be at least 16 years old to create an account or use the Service.</p>
      <p>
        If the law applicable in your country requires you to be older to enter into a binding
        agreement or consent to the processing of personal data, you may use the Service only if you
        meet that age requirement or have valid permission from your parent or legal guardian.
      </p>
      <p>By using the Service, you confirm that you meet these requirements.</p>

      <h2 id="account-registration">3. Account registration and Google Sign-In</h2>
      <p>You may create an account or sign in using your Google account.</p>
      <p>
        For authentication purposes, Freudin requests access to the following Google OAuth scopes:
      </p>
      <CodeList items={GOOGLE_SCOPES} />
      <p>
        These permissions allow us to identify your Google account and receive basic profile
        information, including your primary email address, name, profile picture, and Google account
        identifier.
      </p>
      <p>
        We do not receive or store your Google password. We do not request access to your Gmail
        messages, Google Drive files, contacts, calendar, or other Google services.
      </p>
      <p>You are responsible for:</p>
      <ul>
        <li>
          maintaining the security of your Google account and any devices used to access the
          Service;
        </li>
        <li>all activities performed through your Freudin account;</li>
        <li>providing accurate and current information;</li>
        <li>
          promptly notifying us if you believe that your account has been accessed without
          authorization.
        </li>
      </ul>
      <p>
        You must not create an account using another person’s identity or attempt to gain
        unauthorized access to another user’s account.
      </p>
      <p>Your use of Google services is also subject to Google’s own terms and policies.</p>

      <h2 id="acceptable-use">4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service for unlawful, fraudulent, abusive, or harmful purposes;</li>
        <li>violate the rights of Freudin, other users, or third parties;</li>
        <li>upload, publish, or transmit malicious code, malware, or other harmful material;</li>
        <li>interfere with the operation, availability, or security of the Service;</li>
        <li>attempt to access accounts, systems, or data without authorization;</li>
        <li>bypass technical restrictions or security measures;</li>
        <li>
          scrape, crawl, copy, or extract data from the Service through automated means without our
          prior written permission;
        </li>
        <li>use the Service to distribute spam or unsolicited communications;</li>
        <li>impersonate another person or misrepresent your identity or affiliation;</li>
        <li>
          use the Service in a manner that could damage, overload, or impair its infrastructure;
        </li>
        <li>
          reverse engineer or attempt to obtain the source code of the Service, except where such
          restriction is prohibited by applicable law.
        </li>
      </ul>
      <p>
        We may investigate suspected violations and take appropriate action, including restricting
        or terminating access to the Service.
      </p>

      <h2 id="user-content">5. User content</h2>
      <p>
        If the Service allows you to submit, upload, store, or publish text, images, files, or other
        material (“User Content”), you retain ownership of your User Content.
      </p>
      <p>
        You grant us a non-exclusive, worldwide, royalty-free license to host, store, reproduce,
        process, and display your User Content only to the extent necessary to operate, maintain,
        secure, and provide the Service.
      </p>
      <p>
        Your profile — display name, page address (username), bio, profile photo, and links — is
        public. Anyone can view it at {SITE_HOST}/&lt;username&gt; without signing in, and search
        engines may index it. You decide what to publish and can change or remove it at any time in{" "}
        <SettingsLink />.
      </p>
      <p>You are responsible for your User Content and confirm that:</p>
      <ul>
        <li>you own it or have the necessary rights to use it;</li>
        <li>it does not violate applicable law or third-party rights;</li>
        <li>it is not unlawful, harmful, deceptive, defamatory, or malicious.</li>
      </ul>
      <p>
        We may remove or restrict access to User Content if we reasonably believe that it violates
        these Terms, applicable law, or another person’s rights.
      </p>

      <h2 id="intellectual-property">6. Intellectual property</h2>
      <p>
        The Service, including its software, design, branding, interface, text, graphics, and other
        materials provided by us, is owned by or licensed to Freudin and is protected by applicable
        intellectual property laws.
      </p>
      <p>
        Except as expressly permitted by these Terms, you may not copy, modify, distribute, sell,
        license, publicly display, or create derivative works from any part of the Service without
        our prior written permission.
      </p>
      <p>These Terms do not transfer ownership of any intellectual property rights to you.</p>

      <h2 id="cookies">7. Cookies</h2>
      <p>
        We use only cookies and similar technologies that are strictly necessary for the Service to
        work, such as keeping you signed in, or that store settings you choose. We do not use
        analytics or advertising technologies. More information is provided in our{" "}
        <PrivacyPolicyLink />.
      </p>
      <p>
        If we introduce analytics or advertising technologies, we will update our Privacy Policy and
        ask for your consent where required by applicable law.
      </p>

      <h2 id="third-party-services">8. Third-party services and links</h2>
      <p>The Service uses or may contain links to third-party services, including:</p>
      <ul>
        <li>Google Sign-In;</li>
        <li>Supabase, for authentication, database, and file storage;</li>
        <li>Vercel, for hosting and infrastructure;</li>
        <li>Gmail, for our support email;</li>
        <li>websites and services that users link to from their public profiles.</li>
      </ul>
      <p>
        We do not control third-party services and are not responsible for their independent
        content, availability, security, or privacy practices.
      </p>
      <p>
        Your use of a third-party service may be governed by separate terms and policies provided by
        that third party.
      </p>

      <h2 id="suspension-and-termination">9. Account suspension and termination</h2>
      <p>You may stop using the Service at any time.</p>
      <p>
        You can delete your account at any time in <SettingsLink /> → Delete account. Deletion is
        immediate and removes your profile and public page.
      </p>
      <p>
        You may also request deletion of your account by contacting{" "}
        <strong>
          <SupportEmailLink />
        </strong>
        . We may ask you to verify that you are the account owner before completing the request.
      </p>
      <p>We may suspend or terminate your access to the Service if:</p>
      <ul>
        <li>you materially or repeatedly violate these Terms;</li>
        <li>your use creates a security, legal, or operational risk;</li>
        <li>we are required to do so by law or a competent authority;</li>
        <li>continuing to provide the Service to you is no longer reasonably possible.</li>
      </ul>
      <p>
        Where appropriate and legally permitted, we will try to notify you before terminating your
        account.
      </p>
      <p>
        Sections that by their nature should survive termination, including provisions concerning
        intellectual property, disclaimers, liability, and dispute resolution, will remain in
        effect.
      </p>

      <h2 id="availability">10. Availability and changes</h2>
      <p>
        We aim to keep the Service available and functioning properly, but we do not guarantee
        uninterrupted, error-free, or permanently available access.
      </p>
      <p>
        The Service may be temporarily unavailable because of maintenance, updates, technical
        problems, security incidents, failures of third-party providers, or circumstances outside
        our reasonable control.
      </p>
      <p>We may release updates or change the technical requirements for using the Service.</p>

      <h2 id="disclaimer">11. Disclaimer of warranties</h2>
      <p>
        To the maximum extent permitted by applicable law, the Service is provided on an “as is” and
        “as available” basis.
      </p>
      <p>We do not guarantee that:</p>
      <ul>
        <li>the Service will always be available, secure, or free from errors;</li>
        <li>
          all information provided through the Service will be complete, accurate, or suitable for a
          particular purpose;
        </li>
        <li>defects or interruptions will always be corrected immediately;</li>
        <li>the Service will meet every user’s individual requirements.</li>
      </ul>
      <p>
        Nothing in these Terms excludes any warranty or consumer right that cannot lawfully be
        excluded.
      </p>

      <h2 id="limitation-of-liability">12. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Freudin will not be liable for indirect,
        incidental, special, consequential, or punitive damages, or for loss of profits, data,
        reputation, business opportunities, or anticipated savings arising from or related to your
        use of the Service.
      </p>
      <p>We are not responsible for losses caused by:</p>
      <ul>
        <li>unauthorized access resulting from your failure to secure your account;</li>
        <li>third-party services or infrastructure;</li>
        <li>events outside our reasonable control;</li>
        <li>your use of the Service in violation of these Terms.</li>
      </ul>
      <p>
        Nothing in these Terms limits or excludes liability where such limitation or exclusion is
        prohibited by law, including liability for fraud, intentional misconduct, or other liability
        that cannot legally be limited.
      </p>

      <h2 id="indemnification">13. Indemnification</h2>
      <p>
        To the extent permitted by applicable law, you agree to compensate Freudin for reasonable
        losses, liabilities, and expenses arising from your unlawful use of the Service, your
        material violation of these Terms, or your infringement of another person’s rights.
      </p>
      <p>
        This provision does not apply where the relevant loss was caused by our own actions or where
        such an obligation is prohibited by applicable consumer law.
      </p>

      <h2 id="privacy">14. Privacy</h2>
      <p>
        Our collection and use of personal data are described in our <PrivacyPolicyLink />,
        available on the Freudin website.
      </p>

      <h2 id="changes">15. Changes to these Terms</h2>
      <p>
        We may update these Terms to reflect changes to the Service, applicable law, security
        requirements, or our business practices.
      </p>
      <p>
        The updated version will be published on this page with a revised “Last updated” date. If a
        change materially affects your rights or obligations, we will provide reasonable notice
        through the Service or by email where appropriate.
      </p>
      <p>
        Your continued use of the Service after the updated Terms take effect constitutes acceptance
        of the revised Terms, except where applicable law requires us to obtain your explicit
        consent.
      </p>

      <h2 id="governing-law">16. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of Georgia, without regard to conflict-of-law
        principles.
      </p>
      <p>
        Any dispute that cannot be resolved informally will be submitted to the competent courts of
        Georgia, unless mandatory law gives you the right to bring a claim in another jurisdiction.
      </p>
      <p>
        If you are a consumer, nothing in these Terms deprives you of any mandatory protections
        granted by the law of the country in which you reside.
      </p>
      <p>
        Before initiating formal proceedings, you are encouraged to contact us so that we can
        attempt to resolve the issue.
      </p>

      <h2 id="severability">17. Severability</h2>
      <p>
        If any provision of these Terms is found to be invalid or unenforceable, the remaining
        provisions will remain in effect. The invalid provision will be interpreted or replaced to
        reflect its intended purpose as closely as permitted by law.
      </p>

      <h2 id="contact-us">18. Contact us</h2>
      <p>The Service is operated by:</p>
      <OperatorDetails />
    </LegalDocument>
  );
}
