export type SocialJob = {
  id: number;
  title: string;
  slug: string;

  companyName: string;
  companyLogoUrl?: string | null;

  city: string;
  state: string;
  country: string;

  sector?: string | null;
  categoryName?: string | null;

  employmentType: string;
  workMode: string;
  experienceLevel: string;

  requiredSkills?: string | null;

  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  salaryPeriod?: string | null;
  isSalaryVisible?: boolean;

  applicationDeadline?: Date | string | null;

  isUrgent?: boolean;
  isFeatured?: boolean;
};

export type SocialPlatform =
  | "telegram"
  | "instagram"
  | "linkedin"
  | "x";

export type ManualSocialPost = {
  platform: "linkedin" | "x";
  content: string;
  jobUrl: string;
};

export type SocialPostStatus =
  | "PENDING"
  | "PUBLISHED"
  | "FAILED"
  | "MANUAL_READY";

export type SocialPublishResult = {
  success: boolean;
  platform: SocialPlatform;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
};