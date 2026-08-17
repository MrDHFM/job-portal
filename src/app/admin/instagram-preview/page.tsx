"use client";

import { useState } from "react";

const initialForm = {
  title: "Quality Assurance Automation Engineer",
  companyName: "TCS",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  experienceLevel: "Experienced",
  workMode: "On-site",
  employmentType: "Full-time",
  requiredSkills: "Playwright, Java, TypeScript, Cucumber, SQL",
};

export default function InstagramPreviewPage() {
  const [form, setForm] = useState(initialForm);
  const [imageUrl, setImageUrl] = useState(
    "/api/admin/instagram-preview",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function generatePreview() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "/api/admin/instagram-preview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const contentType =
        response.headers.get("content-type") || "";

      let errorMessage = `Preview API failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        const errorData = await response.json();

        errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorMessage;

        console.error(
          "Instagram preview API error:",
          errorData,
        );
      } else {
        const errorText = await response.text();

        if (errorText) {
          errorMessage = errorText;
        }

        console.error(
          "Instagram preview API error:",
          errorText,
        );
      }

      throw new Error(errorMessage);
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("image/png")) {
      const text = await response.text();

      console.error(
        "Expected image/png but received:",
        text,
      );

      throw new Error(
        "Preview API did not return an image. Check the server error.",
      );
    }

    const blob = await response.blob();

    const url = URL.createObjectURL(blob);

    setImageUrl((previousUrl) => {
      if (previousUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }

      return url;
    });
  } catch (err) {
    console.error(
      "Instagram preview generation failed:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Could not generate preview.",
    );
  } finally {
    setLoading(false);
  }
}

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Instagram Job Card Preview
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Test the real Instagram card without creating or
            publishing a job.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[390px_minmax(0,1fr)]">
          {/* ========================= */}
          {/* LEFT - SAMPLE JOB FORM */}
          {/* ========================= */}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Sample Job Data
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Change any value and click Generate Preview.
              </p>
            </div>

            <div className="space-y-4">
              {/* Job Title */}
              <Field
                label="Job Title"
                value={form.title}
                onChange={(value) =>
                  updateField("title", value)
                }
              />

              {/* Company */}
              <Field
                label="Company"
                value={form.companyName}
                onChange={(value) =>
                  updateField("companyName", value)
                }
              />

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) =>
                    updateField("city", value)
                  }
                />

                <Field
                  label="State"
                  value={form.state}
                  onChange={(value) =>
                    updateField("state", value)
                  }
                />
              </div>

              {/* Country */}
              <Field
                label="Country"
                value={form.country}
                onChange={(value) =>
                  updateField("country", value)
                }
              />

              {/* Experience */}
              <Field
                label="Experience"
                value={form.experienceLevel}
                onChange={(value) =>
                  updateField(
                    "experienceLevel",
                    value,
                  )
                }
              />

              {/* Work Mode + Employment */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Work Mode"
                  value={form.workMode}
                  onChange={(value) =>
                    updateField("workMode", value)
                  }
                />

                <Field
                  label="Employment Type"
                  value={form.employmentType}
                  onChange={(value) =>
                    updateField(
                      "employmentType",
                      value,
                    )
                  }
                />
              </div>

              {/* Skills */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Skills
                </label>

                <textarea
                  value={form.requiredSkills}
                  onChange={(event) =>
                    updateField(
                      "requiredSkills",
                      event.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Playwright, Java, TypeScript, Cucumber, SQL"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />

                <p className="mt-1 text-[11px] text-neutral-400">
                  Separate skills with commas. The card
                  displays up to 5.
                </p>
              </div>

              {/* Generate */}
              <button
                type="button"
                onClick={generatePreview}
                disabled={loading}
                className="w-full rounded-xl bg-[#173B78] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Generating..."
                  : "Generate Preview"}
              </button>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}
            </div>
          </section>

          {/* ========================= */}
          {/* RIGHT - IMAGE PREVIEW */}
          {/* ========================= */}

          <section className="rounded-2xl border border-neutral-200 bg-neutral-200/70 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Live Card
                </h2>

                <p className="text-xs text-neutral-500">
                  1080 × 1350 · Instagram 4:5
                </p>
              </div>

              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                Open Image
              </a>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[540px] overflow-hidden rounded-xl bg-white shadow-2xl">
                <img
                  src={imageUrl}
                  alt="Instagram job card preview"
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ================================= */
/* REUSABLE INPUT FIELD              */
/* ================================= */

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
      />
    </div>
  );
}