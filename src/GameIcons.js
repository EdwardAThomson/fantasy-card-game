import React from 'react';

// Small inline SVG icon set for the game screen chrome. Icons inherit
// `currentColor`, so they pick up the button's text colour.
function Icon({ children, size = 20, title, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export const HomeIcon = (props) => (
  <Icon {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 9.5V20h5v-5.5h3V20h5V9.5" />
  </Icon>
);

export const HelpIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 4" />
    <circle cx="12" cy="17.2" r="0.6" fill="currentColor" />
  </Icon>
);

export const ScrollIcon = (props) => (
  <Icon {...props}>
    <path d="M7 4h11a2 2 0 0 1 2 2v1h-4" />
    <path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10" />
    <path d="M7 4a2 2 0 0 0-2 2v11" />
    <path d="M8.5 9h4.5M8.5 12.5h4.5" />
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SwordIcon = (props) => (
  <Icon {...props}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
  </Icon>
);

export const BowIcon = (props) => (
  <Icon {...props}>
    <path d="M7 3.5a14 14 0 0 1 13.5 13.5" />
    <path d="M7 3.5 20.5 17" strokeWidth="1" />
    <path d="M3.5 20.5 15 9" />
    <path d="M15 9h-3.2M15 9v3.2" />
    <path d="M3.5 20.5 4 17.5M3.5 20.5l3-.5" />
  </Icon>
);

export const StaffIcon = (props) => (
  <Icon {...props}>
    <path d="M5 20 15 10" />
    <path d="M17 3.5 18 6l2.5 1-2.5 1-1 2.5-1-2.5L13.5 7 16 6z" />
    <path d="m8 4 .5 1.5L10 6l-1.5.5L8 8l-.5-1.5L6 6l1.5-.5z" strokeWidth="1.4" />
  </Icon>
);

export const CrossedSwordsIcon = (props) => (
  <Icon {...props}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6M16 16l4 4M19 21l2-2" />
    <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
    <path d="m5 14 4 4M7 17l-3 3M3 19l2 2" />
  </Icon>
);
