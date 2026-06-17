/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CountryInfo {
  id: string;
  name: string;
  flag: string;
  costOfLiving: string; // $, $$, $$$
  avgTuition: string; // tuition cost range
  visaTime: string; // e.g. "3-4 Weeks"
  workPermit: string; // post study work permit info
  successRate: number; // percentage
  keyIntakes: string[];
  popularPrograms: string[];
  universityCount: number;
}

export interface University {
  id: string;
  name: string;
  country: string;
  ranking: string;
  city: string;
  logoUrl: string;
  popularFields: string[];
  minGpa: number; // target GPA out of 4.0
  minIelts: number;
  avgTuitionYear: string;
  scholarshipGrantMax: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'personal' | 'identity';
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  fileSize?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'advisor';
  text: string;
  timestamp: Date;
}

export interface SuccessStory {
  id: string;
  studentName: string;
  originCountry: string;
  destinationCountry: string;
  universityName: string;
  program: string;
  scholarshipValue: string;
  imageSeed: string;
  quote: string;
}
