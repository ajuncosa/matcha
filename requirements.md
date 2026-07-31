# Matcha — Requirements Checklist

---

## General Instructions

- [ ] No unexpected/unhandled errors on server or client side
- [ ] Database must contain at least 500 distinct profiles at evaluation time
- [ ] App must be compatible with latest Firefox and Chrome
- [ ] Well-structured layout: header, main section, and footer
- [ ] Website must be mobile-friendly / responsive
- [ ] All credentials, API keys, and env variables stored in a `.env` file excluded from Git

---

## Security

- [ ] All forms must have proper validation
- [X] Passwords must NOT be stored in plain text
- [X] Protect against HTML/JavaScript injection in unprotected variables
- [X] No unauthorized file uploads allowed
- [X] Protect against SQL injection attacks

---

## Registration & Sign-in

- [X] Registration requires: email, username, last name, first name, and password
- [X] Common dictionary words must be rejected as passwords
- [X] Email verification: user receives a unique link after registration
- [X] Login via username and password
- [X] Password reset via email
- [X] Logout with a single click from any page

---

## User Profile

- [X] Profile requires: gender
- [X] Profile requires: sexual preferences
- [X] Profile requires: biography
- [X] Profile requires: interest tags (e.g. `#vegan`, `#geek`) — tags must be reusable
- [X] Profile requires: up to 5 pictures, one designated as profile picture
- [X] User can update profile info at any time (including last name, first name, email)
- [X] User can see who has viewed their profile
- [X] User can see who has liked them
- [X] Each user has a public "fame rating"
- [X] GPS location (with explicit consent) down to neighborhood level
- [X] If GPS denied, user must manually enter approximate location (city/neighborhood)
- [X] User can modify their location at any time

---

## Browsing

- [X] Suggested profiles list respects user's sexual preferences (e.g. hetero women see men only)
- [X] Bisexuality handled; unspecified orientation defaults to bisexual
- [X] Match scoring based on: geographic proximity
- [X] Match scoring based on: number of shared interest tags
- [X] Match scoring based on: fame rating
- [X] Priority given to users in the same geographic area
- [X] Suggested list is sortable by: age, location, fame rating, common tags
- [X] Suggested list is filterable by: age, location, fame rating, common tags

---

## Research / Search

- [X] Advanced search by age range
- [X] Advanced search by fame rating range
- [X] Advanced search by location
- [X] Advanced search by one or multiple interest tags
- [X] Search results sortable by: age, location, fame rating, interest tags
- [X] Search results filterable by: age, location, fame rating, interest tags

---

## Profile View

- [X] View other users' profiles (all info except email and password)
- [X] Profile views are recorded in visit history
- [X] Ability to "like" another user's profile picture (requires own profile picture to be set)
- [X] Mutual like = users are "connected" and can chat
- [X] Ability to remove/undo a like (disables chat and future notifications from that user)
- [X] Check another user's fame rating
- [X] See if a user is online; if offline, show last connection date/time
- [X] Report a user as a "fake account"
- [X] Block a user (they disappear from search results and notifications; chat disabled)
- [X] Profile clearly shows if the viewed user has liked you or if you are already connected
- [X] Option to "unlike" or disconnect from a profile

---

## Chat

- [X] Real-time chat between connected (mutually liked) users (max 10s delay)
- [X] New message indicator visible from any page

---

## Notifications

- [X] Real-time notification when receiving a like (max 10s delay)
- [X] Real-time notification when profile is viewed (max 10s delay)
- [X] Real-time notification when receiving a message (max 10s delay)
- [X] Real-time notification when a liked user likes you back (max 10s delay)
- [X] Real-time notification when a connected user unlikes you (max 10s delay)
- [X] Unread notification indicator visible from any page
