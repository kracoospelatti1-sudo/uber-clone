/**
 * Tipos TypeScript para la aplicacion Uber Clone
 * Ultima actualizacion: 2026-03-21
 */

export type UserRole = 'passenger' | 'driver' | 'admin';
export type RideStatus = 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type VehicleType = 'economico' | 'comfort' | 'black' | 'xl';
export type ReportReason = 'inappropriate_behavior' | 'vehicle_condition' | 'safety' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type NotificationType = 'ride_update' | 'driver_nearby' | 'ride_complete' | 'ride_accepted' | 'ride_cancelled';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  rating: number;
  is_suspended: boolean;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_plate: string;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_year: number | null;
  is_available: boolean;
  current_lat: number | null;
  current_lng: number | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface DriverStats {
  driver_id: string;
  total_rides: number;
  total_rating: number;
  rating_count: number;
  total_earnings: number;
  cancellation_count: number;
  updated_at: string;
}

export interface VehicleDocument {
  id: string;
  driver_id: string;
  license_plate: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_type: VehicleType;
  photo_front: string | null;
  photo_back: string | null;
  license_photo: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  status: RideStatus;
  fare: number | null;
  distance_km: number | null;
  estimated_time: number | null;
  requested_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface RideWithDetails extends Ride {
  passenger_name?: string;
  driver_name?: string;
  driver_phone?: string;
  license_plate?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  driver_rating?: number;
  avatar_url?: string;
}

export interface Rating {
  id: string;
  ride_id: string;
  rater_id: string;
  rated_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  ride_id: string;
  passenger_id: string;
  amount: number;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  ride_id: string;
  sender_id: string;
  sender_name?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reported_id: string;
  reported_name?: string;
  ride_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface RideCancellation {
  id: string;
  ride_id: string;
  cancelled_by: string;
  reason: string | null;
  created_at: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverWithStats extends DriverProfile {
  full_name: string;
  phone: string | null;
  rating: number;
  avatar_url: string | null;
  distance?: number;
  total_rides?: number;
}

export interface DriverLocationUpdate {
  lat: number;
  lng: number;
  heading?: number;
}

export interface ETAResponse {
  distance_km: number;
  eta_minutes: number;
  driver_lat: number | null;
  driver_lng: number | null;
}

export interface AdminStats {
  total_users: number;
  total_drivers: number;
  total_passengers: number;
  total_rides_today: number;
  total_rides_week: number;
  total_rides_month: number;
  pending_reports: number;
  pending_verifications: number;
  total_earnings_today: number;
}

export interface EarningsStats {
  today: number;
  week: number;
  month: number;
  total: number;
  rides_today: number;
  rides_week: number;
  rides_month: number;
}
