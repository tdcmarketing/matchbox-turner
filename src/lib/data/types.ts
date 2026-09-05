export type Role = "ADMIN" | "AGENT" | "VIEWER";

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  initials: string;
  color: string; // calendar color
  title: string;
}

export type PropertyType = "STUDENT" | "RESIDENTIAL" | "COMMERCIAL" | "STORAGE";

export interface Property {
  id: string;
  rmPropertyId?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  type: PropertyType;
  lat: number;
  lng: number;
}

export type ListingStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "LEASED" | "ARCHIVED";
export type ShowingMode = "AGENT" | "SELF" | "BOTH" | "NONE";
export type ListingSource = "RENT_MANAGER" | "MANUAL";

export interface Listing {
  id: string;
  propertyId: string;
  rmUnitId?: number;
  slug: string;
  unitLabel: string; // e.g. "Unit 2B", "1318 Devon"
  status: ListingStatus;
  rent: number; // per unit
  rentPerBed?: number;
  deposit: number;
  beds: number;
  baths: number;
  sqft: number;
  availableOn: string; // ISO date
  leaseTermMonths: number;
  headline: string;
  description: string;
  amenities: string[];
  photos: string[];
  showingMode: ShowingMode;
  agentIds: string[];
  lockboxId?: string;
  syndicate: boolean;
  source: ListingSource;
  prequalSetId: string;
  createdAt: string;
  views: number;
  furnished?: boolean;
  pets: "NO" | "CASE_BY_CASE" | "YES";
}

export type QuestionType = "YES_NO" | "NUMBER" | "SELECT" | "DATE" | "TEXT";

export interface PrequalRule {
  op: "eq" | "neq" | "gte" | "lte" | "before" | "after" | "in";
  value: string | number | string[];
}

export interface PrequalQuestion {
  id: string;
  prompt: string;
  help?: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  rule?: PrequalRule;
  disqualifyMessage?: string;
  waitlistOnFail?: boolean; // e.g. move-in date too far out → waitlist instead of disqualify
}

export interface PrequalSet {
  id: string;
  name: string;
  questions: PrequalQuestion[];
}

export type LeadSource =
  | "WEB"
  | "ZILLOW"
  | "APARTMENTS"
  | "ZUMPER"
  | "RENT_MANAGER"
  | "REFERRAL"
  | "PHONE"
  | "WALK_IN";

export type LeadStatus =
  | "NEW"
  | "QUALIFIED"
  | "DISQUALIFIED"
  | "WAITLIST"
  | "SCHEDULED"
  | "TOURED"
  | "APPLIED"
  | "LEASED"
  | "LOST";

export interface PrequalAnswer {
  questionId: string;
  answer: string;
  passed: boolean;
}

export interface Lead {
  id: string;
  listingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  moveInDate?: string;
  consentSms: boolean;
  createdAt: string;
  answers: PrequalAnswer[];
  notes?: string;
  rmProspectId?: number;
  tags?: string[];
}

export type ShowingType = "AGENT" | "SELF";
export type ShowingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "UNCONFIRMED_CANCELLED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export interface Showing {
  id: string;
  listingId: string;
  leadId: string;
  agentId?: string;
  type: ShowingType;
  startsAt: string; // ISO datetime
  endsAt: string;
  status: ShowingStatus;
  confirmedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  accessCode?: string;
  codeReleasedAt?: string;
  feedback?: { rating: number; interested: boolean; comments?: string; at: string };
  createdAt: string;
}

export interface Lockbox {
  id: string;
  label: string;
  serial: string;
  provider: "GENERIC";
  listingId?: string;
  location: string; // where on the property it hangs
  codePool: string[];
  usedCodes: string[];
  installedAt: string;
  battery: number;
}

export type Channel = "SMS" | "EMAIL";

export interface MessageTemplate {
  key: string;
  name: string;
  channel: Channel;
  trigger: string;
  subject?: string;
  body: string;
}

export interface Message {
  id: string;
  leadId?: string;
  showingId?: string;
  channel: Channel;
  direction: "OUT" | "IN";
  to: string;
  templateKey?: string;
  subject?: string;
  body: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  at: string;
}

export interface AvailabilityRule {
  id: string;
  agentId?: string;
  listingId?: string; // self-show window
  weekday: number; // 0 = Sunday
  start: string; // "09:00"
  end: string; // "17:00"
  slotMinutes: number;
}

export interface SyncRun {
  id: string;
  startedAt: string;
  finishedAt: string;
  created: number;
  updated: number;
  skipped: number;
  leasedDetected: number;
  prospectsPushed: number;
  notes: string[];
}

export interface RmUnitFixture {
  UnitID: number;
  PropertyID: number;
  PropertyName: string;
  Name: string;
  Bedrooms: number;
  Bathrooms: number;
  SquareFootage: number;
  MarketRent: number;
  IsVacant: boolean;
  AvailableDate: string;
  Comment: string;
  Amenities: string[];
}

export interface Settings {
  companyName: string;
  timezone: string;
  codeReleaseMinutes: number;
  minLeadHours: number;
  confirmDeadlineHours: number;
  autoCancelUnconfirmed: boolean;
  requireIdForSelfShow: boolean;
  quietHours: { start: string; end: string };
  applicationUrl: string;
  defaultPrequalSetId: string;
}
