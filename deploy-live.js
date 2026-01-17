const ghpages = require('gh-pages');

console.log("🚀 Starting deployment to livesocer.com...");

ghpages.publish('out', {
  // Your Production Repo URL
  repo: 'https://github.com/helloajmal007-commits/livesocer.com.git',
  dotfiles: true,
  
  // CRITICAL FIX: Forces cache to be in root folder (Short Path)
  // This prevents the ENAMETOOLONG error on Windows
  cache: './.gh-pages-cache', 
  
  user: {
    name: 'Flash Sport Bot',
    email: 'bot@flashsport.com'
  }
}, function(err) {
  if (err) {
    console.error('❌ Deployment Failed:', err);
  } else {
    console.log('✅ Deployment Complete! Site should be live in a few minutes.');
  }
});