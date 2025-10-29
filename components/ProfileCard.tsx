
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Member } from '../types';

interface ProfileCardProps {
  member: Member;
}

const roleColors: { [key: string]: string } = {
  'Hacker Supporter': 'bg-green-500/20 text-green-300 border border-green-500/50',
  'Community Manager': 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
  'Staff': 'bg-gray-500/20 text-gray-300 border border-gray-500/50',
};

const ProfileCard: React.FC<ProfileCardProps> = ({ member }) => {
  const { i18n, t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const lang = i18n.language.startsWith('ja') ? 'ja' : 'en';
  const name = member.name[lang];
  const role = member.role[lang];
  const bio = member.bio[lang];
    const tags = member.tags?.[lang];
  const roleEn = member.role['en'];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 transition-all duration-300 hover:border-grok-green hover:shadow-lg hover:shadow-grok-green/10">
      <div className="flex items-center space-x-4 mb-4">
        <img src={member.avatarUrl} alt={name} className="w-[50px] h-[50px] rounded-full border-2 border-gray-700" />
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[roleEn] || roleColors['Staff']}`}>
            {role}
          </span>
        </div>
      </div>
      
      {tags && tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
            <li 
              key={index}
              className="text-xs px-2 py-1 bg-gray-800/50 text-gray-300 border border-gray-700 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      
      <div className="relative">
        <div className={`prose prose-invert prose-sm max-w-none transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
          <ReactMarkdown
            components={{
              a: ({node, ...props}) => <a {...props} className="text-grok-green hover:underline" target="_blank" rel="noopener noreferrer" />,
              code: ({node, ...props}) => <code {...props} className="bg-gray-800 rounded px-1 py-0.5 text-grok-green" />
            }}
          >
            {bio}
          </ReactMarkdown>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-900/50 to-transparent transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />
      </div>
       <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-grok-green text-sm mt-2 hover:underline"
      >
        {isExpanded ? t('showLess') : t('showMore')}
      </button>
    </div>
  );
};

export default ProfileCard;
