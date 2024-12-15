var posts=["2024/12/03/hello-world/","2024/06/12/markdown/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };