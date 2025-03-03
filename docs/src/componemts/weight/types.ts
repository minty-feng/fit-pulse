import type { Dayjs } from 'dayjs';

export interface WeightRecord {
  id: string;
  userId: string;
  seq: number;
  date: string;
  weight: number;
  submittedAt: string;
  updatedAt: string;
}

export interface UserData {
  userId: string;
  username: string;
  records: WeightRecord[];
}

export type WeightFormValues = {
  date: Dayjs;
  weight: number;
};

export type ComparisonItem = {
  date: string;
  user1: string;
  user2: string;
};