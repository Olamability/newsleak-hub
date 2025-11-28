// src/lib/followedTopics.ts
// MVP: Store followed topics/categories in localStorage

const FOLLOWED_KEY = 'newsleak_followed_topics';

export function getFollowedTopics(): string[] {
  const stored = localStorage.getItem(FOLLOWED_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function followTopic(topic: string) {
  const topics = getFollowedTopics();
  if (!topics.includes(topic)) {
    topics.push(topic);
    localStorage.setItem(FOLLOWED_KEY, JSON.stringify(topics));
  }
}

export function unfollowTopic(topic: string) {
  const topics = getFollowedTopics().filter(t => t !== topic);
  localStorage.setItem(FOLLOWED_KEY, JSON.stringify(topics));
}

export function isTopicFollowed(topic: string): boolean {
  return getFollowedTopics().includes(topic);
}
