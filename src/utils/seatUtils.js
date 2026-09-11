// Exact total count: 6 rows (A to F) * 10 columns = 60 seats
export const TOTAL_SEATS_COUNT = 60;

export const calculateSeatAvailability = (input = 0) => {
  let bookedCount = 0;
  if (Array.isArray(input)) {
    bookedCount = input.length;
  } else if (typeof input === 'number') {
    bookedCount = input;
  }

  const availableSeats = Math.max(0, TOTAL_SEATS_COUNT - bookedCount);

  // 1. SOLD OUT: STRICTLY when 0 seats remain
  if (availableSeats === 0) {
    return {
      status: 'SOLD_OUT',
      label: '🚫 SOLD OUT',
      className: 'badge-sold-out',
      availableCount: 0,
      isHousefull: true
    };
  }

  // 2. ALMOST FULL: 1 to 5 seats remaining
  if (availableSeats <= 5) {
    return {
      status: 'ALMOST_FULL',
      label: `🔥 ALMOST FULL (${availableSeats} LEFT)`,
      className: 'badge-almost-full',
      availableCount: availableSeats,
      isHousefull: false
    };
  }

  // 3. FILLING FAST: 6 to 10 seats remaining
  if (availableSeats <= 10) {
    return {
      status: 'FILLING_FAST',
      label: `⚡ FILLING FAST (${availableSeats} LEFT)`,
      className: 'badge-filling-fast',
      availableCount: availableSeats,
      isHousefull: false
    };
  }

  // 4. AVAILABLE: More than 10 seats remaining
  return {
    status: 'AVAILABLE',
    label: `● AVAILABLE (${availableSeats} SEATS)`,
    className: 'badge-available',
    availableCount: availableSeats,
    isHousefull: false
  };
};
