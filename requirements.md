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
- [ ] Passwords must NOT be stored in plain text
- [ ] Protect against HTML/JavaScript injection in unprotected variables
- [ ] No unauthorized file uploads allowed
- [ ] Protect against SQL injection attacks

---

## Registration & Sign-in

- [ ] Registration requires: email, username, last name, first name, and password
- [ ] Common dictionary words must be rejected as passwords
- [ ] Email verification: user receives a unique link after registration
- [ ] Login via username and password
- [ ] Password reset via email
- [ ] Logout with a single click from any page

---

## User Profile

- [ ] Profile requires: gender
- [ ] Profile requires: sexual preferences
- [ ] Profile requires: biography
- [ ] Profile requires: interest tags (e.g. `#vegan`, `#geek`) — tags must be reusable
- [ ] Profile requires: up to 5 pictures, one designated as profile picture
- [ ] User can update profile info at any time (including last name, first name, email)
- [ ] User can see who has viewed their profile
- [ ] User can see who has liked them
- [ ] Each user has a public "fame rating"
- [ ] GPS location (with explicit consent) down to neighborhood level
- [ ] If GPS denied, user must manually enter approximate location (city/neighborhood)
- [ ] User can modify their location at any time

---

## Browsing

- [ ] Suggested profiles list respects user's sexual preferences (e.g. hetero women see men only)
- [ ] Bisexuality handled; unspecified orientation defaults to bisexual
- [ ] Match scoring based on: geographic proximity
- [ ] Match scoring based on: number of shared interest tags
- [ ] Match scoring based on: fame rating
- [ ] Priority given to users in the same geographic area
- [ ] Suggested list is sortable by: age, location, fame rating, common tags
- [ ] Suggested list is filterable by: age, location, fame rating, common tags

---

## Research / Search

- [ ] Advanced search by age range
- [ ] Advanced search by fame rating range
- [ ] Advanced search by location
- [ ] Advanced search by one or multiple interest tags
- [ ] Search results sortable by: age, location, fame rating, interest tags
- [ ] Search results filterable by: age, location, fame rating, interest tags

---

## Profile View

- [ ] View other users' profiles (all info except email and password)
- [ ] Profile views are recorded in visit history
- [ ] Ability to "like" another user's profile picture (requires own profile picture to be set)
- [ ] Mutual like = users are "connected" and can chat
- [ ] Ability to remove/undo a like (disables chat and future notifications from that user)
- [ ] Check another user's fame rating
- [ ] See if a user is online; if offline, show last connection date/time
- [ ] Report a user as a "fake account"
- [ ] Block a user (they disappear from search results and notifications; chat disabled)
- [ ] Profile clearly shows if the viewed user has liked you or if you are already connected
- [ ] Option to "unlike" or disconnect from a profile

---

## Chat

- [ ] Real-time chat between connected (mutually liked) users (max 10s delay)
- [ ] New message indicator visible from any page

---

## Notifications

- [ ] Real-time notification when receiving a like (max 10s delay)
- [ ] Real-time notification when profile is viewed (max 10s delay)
- [ ] Real-time notification when receiving a message (max 10s delay)
- [ ] Real-time notification when a liked user likes you back (max 10s delay)
- [ ] Real-time notification when a connected user unlikes you (max 10s delay)
- [ ] Unread notification indicator visible from any page

---

## Bonus *(only evaluated if mandatory part is perfect)*

- [ ] OmniAuth strategies for user authentication
- [ ] Personal photo gallery with drag-and-drop upload and basic image editing (crop, rotate, filters)
- [ ] Interactive map of users with precise GPS via JavaScript
- [ ] Video or audio chat for connected users
- [ ] Schedule/organize real-life dates or events for matched users
