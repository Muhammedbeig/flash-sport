import type { Metadata } from "next";
import Link from "next/link";

// 1. SEO Configuration
export const metadata: Metadata = {
  title: "Privacy Policy | LiveSocer",
  description: "Read the LiveSocer Privacy Policy to understand how we collect, use, and protect your personal data, cookie usage, and user rights.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  // 2. Configuration Variables
  const WEBSITE_NAME = "LiveSocer";
  const WEBSITE_URL = "www.livesocer.com"; 
  const CONTACT_EMAIL = "service@livesocer.com";
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
            Privacy Policy
          </h1>
          <p className="text-sm text-secondary">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content Card */}
        <div className="theme-bg theme-border border rounded-xl p-6 md:p-10 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-secondary">
          
          {/* SECTION 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              1. Privacy Policy of {WEBSITE_URL}
            </h2>
            
            <div className="space-y-4">
              <h3 className="font-bold text-primary">1.1 Introduction</h3>
              <p>
                This privacy policy concerns the products of <strong>{WEBSITE_NAME}</strong> (anything marked as ‘we, us, our’ and similar in this policy will refer to {WEBSITE_NAME}) – our website {WEBSITE_URL} and our mobile applications. In order to provide our services, we have to collect some personal data. This privacy policy explains what data we collect, how and why we process and keep it, how you can contact us and find out about your privacy rights, as well as show our commitment to the protection of your information.
              </p>

              <h3 className="font-bold text-primary">1.2 Data Controller and Owner</h3>
              <p>
                The owner of {WEBSITE_URL}. You can contact us by e-mail at the address:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>

              <h3 className="font-bold text-primary">1.3 Third-Party Links</h3>
              <p>
                Please keep in mind that we aren’t in control of the data our partner websites collect and share. While we are committed to guarding your privacy and safety in every way possible, if you’re leaving {WEBSITE_URL} by clicking on a plug-in or a link you find on our site, personal data they collect is out of our hands. We strongly recommend you read the privacy policies of those sites first.
              </p>
            </div>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              2. Types of Data Collected
            </h2>
            
            <div className="space-y-4">
              <h3 className="font-bold text-primary">2.1 Collected Data</h3>
              <p>
                Among the types of personal data that we collect, by itself or through third parties, are: Email, Cookie, and Usage Data. If we need any other personal data collected at some point, it will either be described in other sections of this privacy policy or by dedicated explanation text contextually with the data collection. The personal data we collect may be freely provided by the user or collected automatically when using our products.
              </p>

              <h3 className="font-bold text-primary">2.2 User Account</h3>
              <p>
                In order to provide a better service for our users, we have a feature of a user account. Personal data refers to information that can identify you, such as your name, e-mail address, or any data you provide while using the {WEBSITE_NAME} user account.
              </p>
              <p>
                Our login providers (Facebook or Google) provide us with some of your personal data — name, surname, e-mail — upon your login to our services. However, your personal information of that kind will never be sold or rented to anyone, for any reason, at any time. This information will only be used to easier fulfill your requests for service, such as providing access to your in-app stats and features, and to enforce our Terms of Use.
              </p>

              <h3 className="font-bold text-primary">2.3 Not-Collected Data</h3>
              <p>
                At no point do we collect personal or sensitive personal data that could lead to a person being positively identified. Also, we never collect data about race or ethnic origin, political opinions, religious or philosophical beliefs, trade union memberships, genetic or biometric data, health or mortality, sex life or sexual orientation, unless we are legally required by the court of law to do so.
              </p>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              3. Mode and Place of Processing
            </h2>
            
            <div className="space-y-4">
              <h3 className="font-bold text-primary">3.1 Method of Processing</h3>
              <p>
                Our Data Controller processes the data of our users in a proper manner and shall take appropriate security measures to prevent unauthorized access, disclosure, modification, or unauthorized destruction of the data.
              </p>
              <p>
                The data processing itself is carried out using computers and/or IT-enabled tools, following organizational procedures strictly related to the purposes indicated. In addition to the Data Controller, in some cases, the data may be accessible to certain types of persons in charge involved with the operation of the site (administration, sales, marketing, legal, system administration) or external parties (such as third-party technical service providers, mail carriers, hosting providers, IT companies, communications agencies).
              </p>

              <h3 className="font-bold text-primary">3.2 Conservation Time</h3>
              <p>
                We keep the data for the time necessary to provide the service requested by the user, or stated by the purposes outlined in this document. You can always, at any time, request the Data Controller for the suspension or removal of your data.
              </p>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              4. The Use of Collected Data
            </h2>
            <p>
              The data concerning the user is collected to allow us to provide our services, as well as for the following purposes: contacting the user and displaying content from external platforms.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-primary">Contacting the User:</strong> By registering to the mailing list or newsletter, the user’s email address will be added to the contact list of those who may receive email messages containing information of commercial or promotional nature concerning our product.
              </li>
              <li>
                <strong className="text-primary">Displaying Content:</strong> Personal Data collected in this case are your Cookie and Usage Data.
              </li>
            </ul>
          </section>

          {/* SECTION 5 & 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
              5. Further & Additional Information
            </h2>
            
            <div className="space-y-4">
              <h3 className="font-bold text-primary">5.1 Push Notifications</h3>
              <p>
                We may send push notifications to you. Push notifications may include alerts, sounds, icon badges, and other information in relation to the use of our products. You can control your preferences via your device settings.
              </p>

              <h3 className="font-bold text-primary">5.2 Legal Actions</h3>
              <p>
                Your data may be used for legal purposes by the Data Controller in Court or in the stages leading to possible legal action arising from improper use of our products or the related services.
              </p>

              <h3 className="font-bold text-primary">5.3 Your Rights</h3>
              <p>
                By submitting a user access request, we will provide you the following information free of charge:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>What personal information pertaining to you is being processed</li>
                <li>Why this information is being processed</li>
                <li>Who has access to this personal information about you</li>
                <li>What processes are using this information</li>
              </ul>
              <p className="mt-2">
                A user access request should be completed within 30 days. Keep in mind our products do not support “do not track” requests.
              </p>
            </div>
          </section>

          {/* SECTION 8 - Contact */}
          <section className="pt-6 border-t theme-border">
            <h2 className="text-xl font-bold text-primary uppercase tracking-wide mb-4">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline font-bold">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}