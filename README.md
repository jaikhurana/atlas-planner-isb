# Atlas Events

You are a senior product engineer building a production-quality MVP quickly.
Focus on simple architecture and working features.
Use Supabase for backend and React for frontend.
Optimize for speed of development.


Build a mobile-first web application called **Atlas**.

Atlas is a campus event platform designed for MBA students at ISB.

Goal:
Create a unified calendar where students can discover, track, and organize campus events from:
• Administration
• Clubs
• Students themselves

Tech stack:
• Frontend: React + Tailwind
• Backend: Supabase
• Authentication: Email login restricted to @isb.edu domain
• Database: Supabase PostgreSQL

User roles:
1. Student
2. Club
3. Admin

Core concept:
Two calendar layers:

GLOBAL CALENDAR
- shows all events on campus
- admin events
- club events
- open invite student events

PERSONAL CALENDAR
- mandatory events auto added
- events the student saved
- personal private events

Main navigation (bottom tab bar):
1. Home
2. Global Calendar
3. Personal Calendar
4. Create Event
5. Profile

Design:
Minimal, modern, mobile-first.
Use card layouts and simple icons.
Color coding:
Admin events → red
Club events → blue
Student events → green
Private events → grey

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://atlas-planner-isb.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b84c820-ffee-4c53-9b39-2c0d9c9fe90e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
