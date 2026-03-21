export type UserRole = 'passenger' | 'driver' | 'admin';
export type RideStatus = 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  rating: number;
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
  verified: boolean;
  created_at: string;
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

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}
