# 1Clip.

Level up your creativity!
Show off your best gaming moments, epic screenshots, hilarious clips, jaw-dropping fanart, and immersive fanfic — all in one place. Whether you’re here to flex your skills, share your stories, or just vibe with fellow gamers, this is your arena. Upload, explore, and connect with a community that celebrates every pixel and every word.

## Stack
- Typescript
- Node JS
- [SolidJS 2.0](https://www.solidjs.com/)
- PostgreSQL 18 via [Neon](https://neon.com/)
- Redis
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Resend](https://resend.com/)
- [Railway](https://railway.com/)

### Auth
[Better Auth](https://www.better-auth.com/) is used to handle authentication and Resnd to send confirmation emails. Users can change usernames, emails, passwords, reset passwords and delete their entire account. 

### Techniques
Intersection Observer combined with keyset database pagination to provide a seamless blazing fast user experience.
Redis pub/sub and server-sent events to deliver realtime notifications to the user.
Client-side uploads using presigned URLS
SolidJS 2.0's reactivity model makes async a breeze. I used the `broadcast()` function on the frontend and Redis sorted sets + hashes on the backend to broadcast online users and the game they're currently playing.

### AI Usage
**AI-assisted, not vibe-coded**. I created the overall architecture and used AI to speed up development. I read each line the agents wrote, tested the code and manually made changes when they hallucinated or I just didn't like their output.