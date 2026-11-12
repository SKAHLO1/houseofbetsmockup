import type { Competition, CrestPattern, Sport, Team } from '../types';

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'american-football', name: 'American Football' },
  { id: 'esports', name: 'Esports' },
];

export const COMPETITIONS: Competition[] = [
  { id: 'premier-league', sportId: 'football', name: 'Premier League', region: 'England', top: true },
  { id: 'champions-league', sportId: 'football', name: 'Champions League', region: 'Europe', top: true },
  { id: 'laliga', sportId: 'football', name: 'LaLiga', region: 'Spain', top: true },
  { id: 'serie-a', sportId: 'football', name: 'Serie A', region: 'Italy', top: true },
  { id: 'bundesliga', sportId: 'football', name: 'Bundesliga', region: 'Germany', top: true },
  { id: 'atp-finals', sportId: 'tennis', name: 'ATP Finals', region: 'Turin' },
  { id: 'nba', sportId: 'basketball', name: 'NBA', region: 'USA' },
  { id: 'euroleague', sportId: 'basketball', name: 'EuroLeague', region: 'Europe' },
  { id: 'lidom', sportId: 'baseball', name: 'LIDOM Winter League', region: 'Dominican Republic' },
  { id: 'nfl', sportId: 'american-football', name: 'NFL', region: 'USA' },
  { id: 'blast-fall-final', sportId: 'esports', name: 'BLAST Premier Fall Final', region: 'Counter-Strike 2' },
];

function t(
  id: string,
  name: string,
  short: string,
  c1: string,
  c2: string,
  pattern: CrestPattern = 'solid',
  players?: string[],
): Team {
  return { id, name, short, colors: [c1, c2], pattern, players };
}

