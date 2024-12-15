var posts=["2024/12/15/2024-12-15-测试文章/","2024/06/12/markdown/","2024/12/03/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };