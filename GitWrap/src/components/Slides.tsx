import React from 'react';
import { motion } from 'motion/react';
import { Github, GitCommit, GitPullRequest, Star, GitMerge, Clock, Calendar, Code2, Users, Zap, Trophy, Coffee } from 'lucide-react';

const slideVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const IntroSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col items-center justify-center h-full text-center px-6"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.div variants={itemVariants} className="mb-6">
      {data.user.avatar_url ? (
        <img src={data.user.avatar_url} alt={data.user.login} className="w-24 h-24 rounded-full border-2 border-lime-400/50 mx-auto" />
      ) : (
        <Github className="w-16 h-16 text-lime-400 mx-auto" />
      )}
    </motion.div>
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-4">
      Your GitHub Year in Review
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-serif text-white mb-2">
      Hi, I'm <br/><span className="text-lime-300 italic">{data.user.name.split(' ')[0]}</span>
    </motion.h1>
    <motion.p variants={itemVariants} className="text-gray-400 font-sans mt-6 text-lg">
      @{data.user.login} • Let's see what you built.
    </motion.p>
  </motion.div>
);

export const TopStatsSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      The Raw Numbers
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      You were <span className="text-lime-300 italic">busy</span> recently.
    </motion.h1>
    
    <div className="grid grid-cols-2 gap-6">
      {[
        { icon: GitCommit, label: "Recent Commits", value: data.stats.commits },
        { icon: GitPullRequest, label: "PRs Opened", value: data.stats.prs },
        { icon: GitMerge, label: "Issues Created", value: data.stats.issues },
        { icon: Star, label: "Total Stars", value: data.stats.stars },
      ].map((stat, i) => (
        <motion.div 
          key={stat.label}
          variants={itemVariants}
          custom={i}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <stat.icon className="w-6 h-6 text-lime-400 mb-4" />
          <div className="text-3xl font-serif text-white mb-1">{stat.value}</div>
          <div className="text-sm text-gray-400 font-sans">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export const TopReposSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      Top Repositories
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      Where you spent your <span className="text-lime-300 italic">time</span>.
    </motion.h1>
    
    <div className="space-y-4">
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between">
        <div className="overflow-hidden pr-4">
          <div className="text-xs text-lime-400 uppercase tracking-wider mb-1">Most Contributed</div>
          <div className="text-xl md:text-2xl font-serif text-white truncate">{data.repos.mostContributed}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-sans text-white">{data.repos.mostContributedCount}</div>
          <div className="text-xs text-gray-400">events</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between">
        <div className="overflow-hidden pr-4">
          <div className="text-xs text-lime-400 uppercase tracking-wider mb-1">Most Starred</div>
          <div className="text-xl md:text-2xl font-serif text-white truncate">{data.repos.mostStarred}</div>
        </div>
        <div className="text-right flex items-center gap-2 shrink-0">
          <div className="text-xl font-sans text-white">Top</div>
          <Star className="w-4 h-4 text-lime-400" />
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export const CodingHabitsSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      Coding Habits
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      You're a <span className="text-lime-300 italic">{data.habits.isNightOwl ? 'Night Owl' : 'Day Walker'}</span>.
    </motion.h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <Clock className="w-6 h-6 text-lime-400 mb-4" />
        <div className="text-lg text-gray-300 font-sans mb-1">Most active time</div>
        <div className="text-3xl font-serif text-white">{data.habits.activeTime}</div>
        <div className="text-sm text-gray-400 mt-2">{data.habits.isNightOwl ? 'Sleep is for the weak, right?' : 'Healthy sleep schedule detected.'}</div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <Calendar className="w-6 h-6 text-lime-400 mb-4" />
        <div className="text-lg text-gray-300 font-sans mb-1">Recent streak</div>
        <div className="text-3xl font-serif text-white">{data.habits.streak} Days</div>
        <div className="text-sm text-gray-400 mt-2">Unstoppable momentum.</div>
      </motion.div>
    </div>
  </motion.div>
);

export const LanguagesSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      Languages
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      You spoke <span className="text-lime-300 italic">{data.languages[0]?.name || 'Code'}</span> fluently.
    </motion.h1>
    
    <div className="space-y-6">
      {data.languages.map((lang: any) => (
        <motion.div key={lang.name} variants={itemVariants}>
          <div className="flex justify-between text-sm font-sans mb-2">
            <span className="text-white">{lang.name}</span>
            <span className="text-gray-400">{lang.percent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${lang.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${lang.percent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export const FunInsightsSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      Fun Insights
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      Wait, you did <span className="text-lime-300 italic">what?</span>
    </motion.h1>
    
    <div className="space-y-4">
      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-start gap-4">
        <Coffee className="w-8 h-8 text-lime-400 shrink-0 mt-1" />
        <div>
          <div className="text-xl font-serif text-white mb-2">You pushed {data.insights.lateNightCommits} commits between midnight and 5 AM.</div>
          <div className="text-gray-400 font-sans text-sm">{data.insights.lateNightCommits > 0 ? 'Are you okay? Do we need to send coffee?' : 'Wow, you actually sleep at night!'}</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-start gap-4">
        <Code2 className="w-8 h-8 text-lime-400 shrink-0 mt-1" />
        <div>
          <div className="text-xl font-serif text-white mb-2">You deleted more code than you wrote.</div>
          <div className="text-gray-400 font-sans text-sm">A true senior developer move. Less is more.</div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export const CollaborationSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl mx-auto"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-8">
      Collaboration
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-serif text-white mb-12">
      It takes a <span className="text-lime-300 italic">village</span>.
    </motion.h1>
    
    <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
      <Users className="w-12 h-12 text-lime-400 mx-auto mb-6" />
      <div className="text-2xl font-serif text-white mb-2">Top Collaborator</div>
      <div className="text-3xl md:text-4xl font-serif text-lime-300 italic mb-4 truncate">@{data.collab.topCollaborator}</div>
      <div className="text-gray-400 font-sans">You interacted with their repos the most. They owe you a drink.</div>
    </motion.div>
  </motion.div>
);

export const OutroSlide = ({ data }: { data: any }) => (
  <motion.div 
    className="flex flex-col items-center justify-center h-full text-center px-6"
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <motion.div variants={itemVariants} className="mb-6">
      <Trophy className="w-16 h-16 text-lime-400 mx-auto" />
    </motion.div>
    <motion.h2 variants={itemVariants} className="text-sm tracking-[0.2em] uppercase text-lime-400/80 font-sans font-semibold mb-4">
      Summary
    </motion.h2>
    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-serif text-white mb-6">
      You are a <br/><span className="text-lime-300 italic">{data.habits.isNightOwl ? 'Night Owl' : 'Code Artisan'}</span>
    </motion.h1>
    <motion.p variants={itemVariants} className="text-gray-400 font-sans mt-2 text-lg max-w-md mx-auto">
      Keep building, keep debugging, and keep pushing to main. See you next time.
    </motion.p>
  </motion.div>
);
