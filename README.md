# 🍻 Round Robin Drinking App

A fun Next.js app to manage drinking rounds with friends! Take turns, track drinks, and get notified when it's time for the next person.

## Features

- **Add/Remove People**: Easily manage your drinking group
- **Round Robin Turns**: Automatically cycles through everyone
- **Configurable Timer**: Set custom timer duration (default 2 minutes)
- **Audio Notifications**: Beeps when time is up (with browser notification fallback)
- **Drink Tracking**: See how many drinks each person has had
- **Pause/Resume**: Control the timer as needed
- **Reset Functionality**: Start fresh rounds
- **Responsive Design**: Works on mobile and desktop

## How to Use

1. **Add People**: Enter names and click "Add" to build your drinking group
2. **Set Timer**: Choose how long each person has (1-10 minutes)
3. **Start Round**: Click "Start Round" to begin the timer
4. **Take Turns**: When someone finishes their drink, click "🍻 Drank!" to advance
5. **Timer Notifications**: The app will beep when time is up and auto-advance
6. **Control**: Use Pause/Resume to control the flow, or Reset to start over

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Web Audio API** for notifications

## Browser Compatibility

- Modern browsers with Web Audio API support
- Mobile-friendly responsive design
- Works offline (state resets on page refresh)

## Tips

- The app requests notification permission for better alerts
- Timer continues in background but may pause when tab is inactive
- All data is stored in memory (resets on page refresh)
- Use the "Reset" button to start a fresh round with everyone

Enjoy responsibly! 🍻# baso
