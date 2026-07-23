/**
 * Every user-facing word on the site lives in this file.
 * Edit copy here — never inside components.
 * Structure is i18n-ready: add `content.es`, `content.de`, etc. later.
 */
import { config } from "./config";

export const content = {
  brand: {
    name: "TuneOfUs",
    domain: "TuneOfUs.com",
    tagline: "Your story. Their song. Ready in 1 hour.",
  },

  hero: {
    eyebrow: `Personalized songs · ${config.tearsOfJoyCount} tears of joy`,
    h1: "Turn your story into the song they'll never stop playing.",
    ctaPrimary: `Create their song → $${config.price.core}`,
    ctaSecondary: "Hear real examples",
    urgencyPill: "Launch price — ends soon",
    annotation: "press play. seriously.",
    trust: [
      { icon: "bolt", label: "1-hour delivery" },
      { icon: "shield", label: "Love-it guarantee" },
      { icon: "star", label: `${config.trustpilotScore} on Trustpilot` },
    ],
    samples: [
      { id: "pop", label: "Pop", src: "/audio/demo-pop.mp3" },
      { id: "acoustic", label: "Acoustic", src: "/audio/demo-acoustic.mp3" },
      { id: "country", label: "Country", src: "/audio/demo-country.mp3" },
    ],
  },

  howItWorks: {
    heading: "How it works",
    sub: "Three minutes of your time. A lifetime of replays.",
    steps: [
      {
        track: "Track 01",
        title: "Tell us your story",
        body: "5 questions, 3 minutes. How you met, what makes them laugh, the things you'd say if you had one song to say it.",
      },
      {
        track: "Track 02",
        title: "We craft the song",
        body: "Your names, your memories, your inside jokes — written into real lyrics and recorded in the style you pick.",
      },
      {
        track: "Track 03",
        title: "Delivered in 1 hour",
        body: "A private link lands in your inbox (and your phone). They'll replay it forever. So will you.",
      },
    ],
  },

  reactions: {
    heading: "The moment they press play",
    sub: "Real reactions from real orders. Get your camera ready.",
    annotation: "this part gets them",
    videos: [
      { id: "r1", poster: "/reactions/r1-poster.jpg", src: "/reactions/r1.mp4", caption: "“My mum called me crying — twice.” — Sarah, Melbourne" },
      { id: "r2", poster: "/reactions/r2-poster.jpg", src: "/reactions/r2.mp4", caption: "“He doesn't cry. He cried.” — Jess, London" },
      { id: "r3", poster: "/reactions/r3-poster.jpg", src: "/reactions/r3.mp4", caption: "“Played it at the wedding. Not a dry eye.” — Marcus, Austin" },
      { id: "r4", poster: "/reactions/r4-poster.jpg", src: "/reactions/r4.mp4", caption: "“She made me play it 9 times in a row.” — Tom, Dublin" },
      { id: "r5", poster: "/reactions/r5-poster.jpg", src: "/reactions/r5.mp4", caption: "“Dad kept it on repeat all weekend.” — Priya, Sydney" },
      { id: "r6", poster: "/reactions/r6-poster.jpg", src: "/reactions/r6.mp4", caption: "“Best $19 I've ever spent. Ever.” — Kate, Chicago" },
    ],
  },

  occasions: {
    heading: "Whatever the occasion, there's a song in it",
    items: [
      { slug: "anniversary", label: "Anniversary" },
      { slug: "for-mum", label: "For Mum" },
      { slug: "for-dad", label: "For Dad" },
      { slug: "wedding", label: "Wedding" },
      { slug: "birthday", label: "Birthday" },
      { slug: "new-baby", label: "New baby" },
      { slug: "for-your-person", label: "For your person" },
      { slug: "just-because", label: "Just because" },
    ],
  },

  comparison: {
    heading: "The math is not close",
    other: {
      label: "Other custom song services",
      points: ["$200+", "Up to a week of waiting", "One shot, hope it lands"],
    },
    us: {
      label: "TuneOfUs",
      points: [`$${config.price.core}`, "Ready in 1 hour", "Unlimited replays of their reaction"],
    },
  },

  offer: {
    heading: "Everything you need to make them cry (happy tears)",
    includes: [
      "A full ~2-minute song, studio quality",
      "Lyrics with their name & your memories",
      "Private share link + MP4 download",
      "Delivered by email & SMS in 1 hour",
    ],
    priceNote: "one-time · no subscription",
    cta: `Create their song → $${config.price.core}`,
    guarantee: "If it doesn't make them feel something, we'll remake it free.",
  },

  faq: {
    heading: "Questions people ask right before they order",
    items: [
      {
        q: "How fast is delivery, really?",
        a: "One hour, for real. You'll get an email (and a text if you leave your number) the moment your song is ready. Late nights and weekends included — love doesn't keep office hours.",
      },
      {
        q: "What if I don't like it?",
        a: "Tell us what's off and we'll revise it once, free. And if it still doesn't make them feel something, we'll remake it from scratch at no charge. That's the love-it guarantee.",
      },
      {
        q: "What languages and styles can you do?",
        a: "English is our home turf, and we also write in Spanish, French, German, Italian and Portuguese. Styles: Pop, Acoustic, Country, R&B and Rock — with a mood dial from tear-jerker to party-starter.",
      },
      {
        q: "Can I use it on Instagram or TikTok?",
        a: "Yes — it's your song. You get an MP4 made for posting, and reaction videos tagged #MyTuneOfUs are our favorite thing on the internet.",
      },
      {
        q: "Is it really about OUR story?",
        a: "Completely. The lyrics are built from your answers — names, places, inside jokes, the moment you met. No templates, no fill-in-the-blank verses. If you mention the burnt lasagna, the burnt lasagna is in the song.",
      },
      {
        q: "How do they receive it?",
        a: "You get a private link and an MP4. Most people play it in person and film the reaction — but you can also text the link, or we can email it straight to them at a date and time you pick.",
      },
    ],
  },

  form: {
    progressLabel: "Your song",
    steps: {
      recipient: {
        question: "Who is this song for?",
        options: [
          { value: "Partner" },
          { value: "Mum" },
          { value: "Dad" },
          { value: "Friend" },
          { value: "Child" },
          { value: "Pet" },
          { value: "Someone we miss" },
          { value: "Other" },
        ],
      },
      occasion: {
        question: "What's the occasion?",
      },
      names: {
        question: "Who's in this story?",
        theirName: "Their name",
        theirPlaceholder: "e.g. Maria",
        yourName: "Your name(s)",
        yourPlaceholder: "e.g. Alex — or Alex & the kids",
      },
      story: {
        question: "Tell us your story",
        hint: "The more real details, the more it hits. Names, places, tiny moments.",
        placeholders: [
          "How did you meet? What's a moment only you two laugh about?",
          "What would you say if you had one song to say it?",
          "What's the little thing they do that you'd miss most?",
          "Describe the day you knew they were your person.",
        ],
        nudge: "A little more detail makes the song 10x more personal — one more memory?",
        minChars: 100,
      },
      vibe: {
        question: "Pick the vibe",
        styleLabel: "Style",
        styles: [
          { value: "Pop", preview: "/audio/demo-pop.mp3" },
          { value: "Acoustic", preview: "/audio/demo-acoustic.mp3" },
          { value: "Country", preview: "/audio/demo-country.mp3" },
          { value: "R&B", preview: "/audio/demo-rnb.mp3" },
          { value: "Rock", preview: "/audio/demo-rock.mp3" },
          { value: "Hip-Hop", preview: "/audio/demo-hiphop.mp3" },
          { value: "Latin", preview: "/audio/demo-latin.mp3" },
          { value: "Indie Folk", preview: "/audio/demo-folk.mp3" },
        ],
        customStyleLabel: "Or describe your own style",
        customStylePlaceholder: "e.g. 80s synthwave, bossa nova, gospel choir…",
        moodLabel: "Mood",
        moods: ["Romantic", "Fun", "Emotional", "Uplifting"],
      },
      delivery: {
        question: "Where do we send it?",
        emailLabel: "Your email",
        emailPlaceholder: "you@example.com",
        phoneLabel: "Phone (optional)",
        phonePlaceholder: "+1 555 000 0000",
        phoneHint: "so you don't miss the 1-hour delivery",
      },
    },
    next: "Next",
    back: "Back",
    submit: "Review my order →",
    saveExitModal: {
      title: "Your song is 60% ready to order",
      body: "Your answers are saved. Finish in 1 minute?",
      cta: "Finish my song",
      dismiss: "Maybe later",
    },
  },

  review: {
    heading: "One last look before we start writing",
    songFor: "A song for",
    occasion: "Occasion",
    vibe: "Vibe",
    bump: {
      title: "Add a second version in a different style — just $" + config.price.bump,
      sub: "Same story, two songs. Most people add this.",
    },
    lineCore: "Personalized Song",
    lineBump: "Second version (different style)",
    total: "Total",
    cta: "Continue to secure checkout →",
    secure: "Secure checkout by Stripe · Apple Pay & Google Pay",
  },

  thanks: {
    heading: "We're writing your song right now.",
    sub: "It'll hit your inbox within 1 hour.",
    recapHeading: "Your order",
    upsell: {
      title: `Turn it into a photo video — $${config.price.upsell}`,
      body: "We set your song to your photos. Perfect for posting their reaction.",
      cta: `Add the photo video → $${config.price.upsell}`,
    },
    waiting: "While you wait: get your camera ready. You'll want to film their reaction. Tag #MyTuneOfUs.",
  },

  stickyCta: `Create their song → $${config.price.core}`,

  footer: {
    email: "hello@tuneofus.com",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refund", label: "Refund policy" },
    ],
    note: "Made with love (and a lot of replays). TuneOfUs.com",
  },
};

export type Content = typeof content;
