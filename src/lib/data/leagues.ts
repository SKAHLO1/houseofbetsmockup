/**
 * League page heroes. Each photo shows the league's most-followed club and is
 * freely licensed on Wikimedia Commons; the credit is rendered on the hero as
 * the licence requires. Files live in /public/leagues (1920px Commons renditions).
 */
import { getCompetition } from './catalog';

export interface LeagueHero {
  image: string;
  alt: string;
  /** CSS object-position, so the players stay in frame when the hero crops. */
  focus: string;
  /** The club pictured. */
  club: string;
  credit: {
    author: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
  };
}

const CC_BY_SA_2 = { license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/' };
const CC_BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' };

export const LEAGUE_HEROES: Record<string, LeagueHero> = {
  'premier-league': {
    image: '/leagues/premier-league.jpg',
    alt: 'Manchester United players celebrate winning the 1999 UEFA Champions League final',
    focus: '50% 62%',
    club: 'Manchester United',
    credit: {
      author: 'Seán Murray, retouched by Danyele',
      ...CC_BY_SA_2,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:1999_UEFA_Champions_League_celebration_(edited).jpg',
    },
  },
  bundesliga: {
    image: '/leagues/bundesliga.jpg',
    alt: 'Bayern Munich players celebrate with the 2022 DFL-Supercup trophy',
    focus: '50% 55%',
    club: 'Bayern Munich',
    credit: {
      author: 'Steffen Prößdorf',
      ...CC_BY_SA_4,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:2022-07-30_Fu%C3%9Fball,_M%C3%A4nner,_DFL-Supercup,_RB_Leipzig_-_FC_Bayern_M%C3%BCnchen_1DX_3417_by_Stepro.jpg',
    },
  },
  'serie-a': {
    image: '/leagues/serie-a.jpg',
    alt: 'Juventus players celebrate the 2016–17 Serie A title',
    focus: '50% 58%',
    club: 'Juventus',
    credit: {
      author: 'Leandro Ceruti, edited by Danyele',
      ...CC_BY_SA_2,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Juventus_FC_-_Serie_A_champions_2016-17_(edited).jpg',
    },
  },
  laliga: {
    image: '/leagues/laliga.jpg',
    alt: 'Real Madrid players applaud supporters during their 2008 title celebration',
    focus: '50% 55%',
    club: 'Real Madrid',
    credit: {
      author: 'Juan Fernández',
      ...CC_BY_SA_2,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Real_Madrid_celebration_2008.jpg',
    },
  },
};

/**
 * Where a competition's own page lives. Football leagues sit under the
 * Football section (/football/premier-league); other sports use /league/[id].
 */
export function leagueHref(competitionId: string): string {
  return getCompetition(competitionId).sportId === 'football' ? `/football/${competitionId}` : `/league/${competitionId}`;
}
