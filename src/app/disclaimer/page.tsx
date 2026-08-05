import React from "react";
import PublicLayout from "@/components/PublicLayout";

export default function DisclaimerPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">Disclaimer</h1>
        <p className="text-xs text-neutral-400 mb-8">Last Updated: January 1, 2026</p>
        
        <div className="prose dark:prose-invert text-sm text-neutral-600 dark:text-neutral-400 space-y-6 leading-relaxed">
          <p>
            If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at recruiting@globaljobportal.com.
          </p>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">Disclaimers for CareerDiscover</h2>
          <p>
            All the information on this website - CareerDiscover - is published in good faith and for general information purpose only. CareerDiscover does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website, is strictly at your own risk. CareerDiscover will not be liable for any losses and/or damages in connection with the use of our website.
          </p>
          <p>
            From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone 'bad'.
          </p>
          <p>
            Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their "Terms of Service" before engaging in any business or uploading any information.
          </p>
        </div>
      </article>
    </PublicLayout>
  );
}
