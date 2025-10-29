import React, { useMemo } from 'react';
import { Member } from '../types';
import membersData from '../data/members.json';
import ProfileCard from './ProfileCard';

const rolePriority: { [key: string]: number } = {
  'Hacker Supporter': 1,
  'Community Manager': 2,
  'Staff': 3,
};

const ProfileList: React.FC = () => {
  const sortedMembers = useMemo(() => {
    return [...membersData].sort((a, b) => {
      const priorityA = rolePriority[a.role.en] || 99;
      const priorityB = rolePriority[b.role.en] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.id - b.id;
    });
  }, []);

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMembers.map((member: Member) => (
          <ProfileCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
};

export default ProfileList;