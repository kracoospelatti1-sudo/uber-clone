import { describe, it, expect } from 'vitest';

describe('Fare Calculation', () => {
  const calculateFare = (distanceKm: number, timeMinutes: number) => {
    const BASE_FARE = 5;
    const PER_KM = 2;
    const PER_MINUTE = 0.5;
    return BASE_FARE + (distanceKm * PER_KM) + (timeMinutes * PER_MINUTE);
  };

  it('calculates fare correctly for short trip', () => {
    const fare = calculateFare(2, 5);
    expect(fare).toBe(11.5);
  });

  it('calculates fare correctly for medium trip', () => {
    const fare = calculateFare(5, 15);
    expect(fare).toBe(22.5);
  });

  it('calculates fare correctly for long trip', () => {
    const fare = calculateFare(20, 45);
    expect(fare).toBe(67.5);
  });

  it('handles zero distance', () => {
    const fare = calculateFare(0, 10);
    expect(fare).toBe(10);
  });
});

describe('Distance Calculation', () => {
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  it('calculates distance between two points', () => {
    const distance = calculateDistance(-34.6037, -58.3816, -34.6177, -58.3816);
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(2);
  });

  it('returns 0 for same coordinates', () => {
    const distance = calculateDistance(-34.6037, -58.3816, -34.6037, -58.3816);
    expect(distance).toBe(0);
  });
});

describe('Rating Validation', () => {
  const isValidRating = (score: number) => {
    return score >= 1 && score <= 5 && Number.isInteger(score);
  };

  it('accepts valid ratings 1-5', () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(3)).toBe(true);
    expect(isValidRating(5)).toBe(true);
  });

  it('rejects invalid ratings', () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(4.5)).toBe(false);
  });
});
