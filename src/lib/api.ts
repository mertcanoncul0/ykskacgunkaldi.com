export interface ExamSession {
  slug: string;
  name: string;
  targetDate: string;
  countdownLabel: string;
  isEstimated?: boolean;
}

export interface GuideParagraph {
  heading?: string;
  body: string;
}

export interface Exam {
  slug: string;
  name: string;
  h1: string;
  heroDescription: string;
  targetDate: string;
  countdownLabel: string;
  isEstimated?: boolean;
  detailCta?: string;
  sessions?: ExamSession[];
  featureTitle?: string;
  featureDescription?: string;
  guideTitle?: string;
  guideParagraphs?: GuideParagraph[];
  nextExamDescription?: string;
}
