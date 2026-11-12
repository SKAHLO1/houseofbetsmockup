'use client';

import { useStore } from '@/lib/store';
import { Icon } from './Icon';

interface Props {
  kind: 'team' | 'competition';
  id: string;
  name: string;
  /** Show a text label next to the star. */
  labelled?: boolean;
}

export function FollowButton({ kind, id, name, labelled = false }: Props) {
  const { state, dispatch } = useStore();
  const following = kind === 'team' ? state.followedTeams.includes(id) : state.followedCompetitions.includes(id);

  return (
    <button
      type="button"
      className={`follow ${following ? 'is-on' : ''} ${labelled ? 'follow--labelled' : ''}`}
      aria-pressed={following}
      aria-label={`${following ? 'Unfollow' : 'Follow'} ${name}`}
      title={`${following ? 'Unfollow' : 'Follow'} ${name}`}
      onClick={() =>
        dispatch(
          kind === 'team' ? { type: 'toggle-follow-team', teamId: id } : { type: 'toggle-follow-competition', competitionId: id },
        )
      }
    >
      <Icon name={following ? 'star-filled' : 'star'} size={labelled ? 14 : 16} />
      {labelled && <span>{following ? 'Following' : 'Follow'}</span>}
    </button>
  );
}
