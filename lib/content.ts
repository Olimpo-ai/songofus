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
    tagline: "The story only you two share, turned into a song only you two will have.",
  },

  hero: {
    eyebrow: "Personalized love songs",
    h1: "Surprise your partner with a song made from your real love story.",
    sub: "Their name, your memories and the moments only you two understand — turned into a one-of-a-kind song.",
    ctaPrimary: "Create Your Love Song",
    ctaSecondary: "Hear a real one",
    urgencyPill: "Launch price — ends soon",
    annotation: "press play. seriously.",
  },

  /**
   * The proof section — replaces the abstract style picker. Each card shows
   * what a couple actually wrote, the exact lyric that came back, and the
   * finished song. This is what makes personalization concrete.
   */
  proof: {
    heading: "This is what personalization actually sounds like.",
    sub: "Three real couples. What they told us, and the song that came back.",
    labelStory: "What they told us",
    labelSong: "What came back",
    annotation: "read the lyrics 🎧",
    items: [
      {
        id: "lisbon",
        couple: "Maria & Alex",
        context: "10 years together · Acoustic",
        story:
          "We met at a tiny café in Lisbon when she asked to borrow my phone charger. Ten years later we still argue about who fell first. She burns the lasagna every Sunday and we eat it anyway.",
        lyric: "At that tiny cafe\nIn Lisbon rain\nYou asked for my charger\nLike it was nothing",
        lyricTail: "You burn the lasagna\nLike every week",
        title: "Charger at the Cafe",
        src: "/audio/demo-acoustic.mp3",
      },
      {
        id: "hoodies",
        couple: "Alicia & Marcus",
        context: "Anniversary · R&B",
        story:
          "We slow-danced in the rain outside our first apartment. She steals my hoodies and swears they fit her better. After all these years she still makes me nervous.",
        lyric: "You take my hoodies\nCall them yours\nSay they fit you\nBetter than before",
        lyricTail: "I'm still nervous by you",
        title: "Rain on Lenox",
        src: "/audio/demo-rnb.mp3",
      },
      {
        id: "barcelona",
        couple: "Sofia & Diego",
        context: "Just because · Latin",
        story:
          "We met dancing at her cousin's wedding in Barcelona. My salsa is terrible — she laughed at every step and never let go of my hand.",
        lyric: "I stepped on every line\nyou smiled like you knew\nthat my feet were lying\nbut your hand pulled me through",
        lyricTail: "Sofia, I still want that dance",
        title: "Sofia in Barcelona",
        src: "/audio/demo-latin.mp3",
      },
    ],
  },

  howItWorks: {
    heading: "How it works",
    sub: "Three minutes of your time. A song they'll keep forever.",
    steps: [
      {
        track: "Track 01",
        title: "Tell us your story",
        body: "How you met, the inside joke, the thing you'd say if you had one song to say it. Three minutes, that's it.",
      },
      {
        track: "Track 02",
        title: "We write your song",
        body: "Their name, your memories, your moments — written into real lyrics and recorded studio-quality.",
      },
      {
        track: "Track 03",
        title: "It lands in your inbox",
        body: "A private link, ready to play for them. Minutes, not days.",
      },
    ],
  },

  reactions: {
    heading: "The moment they press play",
    sub: "Real reactions from real orders. Get your camera ready.",
    annotation: "this part gets them",
    videos: [
      { id: "r5", poster: "/reactions/r5-poster.jpg", src: "/reactions/r5.mp4", caption: "“We listened to it three times before saying a word.” — Priya, Sydney" },
      { id: "r2", poster: "/reactions/r2-poster.jpg", src: "/reactions/r2.mp4", caption: "“She swore she wouldn't cry. She cried.” — Tom, London" },
      { id: "r3", poster: "/reactions/r3-poster.jpg", src: "/reactions/r3.mp4", caption: "“Played it at our wedding. Not a dry eye.” — Marcus, Austin" },
      { id: "r1", poster: "/reactions/r1-poster.jpg", src: "/reactions/r1.mp4", caption: "“He played it in the car and I completely lost it.” — Sarah, Melbourne" },
    ],
  },

  occasions: {
    heading: "When people surprise their person",
    // Landing "doors" — each deep-links into the wizard with the occasion
    // pre-filled, so cold traffic starts already personalized.
    items: [
      { slug: "anniversary", label: "Anniversary", query: "occasion=Anniversary" },
      { slug: "their-birthday", label: "Their birthday", query: "occasion=Their birthday" },
      { slug: "proposal", label: "A proposal", query: "occasion=A proposal" },
      { slug: "just-because", label: "Just because", query: "occasion=Just because" },
    ],
  },

  offer: {
    heading: "A song that can't be bought off a shelf",
    includes: [
      "A full ~2-minute song, studio quality",
      "Lyrics built from your names and your memories",
      "Private link to play, save and share",
      "In your inbox in minutes",
    ],
    priceNote: "one-time · no subscription",
    cta: `Create Your Love Song — $${config.price.core}`,
    guarantee: "If it doesn't make them feel something, we'll remake it free.",
  },

  faq: {
    heading: "Questions people ask right before they order",
    items: [
      {
        q: "How fast is delivery, really?",
        a: "Minutes, not days. Your song lands in your inbox almost as soon as you order — late nights and weekends included. Love doesn't keep office hours.",
      },
      {
        q: "What if I don't like it?",
        a: "Tell us what's off and we'll revise it once, free. And if it still doesn't make them feel something, we'll remake it from scratch at no charge. That's the love-it guarantee.",
      },
      {
        q: "What languages and styles can you do?",
        a: "English is our home turf, and we also write in Spanish, French, German, Italian and Portuguese. Styles: Pop, Acoustic, Country, R&B, Rock, Hip-Hop, Latin, Indie Folk, Reggae, Gospel, Dance/EDM, Jazz, Afrobeats, Lo-fi — or describe your own. Plus a mood dial from tear-jerker to party-starter.",
      },
      {
        q: "Can I use it on Instagram or TikTok?",
        a: "Yes — it's your song. You get an MP4 made for posting, and reaction videos tagged #MyTuneOfUs are our favorite thing on the internet.",
      },
      {
        q: "Is it really about OUR story?",
        a: "Completely. The lyrics are built from your answers — names, places, inside jokes, the moment you met. No templates, no fill-in-the-blank verses. If you mention the burnt lasagna, the burnt lasagna is in the song. Scroll up and read the lyrics from real couples if you want proof.",
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
      "Let's make something they'll never forget.",
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
          // Couple-focused campaign: anniversary, their birthday, a proposal
          // or making up, and the no-occasion romantic surprise.
          Partner: ["Anniversary", "Their birthday", "A proposal", "Making up", "Just because"],
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
        yourPlaceholder: "e.g. Alex",
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
          { value: "Reggae", preview: "/audio/demo-reggae.mp3" },
          { value: "Gospel", preview: "/audio/demo-gospel.mp3" },
          { value: "Dance / EDM", preview: "/audio/demo-dance.mp3" },
          { value: "Jazz", preview: "/audio/demo-jazz.mp3" },
          { value: "Afrobeats", preview: "/audio/demo-afrobeats.mp3" },
          { value: "Lo-fi", preview: "/audio/demo-lofi.mp3" },
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
        subtitle: "Your song lands here in minutes.",
        emailLabel: "Your email",
        emailPlaceholder: "you@example.com",
        phoneLabel: "Phone (optional)",
        phonePlaceholder: "+1 555 000 0000",
        phoneHint: "so you don't miss it",
        reassurance: "Delivered in minutes · Love it or we remake it free",
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
    lineCore: "Personalized Song",
    total: "Total",
    cta: `Continue to secure checkout — $${config.price.core}`,
    secure: "Secure checkout by Stripe · Apple Pay & Google Pay",
  },

  thanks: {
    heading: "We're writing your song right now.",
    sub: "It usually hits your inbox within minutes. Keep an eye out.",
    recapHeading: "Your order",
    upsell: {
      title: `Turn it into a photo video — $${config.price.upsell}`,
      body: "We set your song to your photos. Perfect for posting their reaction.",
      cta: `Add the photo video → $${config.price.upsell}`,
    },
    waiting: "While you wait: get your camera ready. You'll want to film their reaction. Tag #MyTuneOfUs.",
  },

  // The persistent CTA carries the price: from 30% scroll on, every visitor
  // knows the cost without having to reach the offer card.
  stickyCta: `Create Your Love Song — $${config.price.core}`,

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
