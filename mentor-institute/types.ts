import type { ReactNode } from 'react';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  image: string;
  icon: any;
  syllabus: string[];
}

export interface GalleryItem {
  id: number;
  title: string;
  date: string;
  description: string;
  technologies: string[];
  bannerImage: string;
  images: string[];
}

export type Role = 'superadmin' | 'teacher' | 'partner' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Should not be sent to frontend in real app
  role: Role;
  mobile?: string;
}

export interface Student extends User {
  role: 'student';
  courseId: number;
  teacherId?: number;
  referredBy?: string;
  photo?: string; // URL to photo
  displayName?: 'real_name' | 'anonymous';
  gender?: 'male' | 'female' | 'other';
}

export interface Teacher extends User {
  role: 'teacher';
  specialization: string;
  affiliateId?: string;
  commissionPercentage?: number;
  earnings?: {
    total: number;
    daily: number;
  };
  city?: string;
  address?: string;
}

export interface Partner extends User {
  role: 'partner';
  affiliateId: string;
  commissionPercentage: number;
  earnings: {
    total: number;
    daily: number;
  };
  partnerType?: 'Individual' | 'Firm';
  firmName?: string;
  city?: string;
  address?: string;
}

export type NotificationType = 'new_demo' | 'new_partner';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  read: boolean;
  timestamp: Date;
}

export interface Topic {
  id: number;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: number;
  name: string;
  topics: Topic[];
}

export interface TestCategory {
  id: number;
  name: string;
}

export interface PracticeTest {
  id: number;
  name: string;
  categoryId: number;
  duration: number; // in minutes
}

export interface Contest {
  id: number;
  name: string;
  categoryId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  notesUrl?: string;
  prizeMoney: number;
  minParticipants: number;
  entryFee: number;
  totalQuestions: number;
  duration: number; // in minutes
}

export interface Question {
  id: number;
  testId: number;
  text: string;
  options: {
    id: number;
    text: string;
  }[];
  correctOptionId: number;
}

export interface PracticeTestResult {
  id: number;
  userId: number;
  testId: number;
  date: string; // YYYY-MM-DD HH:MM:SS
  scoreObtained: number;
  totalScore: number;
  answers: Record<number, number>; // { [questionId]: optionId }
}

export interface ContestResult {
  id: number;
  userId: number;
  contestId: number;
  date: string; // YYYY-MM-DD
  scoreObtained: number;
  totalScore: number;
  rank: number;
  answers: Record<number, number>; // { [questionId]: optionId }
}

export interface ContestWinner {
  userId: number;
  contestId: number;
  rank: number;
  scoreObtained: number;
  totalScore: number;
}

export interface DemoBooking {
    id: number;
    studentName: string;
    studentEmail: string;
    studentMobile: string;
    courseId: number;
    referredByAffiliateId?: string;
    bookingDate: string; // YYYY-MM-DD
    bookingTime: string; // HH:MM
    status: 'Pending' | 'Scheduled' | 'Conducted' | 'Postponed' | 'Cancelled' | 'Student Admitted';
    commissionAmount?: number;
    commissionPaid: boolean;
    paymentDetails?: {
        mode: string;
        description?: string;
        paidOn: string;
        paidAmount: number;
    };
    scheduledDate?: string;
    scheduledTime?: string;
    teacherId?: number;
    studentNotified?: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number; // teacherId
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}
