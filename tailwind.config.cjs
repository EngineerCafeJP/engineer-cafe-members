module.exports = {
  content: [
    './index.html',
    './**/*.{ts,tsx,html}',
    '!./node_modules/**/*',
  ],
  theme: {
    extend: {
      colors: {
        'grok-green': '#00FF00',
      },
      accentColor: {
        'grok-green': '#00FF00',
      },
    },
  },
  plugins: [],
};
