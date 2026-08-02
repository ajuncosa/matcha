- [X] Check if you can reset password if account is not validated
    User can reset password if the account is not validated. But still cannot login

- [X] Limit preference age on welcome page and profile page to a minimum of 18 years old
- [X] Check if own user age is bigger than 18 on registration
- [X] Limit tag number per user to 10 & limit tag name characters to 30 chars
- [X] Improve profile photos dipslay. Put a grid or something
- [x] On search page if there is only one result, make it same size as if there were more. Right now is full width card. Same for browse page
- [X] Upload pictures ui form is borken
- [X] Change like button if was already pressed to show the action "Unlike".
- [x] On browse page set distance as default sorting property
- [X] Make search page cards consistent with browse page.
    - [X] Common tags must be highlited instead of showing text (n common tags)
    - [X] Show distance
- [X] Distance selector not working on search page
- [X] Add a clear filters button on search page
- [X] Location sort on search page not working
- [X] Show username on profile page
- [x] Check chat notification, it is not working
- [X] User must select the chat, do not open the first one by default
- [X] Add link on chat page to go to user profile page
- [X] Fix unlike action, right now the users chats are not disabled
- [X] Add last connection to chat AND connection status (red, green dot). real time!
- [X] Fix title of login page, asks for email instead of username
- [X] Like notifications are not working
- [X] Ensure uploaded files are photos
- [X] Populate all images of seed users
- [X] Commonly used dictionary words (regardless of language) should not be accepted as passwords
    maybe use this https://ftp.gnu.org/gnu/aspell/dict/0index.html (aspell) || /usr/share/dict/words file
- [X] Improve chat, make it look better when there is no conversation. Like adding borders for example.


01/08
- [X] You can create a username with spaces
- [X] When selecting your age, the calendar opens on today's date even if you cannot select anything until 18 years ago
- [X] In the edit profile dialog, in preferences, you cannot erase and re-write the min/max age, it's validated and overwritten with the minimum before the user manually saves
- [ ] Browser does not show people who are not interested in my sex and gender, but it does show people that are not interested in my age
- [X] When I'm editing my profile, if I change something and don't save, when I re-open the edit profile dialog, the change is still there, pending to be committed. Is this something we want or should the state of the dialog be reset when we close it without saving?
- [X] Review errors and warnings on the browser's web developer tools
- [X] Make the coopyright footer non-sticky (so it appears at the bottom of the page only if you scroll down to it)
- [X] When searching by name, spaces don't work for some reason, i can only search by either first or last name but not "Name Lastname"
- [X] If I block someone, they can still see when I visit their profile in the visit history
- [X] DO NOT ALLOW the upload of unauthorized content => e.g. non-jpg images. Currently prints very long error message from the backend into the frontend
