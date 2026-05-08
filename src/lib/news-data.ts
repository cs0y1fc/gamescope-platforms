export type NewsItem = {
  id: number
  title: string
  excerpt: string
  body: string
  imageUrl: string
  date: string
  category: string
  author: string
  readTime: number
}

const baseDate = Date.now()

export const NEWS: NewsItem[] = [
  {
    id: 1,
    title: "PlayStation 6 Rumors: What We Know So Far",
    excerpt: "Next-gen console specs leaked? Inside the latest rumors surrounding Sony's upcoming hardware.",
    body: `Sony's next-generation console has been the subject of countless rumors since the PS5 hit shelves. Industry insiders now suggest the PS6 could ship as early as late 2027, packing custom AMD silicon, ray-traced global illumination on every render path, and a unified memory pool exceeding 32 GB.

The rumored "Hyperion" GPU architecture is said to deliver 4-5x raw rasterization performance over the PS5 Pro, with dedicated AI cores for upscaling, frame generation and physics simulation. Backwards compatibility is reportedly being prioritized — every PS5 and PS4 title is expected to run natively at higher resolutions and framerates.

Sony has remained silent on the matter, but recent patents filed in the US and Japan reveal advanced controller haptics, eye-tracking integration and a redesigned cooling chassis with vapor-chamber cooling. Whether or not these features ship in the final hardware remains to be seen, but the trajectory is clear: the PS6 is shaping up to be the most ambitious PlayStation yet.

Expect more details to emerge during Sony's State of Play events later this year.`,
    imageUrl: "https://picsum.photos/seed/retronova-news-1/1600/800",
    date: new Date(baseDate).toISOString(),
    category: "Hardware",
    author: "ANONYMOUS_01",
    readTime: 4,
  },
  {
    id: 2,
    title: "The Return of Classic RPGs in 2024",
    excerpt: "Why developers are going back to their roots with turn-based combat and deep storytelling.",
    body: `Turn-based RPGs are experiencing a renaissance. After a decade dominated by action-RPGs and open-world sprawl, studios both indie and AAA are returning to the systems that defined the genre's golden age.

Baldur's Gate 3 broke the mold by proving that strategic combat, dialog-heavy narratives and rich tactical depth can sit at the top of the sales charts alongside live-service titles. Sea of Stars, Metaphor: ReFantazio and Persona 3 Reload have all leaned into classic JRPG conventions while offering modern quality-of-life improvements.

The reasons are manifold. Players seem hungry for narrative substance after years of grind-driven content cycles. Development costs for turn-based games are also lower than open-world action behemoths, which gives smaller teams room to take creative risks. And the emergence of strong RPG-focused publishers — among them Owlcat, Larian and Atlus — has created a viable commercial pipeline.

The takeaway: the future of RPGs may look a lot like their past.`,
    imageUrl: "https://picsum.photos/seed/retronova-news-2/1600/800",
    date: new Date(baseDate - 86400000).toISOString(),
    category: "Editorial",
    author: "ANONYMOUS_02",
    readTime: 6,
  },
  {
    id: 3,
    title: "E-Sports Olympics: A New Era Begins",
    excerpt: "The IOC officially announces the inclusion of competitive gaming in the upcoming global event.",
    body: `The International Olympic Committee has confirmed that competitive gaming will be included as a medal event in the next Summer Olympic cycle. The announcement marks a major milestone for an industry that has, until now, fought for mainstream recognition outside of dedicated tournament circuits.

Initial event categories will reportedly include strategy, fighting and team-based shooters, with title selections handled jointly by the IOC and the newly-formed Esports World Federation (EWF). Anti-doping protocols, fair-play guidelines and broadcast standards are being adapted to fit the unique nature of digital competition.

Reception has been mixed. Traditional Olympic associations have raised concerns over the inclusion of titles featuring violence, while esports organizations argue that the chosen games will be carefully curated. National esports federations are now scrambling to qualify their athletes — and to negotiate broadcast rights that could rival traditional sports in viewership.

This is a defining moment for esports. The next four years will determine whether competitive gaming earns its seat at the table — or remains a footnote in Olympic history.`,
    imageUrl: "https://picsum.photos/seed/retronova-news-3/1600/800",
    date: new Date(baseDate - 172800000).toISOString(),
    category: "Esports",
    author: "ANONYMOUS_03",
    readTime: 5,
  },
  {
    id: 4,
    title: "Indie Spotlight: Exploring Hollow Horizons",
    excerpt: "We sit down with the creators of the year's most anticipated metroidvania.",
    body: `Hollow Horizons, the long-awaited sophomore project from a four-person studio, finally has a release date. After three years of development and a Kickstarter campaign that raised more than 20x its goal, the metroidvania-inspired action-platformer arrives next quarter on PC and consoles.

We spoke with the studio's lead designer about the development process. "We wanted to honor the genre's traditions — interconnected world design, ability-gated progression, atmospheric storytelling — while pushing forward in ways that feel uniquely ours," they explained. "The combat system blends parry-based timing with momentum-driven traversal. Every weapon changes how you move through the world."

Visually, the game is a hand-painted love letter to retro-futurist art. The score, composed by an independent musician known for ambient synth work, leans into nostalgic textures without resorting to pastiche.

Hollow Horizons is one of those rare indie projects that arrives with both ambition and polish. Mark your calendars.`,
    imageUrl: "https://picsum.photos/seed/retronova-news-4/1600/800",
    date: new Date(baseDate - 259200000).toISOString(),
    category: "Indie",
    author: "ANONYMOUS_04",
    readTime: 7,
  },
]

export function getNewsById(id: number): NewsItem | undefined {
  return NEWS.find(n => n.id === id)
}
