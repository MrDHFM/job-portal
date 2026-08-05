import React from "react";
import PublicLayout from "@/components/PublicLayout";

export default function TermsPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">Terms & Conditions</h1>
        <p className="text-xs text-neutral-400 mb-8">Last Updated: January 1, 2026</p>
        
        <div className="prose dark:prose-invert text-sm text-neutral-600 dark:text-neutral-400 space-y-6 leading-relaxed">
          <p>
            Welcome to CareerDiscover! These terms and conditions outline the rules and regulations for the use of CareerDiscover's Website.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use CareerDiscover if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">1. Intellectual Property Rights</h2>
          <p>
            Other than the content you own, under these Terms, CareerDiscover and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website.
          </p>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">2. Restriction of Use</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Publishing any Website material in any other media without source attribution.</li>
            <li>Selling, sublicensing and/or otherwise commercializing any Website material.</li>
            <li>Using this Website in any way that is or may be damaging to this Website.</li>
            <li>Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity.</li>
          </ul>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white pt-4">3. No Warranties & Data Limitation</h2>
          <p>
            This Website is provided "as is," with all faults, and CareerDiscover expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
          </p>
        </div>
      </article>
    </PublicLayout>
  );
}
