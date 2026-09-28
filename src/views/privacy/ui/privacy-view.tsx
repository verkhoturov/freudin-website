"use client";

import Link from "next/link";
import { routes, siteConfig } from "@/shared/config";
import { SupportEmailLink } from "@/shared/ui/support-email-link";
import { CodeList, LegalDocument, OperatorDetails } from "@/widgets/legal-document";

// Исходный текст с Google Analytics и Meta Pixel — docs/legal/privacy-with-analytics.draft.md

const SITE_HOST = new URL(siteConfig.url).host;

const GOOGLE_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
] as const;

const FACEBOOK_PERMISSIONS = ["public_profile", "email"] as const;

const TELEGRAM_SCOPES = ["openid", "profile"] as const;

function SupportEmail() {
  return (
    <strong>
      <SupportEmailLink />
    </strong>
  );
}

function SettingsLink() {
  return <Link href={routes.settings}>Settings</Link>;
}

export function PrivacyView() {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated="September 28, 2026">
      <p>
        This Privacy Policy explains how Freudin collects, uses, stores, and shares personal data
        when you access or use the Freudin website, applications, features, and related services
        available through <strong>{SITE_HOST}</strong> (collectively, the “Service”).
      </p>
      <p>The data controller responsible for your personal data is:</p>
      <OperatorDetails />
      <p>
        In this Privacy Policy, “Freudin,” “we,” “us,” and “our” refer to the controller identified
        above.
      </p>

      <h2 id="personal-data-we-collect">1. Personal data we collect</h2>

      <h3>1.1. Information received through Google Sign-In</h3>
      <p>
        When you register or sign in using your Google account, Freudin requests the following
        Google OAuth scopes:
      </p>
      <CodeList items={GOOGLE_SCOPES} />
      <p>These scopes may allow us to receive and store:</p>
      <ul>
        <li>your unique Google account identifier;</li>
        <li>your primary Google account email address;</li>
        <li>information indicating whether your email address has been verified;</li>
        <li>your full name;</li>
        <li>your given name and family name, where available;</li>
        <li>your Google profile picture;</li>
        <li>your language or locale, where provided;</li>
        <li>
          other basic profile information made available by Google through the authorized profile
          scope.
        </li>
      </ul>
      <p>
        We use this information to identify you, create and manage your Freudin account, display
        your account profile, and allow you to sign in securely.
      </p>
      <p>
        We do not receive or store your Google password. We do not request access to your Gmail
        messages, Google Drive files, contacts, calendar, payment details, or other Google services.
      </p>

      <h3>1.2. Information received through Facebook Login</h3>
      <p>
        When you register or sign in using your Facebook account, Freudin requests the following
        Facebook permissions:
      </p>
      <CodeList items={FACEBOOK_PERMISSIONS} />
      <p>These permissions may allow us to receive and store:</p>
      <ul>
        <li>your Facebook user identifier, which is specific to Freudin;</li>
        <li>
          your email address, if your Facebook account has one and you allow us to receive it;
        </li>
        <li>your first name, last name, and full name;</li>
        <li>your Facebook profile picture.</li>
      </ul>
      <p>
        We use this information to identify you, create and manage your Freudin account, display
        your account profile, and allow you to sign in securely. If you choose to use your Facebook
        profile picture as your Freudin profile photo, we copy it to our storage, and it becomes
        part of your public profile.
      </p>
      <p>
        We do not receive or store your Facebook password. We do not request access to your posts,
        photos, friends list, messages, or pages, and we never post to Facebook on your behalf. We
        do not use information received through Facebook Login for advertising and do not sell it.
      </p>
      <p>
        If your Facebook account does not share an email address, you can still sign in. You may
        optionally add a contact email address when you create your page or later in{" "}
        <SettingsLink />.
      </p>

      <h3>1.3. Information received through Telegram Login</h3>
      <p>
        When you register or sign in using your Telegram account, Freudin requests the following
        Telegram scopes:
      </p>
      <CodeList items={TELEGRAM_SCOPES} />
      <p>These scopes may allow us to receive and store:</p>
      <ul>
        <li>your Telegram account identifier;</li>
        <li>your name as shown in Telegram;</li>
        <li>your Telegram username, if you have one;</li>
        <li>your Telegram profile picture.</li>
      </ul>
      <p>
        We use this information to identify you, create and manage your Freudin account, display
        your account profile, suggest your page address, and allow you to sign in securely. If you
        choose to use your Telegram profile picture as your Freudin profile photo, we copy it to our
        storage, and it becomes part of your public profile.
      </p>
      <p>
        We do not receive your phone number, Telegram login codes, chats, contacts, or messages.
        Telegram shows our bot on the sign-in screen: it is used only for sign-in and does not send
        you messages. We do not use information received through Telegram Login for advertising and
        do not sell it.
      </p>
      <p>
        Telegram does not share an email address with us. You may optionally add a contact email
        address when you create your page or later in <SettingsLink />.
      </p>

      <h3>1.4. Account information</h3>
      <p>We may store information associated with your Freudin account, including:</p>
      <ul>
        <li>your internal Freudin account identifier;</li>
        <li>the identifiers of the Google, Facebook, or Telegram accounts you use to sign in;</li>
        <li>your name and, where available, your email address and Telegram username;</li>
        <li>a contact email address, if you add one because your sign-in account has no email;</li>
        <li>your profile picture;</li>
        <li>your account settings and preferences;</li>
        <li>the date your account was created;</li>
        <li>sign-in and account activity;</li>
        <li>information you submit through the Service.</li>
      </ul>
      <p>
        A contact email address is optional. We use it only to contact you about your account and to
        respond to your requests. It is not verified, is not used to sign in, and is not shown on
        your public profile. You can change or remove it in <SettingsLink />.
      </p>
      <p>
        You can connect more than one sign-in method to your Freudin account and disconnect them in{" "}
        <SettingsLink />, as long as at least one remains connected. Each connected method shares
        the information described for it in Sections 1.1–1.3. After you disconnect a method, you can
        no longer sign in with it, but name and photo details already received from it may remain in
        your account data until you delete your account.
      </p>

      <h3 id="public-profile">1.5. Public profile</h3>
      <p>Freudin lets you create a public personal page. Your public profile consists of:</p>
      <ul>
        <li>your display name;</li>
        <li>your page address (username);</li>
        <li>your bio;</li>
        <li>
          your profile photo, which you upload or choose to copy from your Google, Facebook, or
          Telegram account;
        </li>
        <li>links to your social media profiles and websites;</li>
        <li>
          details about your practice, if you add them: your country and the city where you see
          clients in person, whether you work online or in person, who you work with, your therapy
          approaches, the languages you work in, and your starting price per session;
        </li>
        <li>
          documents you upload, such as diplomas, certificates, or licenses, together with their
          captions.
        </li>
      </ul>
      <p>
        Your public profile is available to anyone at {SITE_HOST}/&lt;username&gt; without signing
        in. It may be indexed by search engines, shared by other people, and copied or cached by
        third parties. Do not add information to your profile that you do not want to make public.
      </p>
      <p>
        Documents are published as soon as you upload them. Before uploading, cover ID numbers,
        dates of birth, signatures, and other details you do not want to make public. The Service
        reduces the image in your browser and removes embedded metadata, such as the location where
        a photo was taken, before uploading it. We store the image and a smaller preview of it. When
        you delete a document in <SettingsLink />, we delete both from our storage.
      </p>
      <p>
        The list of cities is based on data from GeoNames. Choosing a city does not send any
        information to GeoNames.
      </p>
      <p>
        Your email address and sign-in account identifiers are not shown on your public profile. You
        can change or remove your public profile information at any time in <SettingsLink />. If you
        change your page address, your previous address stops working.
      </p>

      <h3>1.6. Technical and usage information</h3>
      <p>
        When you use the Service, we may automatically receive technical and usage information,
        including:
      </p>
      <ul>
        <li>IP address;</li>
        <li>browser type and version;</li>
        <li>device type and operating system;</li>
        <li>language and time-zone settings;</li>
        <li>approximate location based on your IP address;</li>
        <li>pages and features you access;</li>
        <li>actions performed within the Service;</li>
        <li>access dates and times;</li>
        <li>referral URLs and campaign parameters;</li>
        <li>authentication events;</li>
        <li>error reports, security logs, and diagnostic information.</li>
      </ul>

      <h3>1.7. Communications</h3>
      <p>If you contact us, we may collect:</p>
      <ul>
        <li>your name and email address;</li>
        <li>the contents of your message;</li>
        <li>any files or information you choose to provide;</li>
        <li>information necessary to respond to and manage your request.</li>
      </ul>

      <h2 id="cookies">2. Cookies and similar technologies</h2>
      <p>
        We use only cookies and similar technologies that are strictly necessary for the Service to
        work or that store settings you choose. We do not use analytics or advertising cookies.
      </p>
      <h3>Strictly necessary technologies</h3>
      <p>These technologies are required to:</p>
      <ul>
        <li>authenticate users;</li>
        <li>maintain sessions;</li>
        <li>remember security-related settings;</li>
        <li>prevent fraud and abuse;</li>
        <li>ensure that the Service functions correctly.</li>
      </ul>
      <p>We currently use:</p>
      <ul>
        <li>
          <code>sb-…-auth-token</code> cookies, set by our authentication provider Supabase, to keep
          you signed in. They are not accessible to scripts on the page, are kept for up to 400
          days, and are deleted when you sign out;
        </li>
        <li>
          the <code>freudin-google-sign-in</code> and <code>freudin-telegram-sign-in</code> cookies,
          used while you sign in with Google or Telegram to protect the sign-in process. They expire
          after 10 minutes and are deleted when you return to the Service;
        </li>
        <li>
          <code>sb-…-code-verifier</code> cookies, set by Supabase while you sign in with Facebook
          to protect the sign-in process;
        </li>
        <li>
          <code>theme</code> in your browser’s local storage, which remembers whether you chose the
          light, dark, or system theme;
        </li>
        <li>
          <code>freudin:onboarding-draft</code> in your browser’s session storage, which keeps the
          details you enter while creating your page and is deleted when you close the browser tab.
        </li>
      </ul>
      <p>
        Strictly necessary technologies cannot generally be disabled because the Service may not
        function without them. Because we use only these technologies, we do not show a cookie
        consent banner. If we introduce analytics or advertising technologies, we will update this
        Privacy Policy and ask for your consent where required by law.
      </p>
      <p>
        You may also block or delete cookies through your browser settings. Blocking strictly
        necessary cookies may prevent some parts of the Service from working correctly.
      </p>

      <h2 id="how-we-use-personal-data">3. How we use personal data</h2>
      <p>We may use personal data to:</p>
      <ul>
        <li>create and manage your account;</li>
        <li>authenticate you through Google Sign-In, Facebook Login, or Telegram Login;</li>
        <li>display your account profile;</li>
        <li>publish your public profile page;</li>
        <li>provide and operate the Service;</li>
        <li>remember your preferences;</li>
        <li>respond to support requests and communications;</li>
        <li>improve the Service’s content, design, features, and performance;</li>
        <li>maintain the security and integrity of the Service;</li>
        <li>detect and prevent fraud, abuse, unauthorized access, and technical problems;</li>
        <li>diagnose errors and monitor performance;</li>
        <li>enforce our Terms of Service;</li>
        <li>comply with applicable legal obligations;</li>
        <li>establish, exercise, or defend legal claims.</li>
      </ul>
      <p>We do not sell or rent personal data.</p>
      <p>
        We do not use data received through Google Sign-In, Facebook Login, or Telegram Login to
        make credit, employment, insurance, housing, or other similarly significant decisions.
      </p>

      <h2 id="legal-bases">4. Legal bases for processing</h2>
      <p>
        Depending on the circumstances and applicable law, we process personal data on one or more
        of the following legal bases.
      </p>
      <h3>Performance of a contract</h3>
      <p>
        We process account and authentication information when necessary to create your account,
        authenticate you, and provide the Service you request.
      </p>
      <h3>Legitimate interests</h3>
      <p>We may process data when necessary for our legitimate interests, including:</p>
      <ul>
        <li>operating and improving the Service;</li>
        <li>securing accounts and infrastructure;</li>
        <li>preventing fraud and abuse;</li>
        <li>troubleshooting technical problems;</li>
        <li>communicating with users;</li>
        <li>understanding aggregated Service usage;</li>
        <li>protecting our legal rights.</li>
      </ul>
      <p>
        We rely on legitimate interests only where those interests are not overridden by your rights
        and freedoms.
      </p>
      <h3>Consent</h3>
      <p>
        Where required by law, we ask for your consent before using personal data for purposes that
        go beyond providing the Service, such as optional communications. We currently do not use
        analytics, advertising, or other non-essential tracking technologies.
      </p>
      <p>
        You may withdraw your consent at any time by contacting us. Withdrawal does not affect
        processing performed before your consent was withdrawn.
      </p>
      <h3>Legal obligations</h3>
      <p>
        We may process data when necessary to comply with applicable law, a court order, or a lawful
        request from a competent authority.
      </p>

      <h2 id="google-user-data">5. How Google user data is used</h2>
      <p>
        Information received through the <code>openid</code>, <code>userinfo.email</code>, and{" "}
        <code>userinfo.profile</code> scopes is used only to:
      </p>
      <ul>
        <li>identify your Google account;</li>
        <li>create and manage your Freudin account;</li>
        <li>authenticate you when you sign in;</li>
        <li>display basic profile information within the Service;</li>
        <li>communicate with you about your account or support requests;</li>
        <li>maintain account and Service security.</li>
      </ul>
      <p>
        If you choose to use your Google profile picture as your Freudin profile photo, we copy it
        to our storage, and it becomes part of your public profile.
      </p>
      <p>
        We do not use information received through Google Sign-In for advertising audience creation
        or advertising personalization. We do not sell Google user data and do not transfer it to
        third parties, except to the service providers described in Section 6 that host and operate
        the Service, or where required by law.
      </p>
      <p>
        Our use and transfer of information received from Google APIs complies with the Google API
        Services User Data Policy, including the Limited Use requirements where applicable.
      </p>

      <h2 id="how-we-share-personal-data">6. How we share personal data</h2>
      <p>We may share personal data in the following circumstances.</p>
      <h3>Public profile</h3>
      <p>
        Information in your public profile is available to anyone, as described in{" "}
        <a href="#public-profile">Section 1.5</a>.
      </p>
      <h3>Google</h3>
      <p>
        We use Google Sign-In for authentication. Google receives authentication information when
        you sign in and processes it under its own privacy policy and applicable service terms.
      </p>
      <h3>Meta (Facebook)</h3>
      <p>
        We use Facebook Login, provided by Meta Platforms, for authentication. Meta receives
        authentication information when you sign in with Facebook and processes it under its own
        privacy policy and terms.
      </p>
      <h3>Telegram</h3>
      <p>
        We use Telegram Login for authentication. Telegram receives authentication information when
        you sign in with Telegram and processes it under its own privacy policy and terms.
      </p>
      <h3>Service providers</h3>
      <p>We use the following providers to operate the Service:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication, database, and storage of profile photos and
          documents. Your account and profile data are stored in the European Union (Frankfurt,
          Germany);
        </li>
        <li>
          <strong>Vercel</strong> — website hosting and server infrastructure. Server functions run
          in the European Union (Frankfurt, Germany); pages and files may be delivered through
          Vercel’s global network;
        </li>
        <li>
          <strong>Gmail (Google)</strong> — our support email. Messages you send to{" "}
          <SupportEmailLink /> are stored by Google and may be processed outside the European Union,
          including in the United States.
        </li>
      </ul>
      <p>
        We may also use additional providers for email delivery, security and monitoring, error
        diagnostics, and technical support. These providers may process personal data only as
        necessary to provide services to us and subject to appropriate contractual and security
        obligations.
      </p>
      <h3>Legal and safety requirements</h3>
      <p>We may disclose information if we reasonably believe that disclosure is necessary to:</p>
      <ul>
        <li>comply with applicable law or a valid legal request;</li>
        <li>protect the rights, safety, and property of Freudin, our users, or another person;</li>
        <li>investigate fraud, abuse, security incidents, or violations of our Terms;</li>
        <li>establish, exercise, or defend legal claims.</li>
      </ul>
      <h3>Business changes</h3>
      <p>
        If the Service or its relevant assets are transferred, reorganized, or acquired, personal
        data may be disclosed to the parties involved, subject to appropriate confidentiality
        safeguards.
      </p>

      <h2 id="international-data-transfers">7. International data transfers</h2>
      <p>
        Freudin is operated from Georgia. Google, Meta, Telegram, and our service providers may
        process or store information in Georgia, the United States, countries of the European
        Economic Area, or other countries where they or their service providers operate.
      </p>
      <p>These countries may have data protection rules that differ from those in your country.</p>
      <p>
        Where required by applicable law, we and our service providers use appropriate legal,
        contractual, and organizational safeguards for international transfers, which may include
        adequacy decisions, standard contractual clauses, or other legally recognized mechanisms.
      </p>

      <h2 id="data-retention">8. Data retention</h2>
      <p>
        We retain account information for as long as your account remains active or as reasonably
        necessary to provide the Service.
      </p>
      <p>
        If you delete your account or request deletion, we will delete or anonymize personal data
        that is no longer required, without undue delay.
      </p>
      <p>
        Some information may remain temporarily in encrypted or restricted backups until those
        backups are replaced through their normal cycle.
      </p>
      <p>
        We may retain limited information for longer where required by law, necessary for security
        or fraud prevention, or needed to establish, exercise, or defend legal claims.
      </p>

      <h2 id="account-and-data-deletion">9. Account and data deletion</h2>
      <p>
        You can delete your Freudin account at any time in <SettingsLink /> → Delete account. If you
        have not created your page yet, you can delete your account on the page creation screen.
        Deletion takes effect immediately: your account, all connected sign-in methods, public
        profile, profile photos, and documents are deleted, and your public page stops being
        available.
      </p>
      <p>
        You may also request deletion of your Freudin account and associated personal data by
        emailing <SupportEmail />.
      </p>
      <p>
        Please send the request from the email address associated with your account: the email of
        your sign-in account or the contact email address you added. We may ask for additional
        information if reasonably necessary to verify your identity and protect your account. If
        your account has no email address, for example because you sign in with Telegram and did not
        add a contact email, include your page address and Telegram username in the request.
      </p>
      <p>
        After verifying the request, we will delete or anonymize the relevant personal data unless
        retention is required or permitted by law.
      </p>
      <p>
        Copies of your public page that search engines or other third parties have already stored
        may remain available until they update their records.
      </p>
      <p>Deleting your Freudin account does not automatically:</p>
      <ul>
        <li>delete your Google, Facebook, or Telegram account;</li>
        <li>delete information independently controlled by Google, Meta, or Telegram;</li>
        <li>
          remove data that Google, Meta, or Telegram must retain under their own legal obligations.
        </li>
      </ul>
      <p>
        You may separately manage or delete information associated with Google, Facebook, or
        Telegram through their privacy controls. To disconnect Freudin from your Facebook account,
        remove it under Apps and websites in your Facebook settings. Telegram Login does not create
        an ongoing connection: we receive your Telegram information only when you sign in, so
        Freudin does not appear among connected websites in Telegram. To stop sharing it, stop
        signing in with Telegram or delete your Freudin account.
      </p>

      <h2 id="data-security">10. Data security</h2>
      <p>
        We use reasonable technical and organizational measures designed to protect personal data
        against:
      </p>
      <ul>
        <li>unauthorized access;</li>
        <li>accidental loss;</li>
        <li>unlawful use or disclosure;</li>
        <li>alteration or destruction;</li>
        <li>other unauthorized forms of processing.</li>
      </ul>
      <p>
        However, no online service or storage system can guarantee absolute security. You are
        responsible for maintaining the security of the Google, Facebook, or Telegram account and
        devices you use to access Freudin.
      </p>
      <p>
        If you believe your account or personal data has been compromised, contact us promptly at{" "}
        <SupportEmail />.
      </p>

      <h2 id="your-rights">11. Your rights</h2>
      <p>Depending on the law applicable to you, you may have the right to:</p>
      <ul>
        <li>obtain information about how your data is processed;</li>
        <li>request access to your personal data;</li>
        <li>request correction of inaccurate or incomplete data;</li>
        <li>request deletion of your personal data;</li>
        <li>request restriction of processing;</li>
        <li>object to certain processing, including direct marketing;</li>
        <li>withdraw consent at any time;</li>
        <li>receive certain data in a portable format;</li>
        <li>lodge a complaint with a competent data protection authority;</li>
        <li>request information about recipients or categories of recipients of your data.</li>
      </ul>
      <p>These rights may be subject to legal conditions and exceptions.</p>
      <p>
        To exercise your rights, contact <SupportEmail />. We may need to verify your identity
        before responding. We will respond within the period required by applicable law.
      </p>
      <p>
        If you are located in the European Economic Area, you may also lodge a complaint with the
        data protection authority in the country where you live, work, or believe a violation
        occurred.
      </p>
      <p>
        If you are located in Georgia, you may exercise the rights available under Georgian personal
        data protection law and contact the competent Georgian data protection authority.
      </p>

      <h2 id="childrens-privacy">12. Children’s privacy</h2>
      <p>
        The Service is not intended for children under the age of 16, and we do not knowingly
        collect personal data from children under 16.
      </p>
      <p>
        If you believe that a child has provided personal data to us in violation of this Privacy
        Policy, contact <SupportEmail />. We will review the request and take appropriate action,
        including deleting the information where required.
      </p>

      <h2 id="automated-decision-making">13. Automated decision-making</h2>
      <p>
        We do not use personal data obtained through Google Sign-In, Facebook Login, or Telegram
        Login to make decisions that produce legal or similarly significant effects through solely
        automated processing.
      </p>

      <h2 id="third-party-websites">14. Third-party websites and services</h2>
      <p>
        The Service may contain links to third-party websites or services, including links that
        users add to their public profiles. Their processing of personal data is governed by their
        own privacy policies.
      </p>
      <p>
        We do not control and are not responsible for the privacy, security, or content of
        third-party services.
      </p>

      <h2 id="changes">15. Changes to this Privacy Policy</h2>
      <p>
        We may update this Privacy Policy to reflect changes to the Service, our data practices,
        legal requirements, or security measures.
      </p>
      <p>
        The updated version will be published on this page with a revised “Last updated” date. If a
        change materially affects how we use personal data, we will provide reasonable notice
        through the Service, by email, or by another appropriate method.
      </p>
      <p>
        Where required by law, we will obtain your consent before using personal data for a
        materially different purpose.
      </p>

      <h2 id="applicable-law">16. Applicable law</h2>
      <p>This Privacy Policy is governed primarily by the laws of Georgia.</p>
      <p>
        Where mandatory data protection laws in another jurisdiction apply to particular processing
        activities or users, we will process personal data in accordance with those requirements.
      </p>

      <h2 id="contact-us">17. Contact us</h2>
      <p>
        If you have questions, requests, or complaints concerning this Privacy Policy or the
        processing of your personal data, contact:
      </p>
      <OperatorDetails />
    </LegalDocument>
  );
}
