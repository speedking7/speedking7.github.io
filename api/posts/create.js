const fs = require('fs');
const path = require('path');

module.exports = async function(req, res) {
    try {
        const { fileName, content } = req.body;
        
        // 文章保存路径
        const postsDir = path.join(process.cwd(), 'source', '_posts');
        const filePath = path.join(postsDir, fileName);

        // 确保目录存在
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(filePath, content, 'utf8');

        // 重新生成站点
        const hexo = req.app.locals.hexo;
        await hexo.load();
        await hexo.call('generate', {});

        res.json({ success: true });
    } catch (error) {
        console.error('创建文章失败：', error);
        res.status(500).json({ error: error.message });
    }
}; 