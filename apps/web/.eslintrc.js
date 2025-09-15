module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    // Disable unescaped entities rule for better readability
    'react/no-unescaped-entities': 'off',
    // Disable img element warning for now
    '@next/next/no-img-element': 'off',
    // Disable exhaustive deps warning for now
    'react-hooks/exhaustive-deps': 'warn'
  }
};