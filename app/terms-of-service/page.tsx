import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | LiveSocer",
  description: "Read the LiveSocer Terms of Service regarding the use of our website, user accounts, content rights, and service limitations.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  // Configuration Variables
  const WEBSITE_NAME = "LiveSocer";
  const WEBSITE_URL = "www.livesocer.com"; 
  const CONTACT_EMAIL = "service@livesocer.com";
  // You can update the registered office details as needed for your actual business entity
  const COMPANY_DETAILS = "LiveSocer Inc."; 
  const LAST_UPDATED = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-secondary">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content Card */}
        <div className="theme-bg theme-border border rounded-xl p-6 md:p-10 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-secondary">
          
          {/* 1. INTRODUCTORY PROVISIONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              1. Introductory Provisions
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Identification of the parties.</strong> These terms of use (“Terms of Use”) govern the mutual rights and obligations between {COMPANY_DETAILS} (“we”, “us” or “our”) and third party individuals (“User”, “you” or “your”) when using our website {WEBSITE_URL} (the “Site”).
              </p>
              <p>
                <strong>Applicability of Terms of Use.</strong> If you are a non-registered User of the Site, only the provisions on the nature and use of the Site, in particular clauses 1, 2 and 10 of these Terms of Use, shall apply to you. For registered Users, these Terms of Use shall apply in full, and we encourage you to familiarize yourself with them, particularly clauses 3 to 12 thereof, which constitute the service contract between the registered User and us.
              </p>
            </div>
          </section>

          {/* 2. SITE CONTENT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              2. Site Content
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Nature of the service.</strong> The Site contains up-to-date information on sporting events, in particular real-time sporting results, final results, fixtures, line-ups and other sporting statistics and sporting content. Results and other statistical information displayed on the Site are based on information provided by other independent sources (from third parties), internal efforts or other official applications. Whilst we make every effort to regularly update the content and check the results or other information displayed on the Site, we do not make any promises or grant any warranties about the Site, and we encourage you to thoroughly check the information collected on the Site with original and other sources as well. The use of and reliance on the results and other information displayed on the Site is your sole responsibility.
              </p>
              <p>
                <strong>Use of the Site at your own risk.</strong> We are providing the Site, and all the communication and information stored and presented therein, with reasonable skill and care. However, your access to the Site, use of the Site, and use of any information we may provide in connection with the Site, is at your sole option, discretion, risk, and for your personal use only. You may not use the Site for any commercial purpose.
              </p>
              <p>
                <strong>Third party content.</strong> The site contains third-party content obtained from external applications and resources that we are not responsible for. We expressly exclude any liability in connection with such content, its availability or the information contained therein.
              </p>
              <p>
                <strong>Relationship to gambling.</strong> Use of the Site is entirely at your own risk. The Site is not a gaming or gambling application. We do not provide games or gambling; therefore, we do not hold or control your financial or other resources and do not participate in any gambling transactions. The betting odds displayed on the Site are presented for news purposes only.
              </p>
              <p>
                <strong>Content rights.</strong> Texts, photographs, graphic works and other elements contained in the Site may be protected by copyright individually and/or as a whole. Unauthorized use, reproduction, or distribution without our explicit consent is prohibited.
              </p>
              <p>
                <strong>Unauthorized interference.</strong> You must not use any mechanism, tool, software or procedure that has or could adversely affect the operation of our facilities, the security of the Internet or other Internet users. Scraping, aggregating, or embedding our content without express consent is not permitted.
              </p>
            </div>
          </section>

          {/* 3. CONCLUSION OF A SERVICE CONTRACT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              3. Conclusion of a Service Contract
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Proposal submission.</strong> You may make a proposal to enter into a service contract by completing and submitting the information in the registration form located on the Site. You warrant that the information provided is correct.
              </p>
              <p>
                <strong>Use of third-party registration.</strong> If you use an existing registration with a third party (for example, a social network registration), the service contract is concluded when you allow us to access your data to create the account.
              </p>
              <p>
                <strong>Costs of means of communication.</strong> You agree to the use of remote means of communication when entering into the service contract. Costs incurred by you (e.g., internet connection costs) shall be borne by you.
              </p>
            </div>
          </section>

          {/* 4. CONTENT OF THE SERVICE CONTRACT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              4. Content of the Service Contract
            </h2>
            <p>
              Under the service contract, we will allow you to use the service through the Site, including the content and features that are subject to registration. The Terms of Use form an integral part of the service contract.
            </p>
          </section>

          {/* 5. USER'S ACCOUNT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              5. User's Account
            </h2>
            <p>
              <strong>Account protection.</strong> Access to User account is secured by a username and password. You are obliged to maintain confidentiality regarding the information necessary to access your User account. We may prevent you from using your User's account if you breach your obligations under the service contract.
            </p>
          </section>

          {/* 6. TERMS OF SERVICE */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              6. Terms of Service
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Service outages.</strong> Service outages, temporary limitations, interruptions, or degradation of service may occur. Information stored by you within the service may not be backed up by us.
              </p>
              <p>
                <strong>Liability limitation.</strong> To the extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, special, punitive or exemplary damages arising out of the service contract or your use of the Site.
              </p>
            </div>
          </section>

          {/* 7. USE OF THE SERVICE */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              7. Use of the Service
            </h2>
            <p>
              <strong>Personalization of content.</strong> You are entitled to personalize the content of the service to your own preferences within the settings offered.
            </p>
            <p>
              <strong>Anti-fraud and anti-harassment policy.</strong> We have a zero-tolerance policy towards inappropriate and fraudulent activity within the Site. If you are found to have attempted to defraud us or any other user, we reserve the right to suspend or close your account.
            </p>
          </section>

          {/* 8. OTHER RIGHTS AND DUTIES */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              8. Other Rights and Duties
            </h2>
            <p>
              <strong>Handling of complaints.</strong> Consumer complaints are handled by us via an electronic address at the contact address provided below.
            </p>
            <p>
              <strong>Communication.</strong> Unless otherwise agreed, all correspondence related to the service contract shall be delivered to the other party in text form by electronic mail.
            </p>
          </section>

          {/* 9. DATA PROTECTION */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              9. Data Protection
            </h2>
            <p>
              We fulfil our information obligation regarding personal data protection by means of a special document designated as ‘Privacy Policy’. These Terms of Use shall be read and construed alongside our Privacy Policy, accessible{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                here
              </Link>.
            </p>
          </section>

          {/* 10. DURATION OF THE SERVICE CONTRACT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              10. Duration of the Service Contract
            </h2>
            <p>
              The service contract is concluded for an indefinite period of time. You may terminate the service contract at any time by deleting the User's account. We may terminate the service contract if you breach any obligations.
            </p>
          </section>

          {/* 11. FINAL PROVISIONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              11. Final Provisions
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Governing law.</strong> The relationship created by the service contract shall be governed by applicable laws.
              </p>
              <p>
                <strong>Unilateral change of Terms of Use.</strong> We may unilaterally amend these Terms of Use. You shall be notified of the amendment by e-mail or by a dialog box on the Site.
              </p>
              <p>
                <strong>Our contacts.</strong> Our contact details are as follows: <br />
                E-mail address:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}