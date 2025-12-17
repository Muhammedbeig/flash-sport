// lib/site-content.ts
// ============================================================
// CENTRALIZED SITE CONTENT (NON-TECH FRIENDLY)
// Edit ONLY this file later from an admin panel or manually.
// No routing changes, no SEO system changes.
// ============================================================

export type LegalInline =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

export type LegalBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "p_rich"; inlines: LegalInline[] }
  | { type: "ul"; items: string[] };

export type LegalSection = {
  title: string; // e.g. "1. Privacy Policy of {siteDomain}"
  blocks: LegalBlock[];
};

export type LegalDoc = {
  h1: string; // page H1 (required)
  lastUpdated: string; // "December 17, 2025"
  sections: LegalSection[];
};

export const SITE_CONTENT = {
  brand: {
    siteName: "LiveSocceRR",
    siteDomain: "www.livesoccerr.com",
    // If you prefer full URL, use: "https://livesoccerr.com"
    siteUrl: "https://livesoccerr.com",
  },

  contact: {
    supportEmail: "service@livesoccerr.com",
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    addressLine1: "Your Company Address Line 1",
    addressLine2: "City, Country",
    supportHours: "Mon–Sun, 24/7",
  },

  socials: {
    twitter: "#",
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },

  appDownloads: {
    googlePlayUrl: "#",
    appStoreUrl: "#",
  },

  pages: {
    contact: {
      h1: "Contact Us",
      intro: [
        "To make sure your query or feedback gets to the right person, please contact us via email.",
        "We review every email and will get back to you if we need more information.",
      ],
      cardTitle: "Send us an email",
      cardSubtitle: "Support, bug reports, partnerships, and feedback.",
      note: "We will use only email for contacting.",
    },
  },

  legal: {
    privacyPolicy: {
      h1: "Privacy Policy",
      lastUpdated: "December 17, 2025",
      sections: [
        {
          title: "1. Privacy Policy of {siteDomain}",
          blocks: [
            { type: "h3", text: "1.1 Introduction" },
            {
              type: "p",
              text:
                "This privacy policy concerns the products of {siteName} (anything marked as ‘we, us, our’ and similar in this policy will refer to {siteName}) – our website {siteDomain} and our mobile applications. In order to provide our services, we have to collect some personal data. This privacy policy explains what data we collect, how and why we process and keep it, how you can contact us and find out about your privacy rights, as well as show our commitment to the protection of your information.",
            },
            { type: "h3", text: "1.2 Data Controller and Owner" },
            {
              type: "p",
              text:
                "The owner of {siteDomain}. You can contact us by e-mail at the address: {supportEmail}",
            },
            { type: "h3", text: "1.3 Third-Party Links" },
            {
              type: "p",
              text:
                "Please keep in mind that we aren’t in control of the data our partner websites collect and share. While we are committed to guarding your privacy and safety in every way possible, if you’re leaving {siteDomain} by clicking on a plug-in or a link you find on our site, personal data they collect is out of our hands. We strongly recommend you read the privacy policies of those sites first.",
            },
          ],
        },
        {
          title: "2. Types of Data Collected",
          blocks: [
            { type: "h3", text: "2.1 Collected Data" },
            {
              type: "p",
              text:
                "Among the types of personal data that we collect, by itself or through third parties, are: Email, Cookie, and Usage Data. If we need any other personal data collected at some point, it will either be described in other sections of this privacy policy or by dedicated explanation text contextually with the data collection. The personal data we collect may be freely provided by the user or collected automatically when using our products.",
            },
            { type: "h3", text: "2.2 User Account" },
            {
              type: "p",
              text:
                "In order to provide a better service for our users, we have a feature of a user account. Personal data refers to information that can identify you, such as your name, e-mail address, or any data you provide while using the {siteName} user account.",
            },
            {
              type: "p",
              text:
                "Our login providers (Facebook or Google) provide us with some of your personal data — name, surname, e-mail — upon your login to our services. However, your personal information of that kind will never be sold or rented to anyone, for any reason, at any time. This information will only be used to easier fulfill your requests for service, such as providing access to your in-app stats and features, and to enforce our Terms of Use.",
            },
            { type: "h3", text: "2.3 Not-Collected Data" },
            {
              type: "p",
              text:
                "At no point do we collect personal or sensitive personal data that could lead to a person being positively identified. Also, we never collect data about race or ethnic origin, political opinions, religious or philosophical beliefs, trade union memberships, genetic or biometric data, health or mortality, sex life or sexual orientation, unless we are legally required by the court of law to do so.",
            },
          ],
        },
        {
          title: "3. Mode and Place of Processing",
          blocks: [
            { type: "h3", text: "3.1 Method of Processing" },
            {
              type: "p",
              text:
                "Our Data Controller processes the data of our users in a proper manner and shall take appropriate security measures to prevent unauthorized access, disclosure, modification, or unauthorized destruction of the data.",
            },
            {
              type: "p",
              text:
                "The data processing itself is carried out using computers and/or IT-enabled tools, following organizational procedures strictly related to the purposes indicated. In addition to the Data Controller, in some cases, the data may be accessible to certain types of persons in charge involved with the operation of the site (administration, sales, marketing, legal, system administration) or external parties (such as third-party technical service providers, mail carriers, hosting providers, IT companies, communications agencies).",
            },
            { type: "h3", text: "3.2 Conservation Time" },
            {
              type: "p",
              text:
                "We keep the data for the time necessary to provide the service requested by the user, or stated by the purposes outlined in this document. You can always, at any time, request the Data Controller for the suspension or removal of your data.",
            },
          ],
        },
        {
          title: "4. The Use of Collected Data",
          blocks: [
            {
              type: "p",
              text:
                "The data concerning the user is collected to allow us to provide our services, as well as for the following purposes: contacting the user and displaying content from external platforms.",
            },
            {
              type: "p",
              text:
                "Contacting the User: By registering to the mailing list or newsletter, the user’s email address will be added to the contact list of those who may receive email messages containing information of commercial or promotional nature concerning our product.",
            },
            {
              type: "p",
              text:
                "Displaying Content: Personal Data collected in this case are your Cookie and Usage Data.",
            },
          ],
        },
        {
          title: "5. Further & Additional Information",
          blocks: [
            { type: "h3", text: "5.1 Push Notifications" },
            {
              type: "p",
              text:
                "We may send push notifications to you. Push notifications may include alerts, sounds, icon badges, and other information in relation to the use of our products. You can control your preferences via your device settings.",
            },
            { type: "h3", text: "5.2 Legal Actions" },
            {
              type: "p",
              text:
                "Your data may be used for legal purposes by the Data Controller in Court or in the stages leading to possible legal action arising from improper use of our products or the related services.",
            },
            { type: "h3", text: "5.3 Your Rights" },
            {
              type: "p",
              text:
                "By submitting a user access request, we will provide you the following information free of charge:",
            },
            {
              type: "ul",
              items: [
                "What personal information pertaining to you is being processed",
                "Why this information is being processed",
                "Who has access to this personal information about you",
                "What processes are using this information",
              ],
            },
            {
              type: "p",
              text:
                "A user access request should be completed within 30 days. Keep in mind our products do not support “do not track” requests.",
            },
          ],
        },
        {
          title: "Contact Us",
          blocks: [
            {
              type: "p",
              text:
                "If you have any questions about this Privacy Policy, please contact us at: {supportEmail}",
            },
          ],
        },
      ],
    } as LegalDoc,

    termsOfService: {
      h1: "Terms of Service",
      lastUpdated: "December 17, 2025",
      sections: [
        {
          title: "1. Introductory Provisions",
          blocks: [
            {
              type: "p",
              text:
                "Identification of the parties. These terms of use (“Terms of Use”) govern the mutual rights and obligations between {siteName} (“we”, “us” or “our”) and third party individuals (“User”, “you” or “your”) when using our website {siteDomain} (the “Site”).",
            },
            {
              type: "p",
              text:
                "Applicability of Terms of Use. If you are a non-registered User of the Site, only the provisions on the nature and use of the Site, in particular clauses 1, 2 and 10 of these Terms of Use, shall apply to you. For registered Users, these Terms of Use shall apply in full, and we encourage you to familiarize yourself with them, particularly clauses 3 to 12 thereof, which constitute the service contract between the registered User and us.",
            },
          ],
        },
        {
          title: "2. Site Content",
          blocks: [
            {
              type: "p",
              text:
                "Nature of the service. The Site contains up-to-date information on sporting events, in particular real-time sporting results, final results, fixtures, line-ups and other sporting statistics and sporting content. Results and other statistical information displayed on the Site are based on information provided by other independent sources (from third parties), internal efforts or other official applications. Whilst we make every effort to regularly update the content and check the results or other information displayed on the Site, we do not make any promises or grant any warranties about the Site, and we encourage you to thoroughly check the information collected on the Site with original and other sources as well. The use of and reliance on the results and other information displayed on the Site is your sole responsibility.",
            },
            {
              type: "p",
              text:
                "Use of the Site at your own risk. We are providing the Site, and all the communication and information stored and presented therein, with reasonable skill and care. However, your access to the Site, use of the Site, and use of any information we may provide in connection with the Site, is at your sole option, discretion, risk, and for your personal use only. You may not use the Site for any commercial purpose.",
            },
            {
              type: "p",
              text:
                "Third party content. The site contains third-party content obtained from external applications and resources that we are not responsible for. We expressly exclude any liability in connection with such content, its availability or the information contained therein.",
            },
            {
              type: "p",
              text:
                "Relationship to gambling. Use of the Site is entirely at your own risk. The Site is not a gaming or gambling application. We do not provide games or gambling; therefore, we do not hold or control your financial or other resources and do not participate in any gambling transactions. The betting odds displayed on the Site are presented for news purposes only.",
            },
            {
              type: "p",
              text:
                "Content rights. Texts, photographs, graphic works and other elements contained in the Site may be protected by copyright individually and/or as a whole. Unauthorized use, reproduction, or distribution without our explicit consent is prohibited.",
            },
            {
              type: "p",
              text:
                "Unauthorized interference. You must not use any mechanism, tool, software or procedure that has or could adversely affect the operation of our facilities, the security of the Internet or other Internet users. Scraping, aggregating, or embedding our content without express consent is not permitted.",
            },
          ],
        },
        {
          title: "3. Conclusion of a Service Contract",
          blocks: [
            {
              type: "p",
              text:
                "Proposal submission. You may make a proposal to enter into a service contract by completing and submitting the information in the registration form located on the Site. You warrant that the information provided is correct.",
            },
            {
              type: "p",
              text:
                "Use of third-party registration. If you use an existing registration with a third party (for example, a social network registration), the service contract is concluded when you allow us to access your data to create the account.",
            },
            {
              type: "p",
              text:
                "Costs of means of communication. You agree to the use of remote means of communication when entering into the service contract. Costs incurred by you (e.g., internet connection costs) shall be borne by you.",
            },
          ],
        },
        {
          title: "4. Content of the Service Contract",
          blocks: [
            {
              type: "p",
              text:
                "Under the service contract, we will allow you to use the service through the Site, including the content and features that are subject to registration. The Terms of Use form an integral part of the service contract.",
            },
          ],
        },
        {
          title: "5. User's Account",
          blocks: [
            {
              type: "p",
              text:
                "Account protection. Access to User account is secured by a username and password. You are obliged to maintain confidentiality regarding the information necessary to access your User account. We may prevent you from using your User's account if you breach your obligations under the service contract.",
            },
          ],
        },
        {
          title: "6. Terms of Service",
          blocks: [
            {
              type: "p",
              text:
                "Service outages. Service outages, temporary limitations, interruptions, or degradation of service may occur. Information stored by you within the service may not be backed up by us.",
            },
            {
              type: "p",
              text:
                "Liability limitation. To the extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, special, punitive or exemplary damages arising out of the service contract or your use of the Site.",
            },
          ],
        },
        {
          title: "7. Use of the Service",
          blocks: [
            {
              type: "p",
              text:
                "Personalization of content. You are entitled to personalize the content of the service to your own preferences within the settings offered.",
            },
            {
              type: "p",
              text:
                "Anti-fraud and anti-harassment policy. We have a zero-tolerance policy towards inappropriate and fraudulent activity within the Site. If you are found to have attempted to defraud us or any other user, we reserve the right to suspend or close your account.",
            },
          ],
        },
        {
          title: "8. Other Rights and Duties",
          blocks: [
            {
              type: "p",
              text:
                "Handling of complaints. Consumer complaints are handled by us via an electronic address at the contact address provided below.",
            },
            {
              type: "p",
              text:
                "Communication. Unless otherwise agreed, all correspondence related to the service contract shall be delivered to the other party in text form by electronic mail.",
            },
          ],
        },
        {
          title: "9. Data Protection",
          blocks: [
            {
              type: "p_rich",
              inlines: [
                { type: "text", value: "We fulfil our information obligation regarding personal data protection by means of a special document designated as ‘Privacy Policy’. These Terms of Use shall be read and construed alongside our " },
                { type: "link", href: "/privacy-policy", label: "Privacy Policy" },
                { type: "text", value: ", accessible here." },
              ],
            },
          ],
        },
        {
          title: "10. Duration of the Service Contract",
          blocks: [
            {
              type: "p",
              text:
                "The service contract is concluded for an indefinite period of time. You may terminate the service contract at any time by deleting the User's account. We may terminate the service contract if you breach any obligations.",
            },
          ],
        },
        {
          title: "11. Final Provisions",
          blocks: [
            {
              type: "p",
              text:
                "Governing law. The relationship created by the service contract shall be governed by applicable laws.",
            },
            {
              type: "p",
              text:
                "Unilateral change of Terms of Use. We may unilaterally amend these Terms of Use. You shall be notified of the amendment by e-mail or by a dialog box on the Site.",
            },
            {
              type: "p",
              text:
                "Our contacts. Our contact details are as follows: E-mail address: {supportEmail}",
            },
          ],
        },
      ],
    } as LegalDoc,
  },
} as const;

// ---------------------------
// Helpers (used by pages)
// ---------------------------
export function getContentVars() {
  return {
    siteName: SITE_CONTENT.brand.siteName,
    siteDomain: SITE_CONTENT.brand.siteDomain,
    siteUrl: SITE_CONTENT.brand.siteUrl,
    supportEmail: SITE_CONTENT.contact.supportEmail,
    phone: SITE_CONTENT.contact.phone,
    whatsapp: SITE_CONTENT.contact.whatsapp,
    addressLine1: SITE_CONTENT.contact.addressLine1,
    addressLine2: SITE_CONTENT.contact.addressLine2,
    supportHours: SITE_CONTENT.contact.supportHours,
  };
}

export function applyVars(input: string, vars: Record<string, string>) {
  return input.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}