# [spiteful.ovh](http://spiteful.labs.luxploit.net/)

ripped and re-created out of spite :) previous versions of the site were public as found [here](https://github.com/zfi2/zfi2.github.io/commit/f1f1147a083bebd8b977deb68b80877b98ce5928). 

this version was available from late 2023 to early 2024 as per this [Wayback Snapshot](http://web.archive.org/web/20241230120157/https://lain.ovh/) and was ripped on Jan 11th 2025. 

the frontend was ripped using [SaveWeb2ZIP](https://saveweb2zip.com/) and the backend was faithfully recreated by myself.

### update (22/02/2025):
the current version of the website was made public on Feb 10th 2025 under these repos: [lain.ovh](https://github.com/zfi2/lain.ovh) and [api.lain.ovh](https://github.com/zfi2/api.lain.ovh)

changes over the original:
* always show password box and enforce protected users server-side
* styled password box to match the rest of the ui
* slight rework of the comment gadget handling (simpler errors, easy srv addr change)
* visiblity and placement rework of the "im-still-searching-for-you" text block
* local inclusion of fa6 and updated jQuery
* updated social links

how to run:
1. deploy /www folder to root of your webserver
2. host and reverse proxy out the backend from /api
3. change /www/js/comments.js serverAPI to your backend address
4. check for any issues

screenshots:
![Screenshot 2025-01-11 at 23-05-39 lets all love lain](https://github.com/user-attachments/assets/b8da9c45-ea09-4860-8a1d-37cfeb8f7cbb)
![Screenshot 2025-01-31 at 05-29-43 lets all love lain](https://github.com/user-attachments/assets/811841b2-1006-4b00-85bb-10f483c8fd61)
