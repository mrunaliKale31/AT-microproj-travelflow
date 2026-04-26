# Security Specification - Wanderlust Travel

## 1. Data Invariants
- A booking must always belong to a user who is authenticated.
- A user can only read and write their own bookings.
- Once a booking is created, its `userId` and `price` cannot be changed.
- `createdAt` is immutable after creation.
- `status` can only be changed to 'Cancelled'.

## 2. The Dirty Dozen Payloads
1. **Identity Theft**: Create a booking for another user ID.
2. **Price Manipulation**: Update the price of an existing booking.
3. **Orphaned Booking**: Create a booking without a corresponding user profile.
4. **Shadow Field**: Add `isVerified: true` to a user profile.
5. **Schema Breach**: Save `price` as a string.
6. **Bypass Auth**: Access `/users/some-id/bookings` without being logged in.
7. **Resource Exhaustion**: Use a 2MB string for the `name` field.
8. **ID Poisoning**: Use a path like `/users/../../system` for an ID.
9. **State Shortcut**: Change a 'Cancelled' booking back to 'Confirmed'.
10. **Query Scraping**: Attempt to list all bookings across all users.
11. **Timestamp Spoofing**: Provide a future/past `createdAt` from the client.
12. **Public Data Leak**: Read another user's profile info.

## 3. Test Runner (Mock Logic)
The following rules will ensure all these payloads return `PERMISSION_DENIED`.
