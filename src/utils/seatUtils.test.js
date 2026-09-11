import { describe, it, expect } from 'vitest';
import { calculateSeatAvailability, TOTAL_SEATS_COUNT } from './seatUtils';

describe('GrabASeat - Unit Testing Matrix Logic', () => {

  // Test 1: Verify total seats constant
  it('validates standard capacity is 60 seats', () => {
    expect(TOTAL_SEATS_COUNT).toBe(60);
  });

  // Test 2: >10 seats left -> AVAILABLE
  it('returns AVAILABLE when > 10 seats remain', () => {
    const res = calculateSeatAvailability(20); // 40 left
    expect(res.status).toBe('AVAILABLE');
    expect(res.availableCount).toBe(40);
    expect(res.isHousefull).toBe(false);
  });

  // Test 3: 6 to 10 seats left -> FILLING_FAST
  it('returns FILLING_FAST when 6 to 10 seats remain', () => {
    const res = calculateSeatAvailability(52); // 8 left
    expect(res.status).toBe('FILLING_FAST');
    expect(res.availableCount).toBe(8);
    expect(res.isHousefull).toBe(false);
  });

  // Test 4: 1 to 5 seats left -> ALMOST_FULL
  it('returns ALMOST_FULL when 1 to 5 seats remain', () => {
    const res = calculateSeatAvailability(58); // 2 left
    expect(res.status).toBe('ALMOST_FULL');
    expect(res.availableCount).toBe(2);
    expect(res.isHousefull).toBe(false);
  });

  // Test 5: 0 seats left -> SOLD_OUT
  it('returns SOLD_OUT strictly when 0 seats remain', () => {
    const res = calculateSeatAvailability(60); // 0 left
    expect(res.status).toBe('SOLD_OUT');
    expect(res.availableCount).toBe(0);
    expect(res.isHousefull).toBe(true);
  });

  // Test 6: Works with array of booked seat IDs from DB
  it('correctly handles an array input of booked seat IDs', () => {
    const booked = ['A1', 'A2', 'C4', 'E10']; // 4 seats booked
    const res = calculateSeatAvailability(booked);
    expect(res.availableCount).toBe(56);
    expect(res.status).toBe('AVAILABLE');
  });

});