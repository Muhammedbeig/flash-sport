// lib/seo-routes.ts

export const FOOTBALL_ROUTES = {
  // 1. Pinned Leagues (SEO Slug -> API ID)
  leagues: {
    "premier-league": "39",
    "laliga": "140",
    "champions-league": "2",
    "serie-a": "135",
    "bundesliga": "78",
    "ligue-1": "61",
    "europa-league": "3",
    "world-cup": "1",
    "euro-cup": "4",
    "copa-america": "13",
    "mls": "253",
    "eredivisie": "88",
    "conference-league": "848",
    "uefa-nations-league": "5",
    "copa-libertadores": "13"
  },
  
  // 2. Functional Pages (Slug -> View Type)
  pages: {
    "today": "live",       
    "fixtures": "scheduled", 
    "results": "finished",   
    "standings": "standings" 
  }
};