import React from "react";
import PublicLayout from "@/components/PublicLayout";

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">Cookie Policy</h1>
        <p className="text-xs text-neutral-400 mb-8">Last Updated: January 1, 2026</p>
        
        <div className="prose dark:prose-invert text-sm text-neutral-600 dark:text-neutral-400 space-y-6 leading-relaxed">
          <p>
            This is the Cookie Policy for CareerDiscover, accessible from our domain.
          </p>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">What Are Cookies</h2>
          <p>
            As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use them and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">The Cookies We Set</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Site preference cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences (such as light/dark mode) we need to set cookies so that this information can be called whenever you interact with a page.
            </li>
            <li>
              <strong>Saved jobs list:</strong> We may use cookies or local browser storage to keep track of jobs you save during anonymous visits, allowing you to access them later.
            </li>
          </ul>
        </div>
      </article>
    </PublicLayout>
  );
}
