# Music-Explorer
> POC Demo webapp for AlphaHQ, Let's you explore and share music to the same platform. [*Was not allowed to use MVC frameworks for this project*]

## Screenshots
>
Main Screen | Mobile View
--- | ---
![image](https://cloud.githubusercontent.com/assets/5303018/20080916/5a3f79cc-a51a-11e6-8268-eb7e104b24bc.png) | ![AP's Music Explorer Mobile](https://cloud.githubusercontent.com/assets/5303018/20080827/d797171e-a519-11e6-991f-9860b78dd7d7.png)

## Features:
> #### Back-End
- Modal schema's, validation, static and methods
- Metadata extraction from Audio clips
- Last.FM API: Image Extraction/Artist image API lookup
- API's/Assets require authentication
- For media where there is NO picture and cannot find artist image, I leverage gravatar!
- Full authentication (end-to-end): Routes, Assets, Music Files, Pages
- Uploaded User tracked [*Deleted user support*]
- If music photo not available, use artist Picture instead
#### Front-End
- Hand Coded Styles/Animations
- Material Design
- Responsive site
- Modern Animations (eg. Blurring, Easing Functions)
- HTML5 audio
- ES6 + Promises
- Babel Transpiler for ES2015 back-support
- Uglify, clean-css Minification on every page
- Custom Scrollbars for clean material look
- Hand-Written Ripple effect on FABs / Play button
- Seeking on Music Tracks
- Leveraging Pseudo styles to decrease DOM manipulation
- No Songs page message!
- Sliding Player
- Autoplay the next track, when the current ends
- Play/Pause right from the track!
- Icon swapping for play pause
- Artist Image HD slide animation

## To Deploy:
> - Install `Node`, `Mongo`, `NPM`, `Bower`
 - **WebServer**: npm start
 - **Database**: start 'mongod' "--dbpath ./data"
 - Navigate to localhost:8080
 
---
[Apoorv Verma [AP]](https://www.linkedin.com/in/apoorvverma)