const TEAM_LIST: Team[] = [
  // Premier League
  t('arsenal', 'Arsenal', 'Arsenal', '#e3262e', '#ffffff', 'band', ['Bukayo Saka', 'Viktor Gyökeres', 'Martin Ødegaard', 'Gabriel Martinelli']),
  t('brighton', 'Brighton & Hove Albion', 'Brighton', '#1464c8', '#ffffff', 'stripes', ['Danny Welbeck', 'Kaoru Mitoma', 'Georginio Rutter', 'Yankuba Minteh']),
  t('newcastle', 'Newcastle United', 'Newcastle', '#1d1f22', '#f2f2f2', 'stripes', ['Anthony Gordon', 'Nick Woltemade', 'Harvey Barnes']),
  t('aston-villa', 'Aston Villa', 'Aston Villa', '#7a1f45', '#95bfe5', 'band', ['Ollie Watkins', 'Morgan Rogers', 'John McGinn']),
  t('liverpool', 'Liverpool', 'Liverpool', '#c8102e', '#1fb5a8', 'solid', ['Mohamed Salah', 'Hugo Ekitike', 'Florian Wirtz']),
  t('man-utd', 'Manchester United', 'Man Utd', '#d6261c', '#f6d21a', 'halves', ['Bruno Fernandes', 'Bryan Mbeumo', 'Benjamin Šeško']),
  t('man-city', 'Manchester City', 'Man City', '#6cabdd', '#1c2c5b', 'solid', ['Erling Haaland', 'Phil Foden', 'Omar Marmoush']),
  t('tottenham', 'Tottenham Hotspur', 'Spurs', '#f4f6f8', '#132257', 'solid', ['Dominic Solanke', 'Mohammed Kudus', 'Richarlison']),
  t('chelsea', 'Chelsea', 'Chelsea', '#0a4ea3', '#dba111', 'solid', ['Cole Palmer', 'João Pedro', 'Liam Delap']),
  t('wolves', 'Wolverhampton Wanderers', 'Wolves', '#f9a01b', '#231f20', 'solid', ['Jørgen Strand Larsen', 'Hwang Hee-chan', 'Jhon Arias']),
  // Champions League
  t('real-madrid', 'Real Madrid', 'Real Madrid', '#f5f5f0', '#c9a548', 'solid', ['Kylian Mbappé', 'Vinícius Júnior', 'Jude Bellingham']),
  t('bayern', 'Bayern Munich', 'Bayern', '#dc052d', '#ffffff', 'band', ['Harry Kane', 'Michael Olise', 'Jamal Musiala']),
  t('inter', 'Inter', 'Inter', '#0b4ea2', '#16181c', 'stripes', ['Lautaro Martínez', 'Marcus Thuram', 'Hakan Çalhanoğlu']),
  t('psg', 'Paris Saint-Germain', 'PSG', '#0b2a5b', '#e0303e', 'band', ['Ousmane Dembélé', 'Khvicha Kvaratskhelia', 'Bradley Barcola']),
  t('benfica', 'Benfica', 'Benfica', '#e31e24', '#ffffff', 'solid', ['Vangelis Pavlidis', 'Kerem Aktürkoğlu', 'Andreas Schjelderup']),
  t('dortmund', 'Borussia Dortmund', 'Dortmund', '#fde100', '#16181c', 'solid', ['Serhou Guirassy', 'Karim Adeyemi', 'Julian Brandt']),
  t('napoli', 'Napoli', 'Napoli', '#199fd6', '#ffffff', 'solid', ['Romelu Lukaku', 'Scott McTominay', 'Matteo Politano']),
  t('atletico', 'Atlético Madrid', 'Atlético', '#cb3524', '#ffffff', 'stripes', ['Julián Álvarez', 'Antoine Griezmann', 'Alexander Sørloth']),
  // LaLiga
  t('athletic', 'Athletic Club', 'Athletic', '#e0262d', '#ffffff', 'stripes'),
  t('real-sociedad', 'Real Sociedad', 'Real Sociedad', '#1560bd', '#ffffff', 'stripes'),
  t('barcelona', 'Barcelona', 'Barcelona', '#a50044', '#0e4c9a', 'stripes'),
  t('sevilla', 'Sevilla', 'Sevilla', '#f4f4f4', '#d6202c', 'solid'),
  t('villarreal', 'Villarreal', 'Villarreal', '#f5e216', '#0a4a9b', 'solid'),
  t('real-betis', 'Real Betis', 'Betis', '#0bb363', '#ffffff', 'stripes'),
  t('valencia', 'Valencia', 'Valencia', '#f4f4f4', '#ee7a1c', 'halves'),
  t('girona', 'Girona', 'Girona', '#d81e2c', '#ffffff', 'stripes'),
  // Serie A
  t('milan', 'AC Milan', 'Milan', '#d4202c', '#16181c', 'stripes'),
  t('lazio', 'Lazio', 'Lazio', '#87c5ea', '#ffffff', 'solid'),
  t('juventus', 'Juventus', 'Juventus', '#16181c', '#f2f2f2', 'stripes'),
  t('roma', 'Roma', 'Roma', '#8e1f2f', '#f0a22a', 'halves'),
  t('atalanta', 'Atalanta', 'Atalanta', '#1c5fb0', '#16181c', 'stripes'),
  t('fiorentina', 'Fiorentina', 'Fiorentina', '#5b2b82', '#ffffff', 'solid'),
  t('bologna', 'Bologna', 'Bologna', '#a21c26', '#1a2f5a', 'stripes'),
  t('torino', 'Torino', 'Torino', '#8a1e1e', '#ffffff', 'solid'),
  // Bundesliga
  t('frankfurt', 'Eintracht Frankfurt', 'Frankfurt', '#16181c', '#e1000f', 'halves'),
  t('stuttgart', 'VfB Stuttgart', 'Stuttgart', '#f4f4f4', '#e32219', 'band'),
  t('leverkusen', 'Bayer Leverkusen', 'Leverkusen', '#e32221', '#16181c', 'halves'),
  t('leipzig', 'RB Leipzig', 'RB Leipzig', '#f4f4f4', '#dd0741', 'solid'),
  t('gladbach', 'Borussia Mönchengladbach', "M'gladbach", '#f4f4f4', '#1a8a4a', 'solid'),
  t('wolfsburg', 'VfL Wolfsburg', 'Wolfsburg', '#65b32e', '#ffffff', 'solid'),
  t('freiburg', 'SC Freiburg', 'Freiburg', '#d7131b', '#16181c', 'solid'),
  t('union-berlin', 'Union Berlin', 'Union Berlin', '#d4011d', '#ffe600', 'solid'),
  // Tennis
  t('alcaraz', 'Carlos Alcaraz', 'Alcaraz', '#c8372d', '#f2c230', 'round'),
  t('zverev', 'Alexander Zverev', 'Zverev', '#22252a', '#e0b23a', 'round'),
  t('sinner', 'Jannik Sinner', 'Sinner', '#2f8f4e', '#f4f4f4', 'round'),
  t('fritz', 'Taylor Fritz', 'Fritz', '#28457f', '#d43a3a', 'round'),
  // Basketball
  t('celtics', 'Boston Celtics', 'Celtics', '#0d7a43', '#f4f4f4', 'round'),
  t('bucks', 'Milwaukee Bucks', 'Bucks', '#1f4d33', '#eee1c6', 'round'),
  t('lakers', 'Los Angeles Lakers', 'Lakers', '#5a2d82', '#fdb927', 'round'),
  t('nuggets', 'Denver Nuggets', 'Nuggets', '#0e2240', '#fec524', 'round'),
  t('olympiacos', 'Olympiacos', 'Olympiacos', '#d1202c', '#ffffff', 'stripes'),
  t('fenerbahce', 'Fenerbahçe Beko', 'Fenerbahçe', '#16306b', '#f7d417', 'stripes'),
  t('panathinaikos', 'Panathinaikos', 'Panathinaikos', '#0a7d3e', '#ffffff', 'solid'),
  t('monaco', 'AS Monaco Basket', 'Monaco', '#d4202c', '#ffffff', 'halves'),
  // Baseball
  t('licey', 'Tigres del Licey', 'Licey', '#1f4fa0', '#ffffff', 'round'),
  t('aguilas', 'Águilas Cibaeñas', 'Águilas', '#f2c21a', '#16181c', 'round'),
  t('escogido', 'Leones del Escogido', 'Escogido', '#c8202c', '#ffffff', 'round'),
  t('toros', 'Toros del Este', 'Toros', '#e56a1c', '#16181c', 'round'),
  // American football
  t('chiefs', 'Kansas City Chiefs', 'Chiefs', '#d0142c', '#f6b81c', 'round'),
  t('bills', 'Buffalo Bills', 'Bills', '#0a3c8c', '#d0142c', 'round'),
  t('cowboys', 'Dallas Cowboys', 'Cowboys', '#0b2a57', '#9aa4ad', 'round'),
  t('eagles', 'Philadelphia Eagles', 'Eagles', '#0b4b50', '#a5acaf', 'round'),
  // Esports
  t('navi', 'Natus Vincere', 'NAVI', '#f6d21a', '#16181c', 'round'),
  t('faze', 'FaZe Clan', 'FaZe', '#d4202c', '#16181c', 'round'),
  t('g2', 'G2 Esports', 'G2', '#16181c', '#f4f4f4', 'round'),
  t('vitality', 'Team Vitality', 'Vitality', '#f6d21a', '#16181c', 'halves'),
];

export const TEAMS: Record<string, Team> = Object.fromEntries(TEAM_LIST.map((team) => [team.id, team]));
export const ALL_TEAMS = TEAM_LIST;

export function getTeam(id: string): Team {
  const team = TEAMS[id];
  if (!team) throw new Error(`Unknown team: ${id}`);
  return team;
}

export function getCompetition(id: string): Competition {
  const comp = COMPETITIONS.find((c) => c.id === id);
  if (!comp) throw new Error(`Unknown competition: ${id}`);
  return comp;
}

export function getSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

export const TOP_COMPETITIONS = COMPETITIONS.filter((c) => c.top);
