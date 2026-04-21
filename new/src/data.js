// Shared content for Ivo Gomes' personal site
window.IVO_DATA = {
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
      summary: "Leading the End-User and Platform (design system, UX architecture) design teams. Working in a triad with Product and Engineering to set the vision and strategy for Dashlane.",
      highlights: [
        "Helped grow the Design System from 5 components with low adoption to a multi-platform system covering 95%+ of every screen — across Figma, Web, iOS and Android.",
        "Shifted the team from silo'd designers to a true practice: shared critiques, design studio hours, pair-designing across triads.",
        "Now focusing on other horizontal topics, like accessibility, localisation, and AI."
      ],
      tag: "Leadership · Design Systems · B2C/B2B Security"
    },
    {
      id: "talkdesk",
      company: "Talkdesk",
      years: "2017 — 2023",
      role: "Senior Product Designer → Director of Product Design",
      summary: "Led the CCaaS (Contact Center as a Service) design team (11 direct reports). Helped grow the wider design team from 4 to nearly 70 across multiple locations around the world.",
      highlights: [
        "Lead designer for Talkdesk's agent experience — the responsive web/desktop app contact-center agents use every day for calls, voicemails, and activity.",
        "Built Cobalt — Talkdesk's design system — from scratch. Wrote early HTML/CSS for components to get the accessibility right.",
        "Lots of field research: shadowing agents in contact centers, learning from their workflows and pain points."
      ],
      tag: "Leadership · Agent Experience · Design Systems"
    },
    {
      id: "brightpixel",
      company: "Bright Pixel / Graf.ly",
      years: "2016 — 2017",
      role: "UX Lead · Co-founder & CEO",
      summary: "Led a team of 5 working on media projects with <a href='https://publico.pt' target='_blank' rel='noopener noreferrer'>Público</a> and the <a href='https://newsinitiative.withgoogle.com/' target='_blank' rel='noopener noreferrer'>Google Digital News Initiative</a>. Spun one project off into Graf.ly — a content-creation tool for journalists.",
      highlights: [
        "As Graf.ly's CEO, owned product, UX, design, most of the HTML/CSS — and pitched to investors and clients.",
        "Winner of Road2WebSummit and Lisbon Challenge. Exhibited at Web Summit as an Alpha start-up."
      ],
      tag: "Leadership · Startups · CMS for journalists"
    },
    {
      id: "sapo",
      company: "SAPO / Portugal Telecom",
      years: "2009 — 2016",
      role: "Head of UX & QA",
      summary: "Managed a UX and QA team at the most-visited website in Portugal at the time. Worked across web, mobile, and IPTV (MEO TV).",
      highlights: [
        "Owned usability, accessibility and UX for the SAPO.PT homepage from 2009 to 2015 including all of its subportals (sports, news, videos, blogs, etc).",
        "Led the overhaul of MEO.PT, MEO Empresas, and customer self service portal — specs, wireframes, user testing, card sorting.",
        "Wrote <a href='https://ux.sapo.pt' target='_blank' rel='noopener noreferrer'>ux.sapo.pt</a> — internal usability guidelines later adopted as a source for the <a href='https://ama.gov.pt' target='_blank' rel='noopener noreferrer'>Portuguese government's public-sector</a> guidelines."
      ],
      tag: "UX Leadership · Web, Mobile, IPTV · Accessibility"
    },
    {
      id: "earlier",
      company: "Earlier",
      years: "2002 — 2009",
      role: "Log, Ergolab, IconMedialab, Volkswagen Autoeuropa",
      summary: "Usability consultant and interaction designer for the web; ergonomics research; HCI consulting. Helped design the <a href='https://antt.dglab.gov.pt/' target='_blank' rel='noopener noreferrer'>Portuguese National Archives</a> sites (still online 20 years later) and ran an ergonomic study of Volkswagen's paint line.",
      highlights: [
        "Check my <a href='https://www.linkedin.com/in/ivogomes/' target='_blank' rel='noopener noreferrer'>LinkedIn</a> for more details."
      ],
      tag: "Usability · HCI · Ergonomics"
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
      tileImg: "assets/projects/dashlane-ds.png",  // 1600x1000
      tileImgThumb: "assets/projects/dashlane-ds-thumb.png",  // 600x375
      sections: [
        { h: "Context", p: "I'm a huge fan of Design Systems and love building them. When I joined Dashlane, the Design System was in its early stages: 5 components, very low adoption from designers and engineers, and a slow development process that required each component to ship for all 4 platforms (Figma, Web, iOS, Android) before any release." },
        { h: "Strategy", p: "Shortly after taking over, I set up a strategy to build the base components users would need for 80+% of all pages in the product, and changed how we delivered to our users. We started publishing early for designers in Figma as soon as components were ready — this boosted adoption and design consistency." },
        { h: "Result", p: "After just 9 months we had 100% of new designs in Figma using only DS components (with very few detachments). Since designers usually work a few sprints ahead of engineering, this created pressure for the components to be ready in code later on. After 15 months we surpassed the original goal — 95%+ coverage for every page across all platforms." },
        { h: "Now", p: "We're focusing our efforts on UX Architecture and Patterns — pre-built recipes for larger interactions (bulk actions, filtering, navigation) — and have moved to a hybrid model where our users are now the main contributors to the DS, validated by the UX Architecture Working Group." }
      ],
      shots: [
        { label: "Component library", note: "Figma — core set", img: "assets/projects/dashlane-ds.png", imgThumb: "assets/projects/dashlane-ds-thumb.png" },
        { label: "Tokens", note: "color · spacing · type" },
        { label: "Patterns", note: "recipes / interactions" },
        { label: "Docs", note: "guidance site" }
      ]
    },
    {
      id: "dashlane-health",
      workId: "dashlane",
      company: "Dashlane",
      title: "Password Health Score",
      year: "2023 — Present",
      role: "Director of Product Design",
      tag: "Product · Security UX",
      blurb: "A clearer way for people to understand and improve the health of their vault — nudging them towards better credentials without lecturing them.",
      tileColor: "#F0A830",  // amber
      tileInk: "#2A1A08",
      initials: "PH",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Context", p: "Dashlane's job is to protect credentials from breaches and phishing. But the hardest part isn't storage — it's getting people to act on weak, reused, or compromised passwords." },
        { h: "Approach", p: "We worked with Product and Engineering to reframe 'security' from a scary audit into a coachable score. The design needed to feel supportive, specific, and actionable — not alarmist." },
        { h: "What I did", p: "Led the design direction from vision through to ship: framing sessions, pair-designing with the triad, design critiques, and on-the-ground reviews. I don't do IC work daily, but I'm close to every call that shapes the product surface." }
      ],
      shots: [
        { label: "Overview", note: "health dashboard" },
        { label: "Drilldown", note: "weak passwords" },
        { label: "Nudges", note: "in-context prompts" }
      ]
    },
    {
      id: "talkdesk-agent",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "Agent Experience",
      year: "2017 — 2023",
      role: "Lead Product Designer",
      tag: "Core product · Framework",
      blurb: "The web/desktop app contact-center agents use every day. Designed as a framework that extends with first-party or third-party add-ons.",
      tileColor: "#C8361A",  // rust
      tileInk: "#FFF4E2",
      initials: "AX",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Context", p: "I was the lead product designer for the new agent experience at Talkdesk — specifically for the voice channel. This is the web/desktop app contact-center agents use every day to make and receive calls, manage contacts, listen to voicemails, and check their activity." },
        { h: "The product", p: "A responsive web app that runs in a browser or as a desktop app. Agents usually juggle many tools at once, so they prefer running it in a tiny desktop window — which meant every pixel had to earn its place." },
        { h: "Research", p: "Lots of user research — agent shadowing and customer discovery. Before COVID we visited contact centers to observe and get feedback. After, we did it via Zoom. We also ran design sprints that helped shape the product." },
        { h: "Framework thinking", p: "The experience was designed as a framework that could be extended by internal features or third-party add-ons — so the agent experience can differ for inbound vs. outbound, sales vs. tech support, and different customers could build their own custom cards." },
        { h: "On the side", p: "I like to put my hands in the code sometimes. It helps me convey the experience I want — like the ringing-avatar animation I prototyped on CodePen." }
      ],
      shots: [
        { label: "Idle state", note: "Conversations app" },
        { label: "Inbound ringing", note: "call incoming" },
        { label: "Call in progress", note: "active call" },
        { label: "Activity details", note: "supervisor view" }
      ]
    },
    {
      id: "talkdesk-cobalt",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "Cobalt — Talkdesk Design System",
      year: "2017 — 2023",
      role: "Senior Product Designer",
      tag: "Design System · From scratch",
      blurb: "Built Talkdesk's design system from the ground up. In the early days, also hand-wrote HTML/CSS for the components to nail accessibility.",
      tileColor: "#2E6F5E",  // walnut
      tileInk: "#E6F5EC",
      initials: "Co",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Context", p: "I helped build Talkdesk's Design System from scratch. In the early days I also helped on the front-end (HTML/CSS) of components to include accessibility features and make sure the experience matched what we had imagined in the design style guide. That was in parallel with the Sketch (later Figma) component library." },
        { h: "Handoff", p: "By the time I left the company, there was a dedicated team of developers and designers working on the design system — but about 80% of the Figma components were still using my original assets." },
        { h: "More", p: "I wrote a blog post about how we built it in 2020 — it covers the decisions, the gotchas, and the team shape." }
      ],
      shots: [
        { label: "Core components", note: "first wave" },
        { label: "Tokens", note: "color & type" },
        { label: "Accessibility", note: "a11y-first" }
      ]
    },
    {
      id: "talkdesk-hyergrowth",
      workId: "talkdesk",
      company: "Talkdesk",
      title: "Growing a design team from 4 to 70",
      year: "2017 — 2023",
      role: "Director of Product Design",
      tag: "Leadership · Design Team Growth",
      blurb: "Built Talkdesk's design system from the ground up. In the early days, also hand-wrote HTML/CSS for the components to nail accessibility.",
      tileColor: "#2E6F5E",  // walnut
      tileInk: "#E6F5EC",
      initials: "Co",
      tileImg: "",
      tileImgThumb: "",
      sections: [
        { h: "Context", p: "I helped build Talkdesk's Design System from scratch. In the early days I also helped on the front-end (HTML/CSS) of components to include accessibility features and make sure the experience matched what we had imagined in the design style guide. That was in parallel with the Sketch (later Figma) component library." },
        { h: "Handoff", p: "By the time I left the company, there was a dedicated team of developers and designers working on the design system — but about 80% of the Figma components were still using my original assets." },
        { h: "More", p: "I wrote a blog post about how we built it in 2020 — it covers the decisions, the gotchas, and the team shape." }
      ],
      shots: [
        { label: "Core components", note: "first wave" },
        { label: "Tokens", note: "color & type" },
        { label: "Accessibility", note: "a11y-first" }
      ]
    },
    {
      id: "grafly",
      workId: "brightpixel",
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
        { label: "Writing view", note: "immersive editor" },
        { label: "CMS", note: "for the newsroom" },
        { label: "Publishing", note: "multi-channel" }
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
        { h: "Scope", p: "SAPO.PT — what we used to call the Portuguese Yahoo! At the time, the most visited webpage in Portugal. I was responsible for the usability, accessibility and overall user experience of the homepage from 2009 to 2015." },
        { h: "What I did", p: "Specifications, sketches, wireframes, user testing, eye-tracking, card sorting, interviews, questionnaires, and other usability methodologies. Also some HTML/CSS." }
      ],
      shots: [
        { label: "Homepage", note: "main layout" },
        { label: "Modules", note: "content blocks" },
        { label: "Mobile", note: "responsive" }
      ]
    },
    {
      id: "meo-pt",
      workId: "sapo",
      company: "Portugal Telecom",
      title: "MEO.PT & PT Empresas",
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
        { h: "MEO.PT", p: "From 2012 to 2015 I was responsible for the overall user experience of MEO's website — the main 3P (TV, Internet, Voice/Mobile) player in Portugal." },
        { h: "PT Empresas", p: "After that, the enterprise website (PT Empresas) was revamped using the same specifications and wireframes — with adaptations — from what we had designed for MEO." },
        { h: "What I did", p: "Specifications for the new MEO and PT Empresas websites, sketches, wireframes, user testing, and card sorting." }
      ],
      shots: [
        { label: "MEO.PT", note: "homepage" },
        { label: "PT Empresas", note: "B2B" },
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
      tag: "Telco · Account UX",
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
        { label: "Account", note: "dashboard" },
        { label: "Bill & plan", note: "self-service" },
        { label: "Support flow", note: "guided paths" }
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
        { h: "Why", p: "The SAPO UX website was created to help designers and developers build more usable and accessible websites and applications." },
        { h: "Scope", p: "These guidelines were used internally at SAPO since 2009 (when I wrote the first draft) and we shared them publicly to try to make the (Portuguese) web a better one — free advice on usability, accessibility and SEO." },
        { h: "Impact", p: "I recently found out they are being used as a source for the Portuguese Government Administrative Modernization Agency's (ama.gov.pt) usability guidelines for all public-administration websites. So, the plan is still working." },
        { h: "What I did", p: "Content, specifications, wireframes, UI design, HTML/CSS, and WordPress integration." }
      ],
      shots: [
        { label: "Site", note: "ux.sapo.pt" },
        { label: "Guidelines", note: "articles" }
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
        { h: "The end", p: "Fun while it lasted, but I had to shut it down due to lack of time and a scalability problem — too many users for a service that wasn't designed for that kind of traffic. I wrote a blog post about the whole thing." }
      ],
      shots: [
        { label: "Tracker", note: "episode list" },
        { label: "Show page", note: "detail view" }
      ]
    }
  ],

  side: [
    { name: "MyTVShows", years: "2007 — 2016", note: "Pet project — tracked what episodes you'd watched, years before Trakt.tv. Built the whole thing solo: PHP, HTML, CSS, JS." },
    { name: "Portuguese Usability Professionals Association", years: "2005 — 2017", note: "Founder and board member." },
    { name: "Ringing avatar animation", years: "codepen", note: "Because sometimes the best way to explain an interaction is to build it.", href: "https://codepen.io/ivogomes/pen/vMLvVW" }
  ],

  links: {
    linkedin: "https://linkedin.com/in/ivogomes",
    instagram: "https://instagram.com/ivogomes",
    email: "ivogomes@gmail.com",
    cv: "/cv/cv.pdf",
    portfolio: "/portfolio/portfolio.pdf"
  }
};
