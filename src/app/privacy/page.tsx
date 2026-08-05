import React from "react";
import PublicLayout from "@/components/PublicLayout";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-xs text-neutral-400 mb-8">Last Updated: January 1, 2026</p>
        
        <div className="prose dark:prose-invert text-sm text-neutral-600 dark:text-neutral-400 space-y-6 leading-relaxed">
          <p>
            At CareerDiscover, accessible from our domain, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by CareerDiscover and how we use it.
          </p>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">1. Information We Collect</h2>
          <p>
            If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>
          <p>
            When you register for an Account or submit a job application internally, we ask for your contact information, including items such as name, company name, address, email address, telephone number, and resume documents.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, operate, and maintain our job discovery portal.</li>
            <li>Improve, personalize, and expand our search, filters, and recommendation engines.</li>
            <li>Understand and analyze how you interact with our platform (e.g., job views and application clicks).</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you, either directly or through one of our partners, for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
          </ul>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">3. Log Files & Analytics</h2>
          <p>
            CareerDiscover follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">4. GDPR & CCPA Data Protection Rights</h2>
          <p>
            We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
          </ul>
        </div>
      </article>
    </PublicLayout>
  );
}
