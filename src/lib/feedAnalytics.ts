// Local feed analytics stub
export async function trackFeedInteraction(feedId: string, userId?: string) {
  const interactions = JSON.parse(localStorage.getItem('newsleak_feed_interactions') || '[]');
  interactions.push({ feedId, userId: userId || 'anonymous', timestamp: new Date().toISOString() });
  localStorage.setItem('newsleak_feed_interactions', JSON.stringify(interactions));
}
