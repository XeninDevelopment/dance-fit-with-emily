export type LocalBusiness = {
  name: string;
  location: string;
  category: string;
  emoji: string; // shown when no `image` is set
  blurb: string; // Emily's own words
  instagram: string; // handle without the @
  image?: string; // optional logo/profile pic in /public/local/ (e.g. "/local/thecakery.jpg")
};

// Local businesses Emily personally uses and recommends. Blurbs are Emily's own words.
// To add a photo: drop a square image in /public/local/ and set `image` on that business;
// otherwise the emoji tile is shown.
export const LOCAL_BUSINESSES: LocalBusiness[] = [
  {
    name: "Beauty by Elle",
    location: "Warrington",
    category: "Nails & lashes",
    emoji: "💅",
    blurb:
      "Elle does my nails and lashes, and she does them beautifully!! She is an absolutely gorgeous soul who is incredibly talented at what she does and deserves every ounce of success coming her way!",
    instagram: "beautybyelle__x",
  },
  {
    name: "The Harmony Hub",
    location: "Warrington",
    category: "Piano lessons",
    emoji: "🎹",
    blurb:
      "Mary has taught my piano lessons since I was a little girl, and now she has her own space to teach! I owe a huge amount of my love for music to Mary — she was a big part of my childhood, and continues to spread her joy into my adulthood.",
    instagram: "harmonyhub_warrington",
  },
  {
    name: "Claire Cannon Voice",
    location: "Warrington",
    category: "Vocal coaching",
    emoji: "🎤",
    blurb:
      "Claire is the reason my voice is in the healthiest condition of its LIFE!! She is the most wonderful vocal coach and mentor, and puts the happiness and confidence of each student at the centre of her work!",
    instagram: "clairecannonvoice",
  },
  {
    name: "The Wellness Room by Danielle",
    location: "Prescot",
    category: "Reiki & wellness",
    emoji: "🌿",
    blurb:
      "Danielle is my real life protection and guidance angel. Since having Reiki sessions, I have been much more grounded in my own ability. I truly believe that Danielle has helped me find the right path, and listen to my body!",
    instagram: "thewellnessroom.bydanielle",
  },
  {
    name: "Els Beauty Spot",
    location: "Warrington",
    category: "Beauty & waxing",
    emoji: "✨",
    blurb:
      "I've known El since I had my first ever spa treatment as a little girl! She offers a multitude of treatments, but for me her (award winning!!) waxing is my go-to — I always feel secure and comfortable!",
    instagram: "els_beauty_spot",
  },
  {
    name: "The Cakery",
    location: "Widnes",
    category: "Cakes & bakes",
    emoji: "🧁",
    blurb:
      "Emma at The Cakery makes the most incredible bakes. I've ordered so many cakes for birthdays (and just because!) and they're always impeccable. I say I'm not big on sweet treats — but you haven't seen me with one of Emma's Biscoff rocky roads!",
    instagram: "thecakery_artisancakes",
  },
];
