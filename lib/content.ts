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
    // Landing "doors" — each deep-links into the wizard, pre-filling the
    // recipient and/or occasion so cold traffic starts already personalized.
    items: [
      { slug: "anniversary", label: "Anniversary", query: "recipient=Partner&occasion=Anniversary" },
      { slug: "for-mum", label: "For Mum", query: "recipient=Mum" },
      { slug: "for-dad", label: "For Dad", query: "recipient=Dad" },
      { slug: "wedding", label: "Wedding", query: "recipient=Partner&occasion=Wedding" },
      { slug: "birthday", label: "Birthday", query: "occasion=Birthday" },
      { slug: "new-baby", label: "New baby", query: "recipient=Child&occasion=New baby" },
      { slug: "for-your-person", label: "For your person", query: "recipient=Partner" },
      { slug: "just-because", label: "Just because", query: "occasion=Just because" },
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
    // Affirmation shown under the progress bar — increases emotional
    // investment one step at a time (Airbnb/Apple-style). {name} fills in
    // once we know the recipient's name.
    reinforce: [
      "Let's make something they'll never forget.",
      "Beautiful choice. This is going to be special.",
      "Now it's starting to feel personal.",
      "This is the part that makes them cry.",
      "Almost there — let's set the mood.",
      "One last step and their song is on its way.",
    ],
    steps: {
      recipient: {
        question: "Who is this song for?",
        subtitle: "We'll shape every question around them.",
        options: [
          { value: "Partner" },
          { value: "Mum" },
          { value: "Dad" },
          { value: "Child" },
          { value: "Friend" },
          { value: "Pet" },
          { value: "Someone we miss" },
          { value: "Someone else" },
        ],
      },
      occasion: {
        question: "What's the moment?",
        subtitle: "Pick the one that fits best.",
        // Adaptive per recipient — no more mixing "For Mum" with occasions.
        byRecipient: {
          Partner: ["Anniversary", "Valentine's Day", "Proposal", "Wedding / first dance", "Birthday", "Just because"],
          Mum: ["Mother's Day", "Birthday", "A big thank you", "Just because"],
          Dad: ["Father's Day", "Birthday", "A big thank you", "Just because"],
          Child: ["Birthday", "New baby", "Graduation", "Just because"],
          Friend: ["Birthday", "Wedding", "Graduation", "A big thank you", "Just because"],
          Pet: ["Birthday", "Gotcha day", "In loving memory", "Just because"],
          "Someone we miss": ["In loving memory", "Celebration of life", "Their birthday", "An anniversary"],
          "Someone else": ["Birthday", "Anniversary", "Wedding", "Graduation", "A big thank you", "Just because"],
        } as Record<string, string[]>,
        default: ["Birthday", "Anniversary", "Wedding", "Graduation", "A big thank you", "Just because"],
      },
      names: {
        question: "Let's get the names right",
        subtitle: "Exactly as they'll be sung.",
        theirName: "Their name",
        theirPlaceholder: "e.g. Maria",
        yourName: "From (your name)",
        yourPlaceholder: "e.g. Alex — or Alex & the kids",
      },
      story: {
        // Adaptive title/placeholder/tone per recipient. {name} interpolated.
        byRecipient: {
          Partner: {
            question: "Tell us your love story",
            hint: "The little details are what make {name} cry — names, places, inside jokes.",
            placeholders: [
              "How did you and {name} meet?",
              "What's a moment only the two of you laugh about?",
              "What would you say if you had one song to say it?",
              "The day you knew {name} was the one…",
            ],
          },
          Mum: {
            question: "Tell us about your mum",
            hint: "What makes {name} one of a kind? The more real, the better.",
            placeholders: [
              "What makes {name} so special?",
              "A moment with {name} you'll never forget…",
              "Something she always says or does…",
              "What do you most want her to know?",
            ],
          },
          Dad: {
            question: "Tell us about your dad",
            hint: "What makes {name} one of a kind? The more real, the better.",
            placeholders: [
              "What makes {name} so special?",
              "A moment with {name} you'll never forget…",
              "Something he always says or does…",
              "What do you most want him to know?",
            ],
          },
          Child: {
            question: "Tell us about {name}",
            hint: "The tiny details are the magic — what do you love most?",
            placeholders: [
              "What makes {name} light up the room?",
              "A moment you never want to forget…",
              "Their funny little habits and favorite things…",
              "What do you hope {name} always remembers?",
            ],
          },
          Friend: {
            question: "Tell us about your friendship",
            hint: "The inside jokes and the ride-or-die moments — give us the good stuff.",
            placeholders: [
              "How did you and {name} become inseparable?",
              "The story you two always end up retelling…",
              "An inside joke no one else would get…",
              "What does {name} mean to you?",
            ],
          },
          Pet: {
            question: "Tell us about {name}",
            hint: "The zoomies, the habits, the love — paint the picture.",
            placeholders: [
              "How did {name} come into your life?",
              "Their funniest, most {name} thing to do…",
              "The way they greet you at the door…",
              "What makes {name} the best?",
            ],
          },
          "Someone we miss": {
            question: "Share the memories you'd love this song to hold",
            hint: "Take your time. Whatever you share, we'll hold it gently.",
            placeholders: [
              "A moment with {name} you never want to forget…",
              "The way {name} made people feel…",
              "Something {name} always said or did…",
              "What you'd give anything to tell them now…",
            ],
          },
        } as Record<string, { question: string; hint: string; placeholders: string[] }>,
        default: {
          question: "Tell us your story",
          hint: "The more real the details, the more the song hits. Names, places, tiny moments.",
          placeholders: [
            "How did you two meet, or what's your history?",
            "A moment together you'll never forget…",
            "An inside joke or a habit that's so them…",
            "What do you most want them to know?",
          ],
        },
        nudge: "A little more detail makes the song 10x more personal — one more memory?",
        minChars: 100,
      },
      vibe: {
        question: "Now, the sound",
        subtitle: "Tap a style to hear a real example.",
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
        voiceLabel: "Singer",
        voices: ["Female", "Male", "Duet", "Surprise me"],
      },
      delivery: {
        question: "Where should we send it?",
        subtitle: "Your song lands here within the hour.",
        emailLabel: "Your email",
        emailPlaceholder: "you@example.com",
        phoneLabel: "Phone (optional)",
        phonePlaceholder: "+1 555 000 0000",
        phoneHint: "so you don't miss the 1-hour delivery",
        reassurance: "1-hour delivery · Love-it guarantee or your money back · 4.9★ from 1,200+ orders",
      },
    },
    next: "Next",
    back: "Back",
    submit: "See my song's summary →",
    saveExitModal: {
      title: "Your song is almost ready to order",
      body: "Your answers are saved. Finish in under a minute?",
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
