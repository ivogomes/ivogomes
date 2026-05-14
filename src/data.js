// Shared content for Ivo Gomes' personal site
const IVO_DATA = {
  name: "Ivo Gomes",
  role: "Director of Product Design",
  company: "Dashlane",
  location: "Lisbon, Portugal",

  work: [
    {
      id: "dashlane",
      company: "Dashlane",
      years: "2023 — Present",
      role: "Director of Product Design",
      summary: "Leading the End-User (B2C and B2B) and Platform (Design System, UX Architecture) teams. Part of the product-engineering-design triad setting vision and strategy for Dashlane.",
      highlights: [
        "Scaled the Design System from 5 low-adoption components to a multi-platform library covering 95%+ of product needs — across Figma, Web, iOS, and Android.",
        "Shifted the team from silo'd designers into a shared practice: regular critiques, design studio hours, and cross-triad pair designing.",
        "Driving horizontal initiatives across accessibility, localisation, automation, and AI."
      ]
    },
    {
      id: "talkdesk",
      company: "Talkdesk",
      years: "2017 — 2023",
      role: "Senior Product Designer → Director of Product Design",
      summary: "Led the CCaaS (Contact Center as a Service) design team with 11 direct reports. Helped grow the wider design org from 4 to nearly 70 designers across multiple locations around the world.",
      highlights: [
        "Lead designer on Talkdesk's agent experience — the web/desktop app used daily by contact-center agents for calls, voicemails, and activity.",
        "Built Cobalt, Talkdesk's design system, from scratch — wrote early HTML/CSS for components to get accessibility right from the start.",
        "Extensive field research: shadowing agents in contact centers to understand their real workflows and pain points."
      ]
    },
    {
      id: "brpx",
      company: "Bright Pixel / Graf.ly",
      years: "2016 — 2017",
      role: "UX Lead · Co-founder & CEO",
      summary: "Led a team of 5 on media projects with <a href='https://publico.pt' target='_blank' rel='noopener noreferrer'>Público</a> and the <a href='https://newsinitiative.withgoogle.com/' target='_blank' rel='noopener noreferrer'>Google Digital News Initiative</a>, spinning one project into Graf.ly — a content-creation tool built for journalists.",
      highlights: [
        "Advised early-stage start-ups at Bright Pixel, a Lisbon-based innovation studio, on UX and product direction.",
        "As Graf.ly's CEO, owned product, UX, design, frontend — and pitched to investors and clients.",
        "Won the <a href='https://startupportugal.com/programs/road-2-web-summit/'>Road2WebSummit</a> and participated as an incubated startup in the <a href='https://www.lisbon-challenge.com/'>Lisbon Challenge</a>. Exhibited at the <a href='https://websummit.com/'>Web Summit</a> as an Alpha start-up."
      ]
    },
    {
      id: "sapo",
      company: "SAPO / Portugal Telecom",
      years: "2009 — 2016",
      role: "Head of UX & QA",
      summary: "Led the UX and QA team at Portugal's most-visited website. Worked across web, mobile, and IPTV (MEO TV) on both B2C and B2B products for Portugal Telecom.",
      highlights: [
        "Owned UX and accessibility for SAPO.PT and all its subportals (sports, news, videos, blogs) from 2009 to 2015.",
        "Led the overhaul of MEO.PT, MEO Empresas, and the customer self-service portal — from specs and wireframes through user testing and card sorting.",
        "Wrote <a href='https://ux.sapo.pt' target='_blank' rel='noopener noreferrer'>ux.sapo.pt</a> — internal usability guidelines later adopted as a reference for the <a href='https://ama.gov.pt' target='_blank' rel='noopener noreferrer'>Portuguese government's public-sector</a> guidelines."
      ]
    },
    {
      id: "earlier",
      company: "Earlier",
      years: "2002 — 2009",
      role: "Log, Ergolab, IconMedialab, Volkswagen Autoeuropa",
      summary: "Usability consultant and interaction designer across agencies and clients — web, ergonomics, and HCI. Designed the <a href='https://antt.dglab.gov.pt/' target='_blank' rel='noopener noreferrer'>Portuguese National Archives</a> site (still live 20 years later!) and ran an ergonomic study of Volkswagen's paint line.",
      highlights: [
        "Check my <a href='https://www.linkedin.com/in/ivogomes/' target='_blank' rel='noopener noreferrer'>LinkedIn</a> for more details."
      ]
    }
  ],

  // Portfolio projects — with sub-pages
  // tileColor = warm OKLCH tones, all with consistent low chroma
  projects: [
    {
      id: "dashlane-ds",
      workId: "dashlane",
      company: "Dashlane",
      title: "Dashlane Design System",
      year: "2023 — Present",
      role: "Director of Product Design",
      tag: "Design System · Multi-platform",
      blurb: "From 5 components with low adoption, to a multi-platform system covering 95%+ of every page across Figma, Web, iOS and Android.",
      tileColor: "#E8553D",  // terracotta
      tileInk: "#FFF8E8",
      initials: "DS",
      tileImg: "assets/projects/dashlane-ds.webp",  // 1600x1000
      tileImgThumb: "assets/projects/dashlane-ds-thumb.webp",  // 600x375
      sections: [
        { h: "Context", p: "I'm a huge fan of Design Systems and love building them. When I joined Dashlane, the Design System was in its early stages: 5 components, very low adoption from designers and engineers, and a slow development process that required each component to ship for all 4 platforms (Figma, Web, iOS, Android) before any release." },
        { h: "Strategy", p: "Shortly after taking over, I set up a strategy to build the base components users would need for 80+% of all pages in the product, and changed how we delivered to our users. We started publishing early for designers in Figma as soon as components were ready — this boosted adoption and design consistency." },
        { h: "Result", p: "After just 9 months we had 100% of new designs in Figma using only DS components (with very few detachments). Since designers usually work a few sprints ahead of engineering, this created pressure for the components to be ready in code later on. After 15 months we surpassed the original goal — 95%+ coverage for every page across all platforms." },
        { h: "Maintenance", p: "We're focusing our efforts on UX Architecture and Patterns — pre-built recipes for larger interactions (bulk actions, filtering, navigation) — and have moved to a hybrid model where our users are now the main contributors to the DS, validated by the UX Architecture Working Group." }
      ],
      shots: [
        { label: "Component library", note: "Figma · core set", img: "assets/projects/dashlane-ds.webp", imgThumb: "assets/projects/dashlane-ds-thumb.webp" },
        { label: "Design tokens", note: "color · spacing · type", img: "assets/projects/dashlane-ds-colors.webp", imgThumb: "assets/projects/dashlane-ds-colors-thumb.webp" },
        { label: "Patterns", note: "recipes · interactions", img: "assets/projects/dashlane-ds-patterns.webp", imgThumb: "assets/projects/dashlane-ds-patterns-thumb.webp" }
      ]
    },
    {
      id: "dashlane-efficiency",
      workId: "dashlane",
      company: "Dashlane",
      title: "Design Craft & Efficiency",
      year: "2023 — Present",
      role: "Director of Product Design",
      tag: "Leadership · Efficiency",
      blurb: "How levelling up the team's Figma skills, shipping a Design System, and building a culture of shared knowledge cut the cost of building new features.",
      tileColor: "#F0A830",  // amber
      tileInk: "#2A1A08",
      initials: "Craft",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Context", p: "Designers were spending too much time reinventing UI and not enough time solving problems. Without shared components or a common craft baseline, every feature started from scratch — inconsistency crept in and velocity suffered." },
        { h: "Approach", p: "I focused on three levers: raising the technical floor through targeted Figma coaching, deploying a Design System that made consistent, production-ready UI the path of least resistance, and creating recurring spaces — Round Tables and pair-design sessions — where the team could teach each other and stay aligned." },
        { h: "What I did", p: "Ran hands-on Figma workshops to close skill gaps across the team. Led the Design System rollout: component architecture, documentation, and adoption strategy. Established Round Tables as a weekly ritual for sharing patterns, critiquing work, and surfacing knowledge that would otherwise stay siloed. The result: designers moved faster, output was more consistent, and new features required far less rework." }
      ]
    },
    {
      id: "talkdesk-agent",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "Agent Experience",
      year: "2017 — 2023",
      role: "Senior Product Designer",
      tag: "Core product · Framework",
      blurb: "The web/desktop app contact-center agents use every day. Designed as a framework that extends with first-party or third-party add-ons.",
      tileColor: "#C8361A",  // rust
      tileInk: "#FFF4E2",
      initials: "AX",
      tileImg: "assets/projects/talkdesk-ax.webp",  // 1600x1000
      tileImgThumb: "assets/projects/talkdesk-ax-thumb.webp",  // 600x375
      sections: [
        { h: "Context", p: "I was the lead product designer for the new agent experience at Talkdesk — specifically for the voice channel. This is the web/desktop app contact-center agents use every day to make and receive calls, manage contacts, listen to voicemails, and check their activity." },
        { h: "The product", p: "A responsive web app that runs in a browser or as a desktop app. Agents usually juggle many tools at once, so they prefer running it in a tiny desktop window — which meant every pixel had to earn its place." },
        { h: "Research", p: "Lots of user research — agent shadowing and customer discovery as we visited contact centers around the world to observe and get feedback. We also ran design sprints that helped shape the product." },
        { h: "Framework thinking", p: "The experience was designed as a framework that could be extended by internal features or third-party add-ons — so the agent experience can differ for inbound vs. outbound, sales vs. tech support, and different customers could build their own custom cards." },
        { h: "Digital channels", p: "On top of voice, we then added digital channels to the agent experience — SMS, live chat, FB Messenger, WhatsApp — taking advantage of the framework architecture we'd built from day one." },
        { h: "Prototyping in code", p: "I like to put my hands in the code sometimes. It helps me convey the experience I want — like the <a href='https://codepen.io/ivogomes/pen/vMLvVW' target='_blank' rel='noopener noreferrer'>ringing-avatar animation</a> I prototyped on CodePen." }
      ],
      shots: [
        { label: "Call in progress", note: "voice channel", img: "assets/projects/talkdesk-ax.webp", imgThumb: "assets/projects/talkdesk-ax-thumb.webp" },
        { label: "Conversations", note: "idle · between calls", img: "assets/projects/talkdesk-ax-idle.webp", imgThumb: "assets/projects/talkdesk-ax-idle-thumb.webp" },
        { label: "Activity details", note: "supervisor view", img: "assets/projects/talkdesk-ax-activity.webp", imgThumb: "assets/projects/talkdesk-ax-activity-thumb.webp" }
      ]
    },
    {
      id: "talkdesk-ds",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "Cobalt — Talkdesk Design System",
      year: "2017 — 2023",
      role: "Senior Product Designer",
      tag: "Design System · Framework",
      blurb: "Built Talkdesk's design system from the ground up. In the early days, also hand-wrote HTML/CSS for the components to nail accessibility.",
      tileColor: "#2E6F5E",  // walnut
      tileInk: "#E6F5EC",
      initials: "Co",
      tileImg: "assets/projects/talkdesk-ds-app.webp",  // 1600x1000
      tileImgThumb: "assets/projects/talkdesk-ds-app-thumb.webp",  // 600x375
      sections: [
        { h: "Context", p: "I helped build <a href='https://designsystem.talkdesk.com' target='_blank' rel='noopener noreferrer'>Talkdesk's Design System</a> from scratch. In the early days I also helped on the front-end (HTML/CSS) of components to include accessibility features and make sure the experience matched what we had imagined in the design style guide. That was in parallel with the Sketch (later Figma) component library." },
        { h: "Adoption", p: "Cobalt became the foundation for the entire product's UI/UX revamp. Talkdesk started as a hackathon project, and years of ad-hoc development had left the product fragmented — inconsistent components, mismatched styles, no shared language between design and engineering. The design system gave us that common ground: new features were built on top of it from day one, and legacy screens were gradually migrated across." },
        { h: "Handoff", p: "By the time I left the company, there was a dedicated team of developers and designers working on the design system — but about 80% of the Figma components were still using my original assets." },
        { h: "More", p: "I wrote a <a href='https://medium.com/talkdesk-design/building-our-design-system-533b29102cd2' target='_blank' rel='noopener noreferrer'>blog post</a> about how we built it in 2020 — it covers the decisions, the gotchas, and the team shape." }
      ],
      shots: [
        { label: "Desktop app", note: "small-window UI", img: "assets/projects/talkdesk-ds-app.webp", imgThumb: "assets/projects/talkdesk-ds-app-thumb.webp" },
        { label: "Bulk actions", note: "selection · batch ops", img: "assets/projects/talkdesk-ds-bulkactions.webp", imgThumb: "assets/projects/talkdesk-ds-bulkactions-thumb.webp" },
        { label: "Filters", note: "query · refine", img: "assets/projects/talkdesk-ds-filters.webp", imgThumb: "assets/projects/talkdesk-ds-filters-thumb.webp" },
        { label: "Forms", note: "inputs · validation", img: "assets/projects/talkdesk-ds-forms.webp", imgThumb: "assets/projects/talkdesk-ds-forms-thumb.webp" }
      ]
    },
    {
      id: "talkdesk-hyergrowth",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "From startup to decacorn",
      year: "2017 — 2023",
      role: "Director of Product Design",
      tag: "Leadership · Hypergrowth",
      blurb: "Talkdesk went from scrappy startup to $10B company in under five years. I helped build the design org that scaled alongside it — from 4 designers to almost 70, across multiple cities on three continents.",
      tileColor: "#2E6F5E",  // walnut
      tileInk: "#E6F5EC",
      initials: "Growth",
      tileImg: "assets/projects/talkdesk-hg.webp",  // 1600x1000
      tileImgThumb: "assets/projects/talkdesk-hg-thumb.webp",  // 600x375
      sections: [
        { h: "Context", p: "In 2017, Talkdesk had a handful of designers and serious product ambitions. By 2022 it was a decacorn with six business units and nearly 70 designers spread across Lisbon 🇵🇹, San Francisco 🇺🇸, Yerevan 🇦🇲, and Wuhan 🇨🇳 (and a few remote in Brazil 🇧🇷). I was part of the leadership team that made that growth possible — and responsible for making sure design didn't fall apart in the process." },
        { h: "My role", p: "I became Director of Product Design for the CCaaS business unit, managing up to 11 designers across three locations: Lisbon, San Francisco, and Wuhan. The timezone spread alone — up to 8 hours between offices — made everyday coordination genuinely hard. Getting alignment on direction, keeping a feedback loop alive, and making designers feel part of one team rather than three separate ones was a constant challenge." },
        { h: "Making 70 designers feel like one", p: "The bigger organisational challenge was coherence at scale. With designers embedded in different scrum teams across six business units, it was easy for the product to fragment. We invested heavily in shared infrastructure: a Design System and Talkdesk styleguide that became the single source of truth across all units, cross-team design critiques, weekly knowledge-sharing sessions, and pair-design rituals that kept patterns and decisions from staying siloed. The goal was for any designer, anywhere, to be able to pick up another team's work and feel at home." }
      ]
    },
    {
      id: "grafly",
      workId: "brpx",
      company: "Bright Pixel",
      title: "Graf.ly",
      year: "2016 — 2017",
      role: "Co-founder & CEO",
      tag: "Startup · Newsroom tools",
      blurb: "The best content creation experience for journalists and editors — a simple workflow and immersive writing over a Content API that could publish anywhere.",
      tileColor: "#E28A2B",  // camel
      tileInk: "#2A1A08",
      initials: "Gr",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Why", p: "Current newsroom tools are hard to use and inefficient. Journalists have to wrestle complicated content-management systems when they should be focused on creating great content." },
        { h: "What", p: "Graf.ly provided a simple workflow and an immersive writing experience. It was a Content API that could publish content anywhere — web, mobile, print — and I was responsible for the entire product: specs, features, UX, design, and most of the HTML/CSS." },
        { h: "CEO hat", p: "I also played the CEO role — pitching to investors and leading the team." },
        { h: "How it ended", p: "We didn't move forward because of a conflict of interests between our first customer (Público) and our main investor (Sonae). Still, we won Road2WebSummit and the Lisbon Challenge, and participated in Web Summit as an Alpha start-up." }
      ],
      shots: [
        { label: "Writing view", note: "distraction-free editor" },
        { label: "CMS", note: "newsroom workflow" },
        { label: "Publishing", note: "web · mobile · print" }
      ]
    },
    {
      id: "sapo-homepage",
      workId: "sapo",
      company: "SAPO",
      title: "SAPO.PT Homepage",
      year: "2009 — 2015",
      role: "Head of UX & QA",
      tag: "Portal · Web & mobile",
      blurb: "At the time, the most visited webpage in Portugal. I owned usability, accessibility, and overall UX for six years.",
      tileColor: "#6A4AA8",  // tan
      tileInk: "#F6ECFF",
      initials: "PT",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Scope", p: "<a href='https://www.sapo.pt'>SAPO.PT</a> — what we used to call the Portuguese Yahoo! At the time, the most visited webpage in Portugal. I was responsible for the usability, accessibility and overall user experience of the homepage from 2009 to 2015." },
        { h: "What I did", p: "Specifications, sketches, wireframes, user testing, eye-tracking, card sorting, interviews, questionnaires, and other usability methodologies. Also some HTML/CSS." },
        { h: "Sub-products", p: "Beyond the homepage I worked across most SAPO sub-products: SAPO Desporto (sports), SAPO Jornais (news aggregator — still one of the most visited sites in Portugal), SAPO Biz (e-commerce backoffice), and SAPO Mag / SAPO Lifestyle (magazine-style content aimed at younger audiences)." },
        { h: "MEO & IPTV", p: "As part of Portugal Telecom, we also worked on MEO products: MEO Interativo (the IPTV apps marketplace — one of the first TV UI projects I worked on, before SmartTVs were a thing), MEO Kanal (a platform for MEO clients to create and broadcast their own TV channel), and MEO Music (a Spotify alternative for Portugal before Spotify launched here)." }
      ],
      shots: [
        { label: "Homepage", note: "desktop layout" },
        { label: "Modules", note: "content blocks" },
        { label: "Mobile", note: "phone · tablet" }
      ]
    },
    {
      id: "meo-pt",
      workId: "sapo",
      company: "Portugal Telecom",
      title: "MEO.PT & MEO Empresas",
      year: "2012 — 2015",
      role: "Head of UX",
      tag: "Telco · Web",
      blurb: "Overall UX for MEO's website — the main 3P (TV / Internet / Voice / Mobile) player in Portugal — then reused for the enterprise site.",
      tileColor: "#1E4E8C",  // olive-brown
      tileInk: "#E6F0FF",
      initials: "MO",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "MEO.PT", p: "From 2012 to 2015 I was responsible for the overall user experience of <a href='https://www.meo.pt'>MEO's website</a> — the main 3P (TV, Internet, Voice/Mobile) player in Portugal." },
        { h: "MEO Empresas", p: "After that, the enterprise website (<a href='https://www.meo.pt/empresas'>MEO Empresas</a>) was revamped using the same specifications and wireframes — with adaptations — from what we had designed for MEO." },
        { h: "What I did", p: "Specifications for the new MEO and MEO Empresas websites, sketches, wireframes, user testing, and card sorting." }
      ],
      shots: [
        { label: "MEO.PT", note: "consumer site" },
        { label: "MEO Empresas", note: "enterprise variant" },
        { label: "Plans", note: "3P configurator" }
      ]
    },
    {
      id: "meo-selfservice",
      workId: "sapo",
      company: "Portugal Telecom",
      title: "MEO Customer Self-Service",
      year: "2013 — 2015",
      role: "Head of UX",
      tag: "Telco · Self-Service UX",
      blurb: "Overhauled the client self-service website so customers could do simple tasks or changes without calling support.",
      tileColor: "#D9504A",  // toffee
      tileInk: "#FFF4E8",
      initials: "SS",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Goal", p: "Deliver an easy way for clients to do simple tasks or changes on their products and subscriptions without having to call support." },
        { h: "Process", p: "We used personas and ran multiple usability tests with users throughout the process before the final version." },
        { h: "Challenge", p: "One of the biggest challenges was dealing with old and legacy services and merging them together in a single, consistent website where users could do the most common tasks." },
        { h: "What I did", p: "Specifications, sketches, wireframes, user testing, and card sorting." }
      ],
      shots: [
        { label: "Account", note: "overview · billing" },
        { label: "Bill & plan", note: "manage · change" },
        { label: "Support flow", note: "guided self-service" }
      ]
    },
    {
      id: "sapo-ux",
      workId: "sapo",
      company: "SAPO",
      title: "SAPO UX — Guidelines",
      year: "2009 — ongoing",
      role: "Writer & maintainer",
      tag: "Guidelines · Content",
      blurb: "Internal usability guidelines I wrote in 2009 — later adopted as a source for the Portuguese Government's public-sector usability guidelines.",
      tileColor: "#D4B026",  // mustard-brown
      tileInk: "#2A200A",
      initials: "UX",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Why", p: "The <a href='https://ux.sapo.pt'>SAPO UX website</a> was created to help designers and developers build more usable and accessible websites and applications." },
        { h: "Scope", p: "These guidelines were used internally at SAPO since 2009 (when I wrote the first draft) and we shared them publicly to try to make the (Portuguese) web a better one — free advice on usability, accessibility and SEO." },
        { h: "Impact", p: "I later found out they are being used as a source for the <a href='https://ama.gov.pt'>Portuguese Government Administrative Modernization Agency's</a> usability guidelines for all public-administration websites. So, the plan is still working." },
        { h: "What I did", p: "Content, specifications, wireframes, UI design, HTML/CSS, and WordPress integration." }
      ],
      shots: [
        { label: "Homepage", note: "ux.sapo.pt" },
        { label: "Guideline article", note: "usability · a11y" }
      ]
    },
    {
      id: "mytvshows",
      workId: "earlier",
      company: "Personal",
      title: "MyTVShows",
      year: "2007 — 2016",
      role: "Founder / Everything",
      tag: "Pet project · Full-stack",
      blurb: "A place to track the TV shows you were watching, years before Trakt.tv. Built the whole thing solo: UI, UX, PHP, HTML/CSS, JS.",
      tileColor: "#385AA8",  // mocha
      tileInk: "#E6ECFF",
      initials: "TV",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "What", p: "One of my pet projects for years. MyTVShows was a place where you could keep track of the TV shows you were watching. I started it as a way to practice PHP and it grew quickly into one of the most useful websites for people who watched multiple TV shows." },
        { h: "Solo build", p: "I developed the entire website by myself: UI, UX, PHP, HTML/CSS, JavaScript. Today, most media centers already tell you which episodes you've watched — but when I started it, there was no alternative." },
        { h: "The end", p: "Fun while it lasted, but I had to shut it down due to lack of time and a scalability problem — too many users for a service that wasn't designed for that kind of traffic. I wrote a <a href='https://ivogomes.medium.com/mytvshows-is-dead-long-live-mytvshows-18907bbc4a47' target='_blank' rel='noopener noreferrer'>blog post</a> about the whole thing." }
      ],
      shots: [
        { label: "Tracker", note: "episodes · watch state" },
        { label: "Show page", note: "cast · seasons · stats" }
      ]
    }
  ]
};

export default IVO_DATA;
