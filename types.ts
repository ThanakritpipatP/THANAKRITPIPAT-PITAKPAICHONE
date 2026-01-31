
export enum CouponType {
  LINE_FRIEND = 'LINE_FRIEND',
  VISTA_MEMBER = 'VISTA_MEMBER',
}

export enum UserStatus {
  MEMBER = 'MEMBER',
  NON_MEMBER = 'NON_MEMBER',
  INVALID = 'INVALID',
}

export interface ValidationResponse {
  status: UserStatus;
  name?: string;
  memberId?: string;
}

export interface UserData {
  identifier: string;
}

export interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export interface CouponInfo {
  id: string;
  name:string;
  cardTitle: string;
  description: string;
  isMemberOnly: boolean;
  usageLimit: string;
  imageUrl?: string;
  validityPeriod: string;
  details: string;
  terms: string;
  activeDay?: number; // The specific day of the month this coupon is active
}

export interface WeeklyPromotion {
    week: number;
    period: string;
    startDate: Date;
    endDate: Date;
    coupons: CouponInfo[];
}

export interface CouponHistoryEntry {
  coupon: CouponInfo;
  status: 'Used' | 'Expired';
  date: string; // ISO 8601 format
  couponCode: string;
}
