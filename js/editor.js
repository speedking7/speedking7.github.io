class MarkdownEditor {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.title = document.getElementById('post-title');
        this.categories = document.getElementById('post-categories');
        this.tags = document.getElementById('post-tags');
        
        // 工具栏按钮
        this.toolbar = {
            heading1: document.getElementById('heading1'),
            heading2: document.getElementById('heading2'),
            heading3: document.getElementById('heading3'),
            bold: document.getElementById('bold'),
            italic: document.getElementById('italic'),
            strikethrough: document.getElementById('strikethrough'),
            quote: document.getElementById('quote'),
            code: document.getElementById('code'),
            link: document.getElementById('link'),
            image: document.getElementById('image'),
            listUl: document.getElementById('list-ul'),
            listOl: document.getElementById('list-ol'),
            table: document.getElementById('table')
        };

        // 操作按钮
        this.saveDraft = document.getElementById('save-draft');
        this.publish = document.getElementById('publish');

        // 添加清除按钮
        const headerDiv = document.querySelector('.editor-header');
        const clearButton = document.createElement('button');
        clearButton.textContent = '清除内容';
        clearButton.className = 'btn btn-danger';
        clearButton.style.marginLeft = '10px';
        headerDiv.appendChild(clearButton);
        
        // 添加加载草稿按钮
        const loadButton = document.createElement('button');
        loadButton.textContent = '加载草稿';
        loadButton.className = 'btn';
        loadButton.style.marginLeft = '10px';
        headerDiv.appendChild(loadButton);

        // 保存按钮引用
        this.clearButton = clearButton;
        this.loadButton = loadButton;
    }

    initializeEventListeners() {
        // 实时预览
        this.editor.addEventListener('input', () => this.updatePreview());
        
        // 自动保存
        setInterval(() => this.autoSave(), 30000);

        // 工具栏事件
        this.toolbar.heading1.addEventListener('click', () => this.insertText('# ', ''));
        this.toolbar.heading2.addEventListener('click', () => this.insertText('## ', ''));
        this.toolbar.heading3.addEventListener('click', () => this.insertText('### ', ''));
        this.toolbar.bold.addEventListener('click', () => this.insertText('**', '**'));
        this.toolbar.italic.addEventListener('click', () => this.insertText('*', '*'));
        this.toolbar.strikethrough.addEventListener('click', () => this.insertText('~~', '~~'));
        this.toolbar.quote.addEventListener('click', () => this.insertText('> ', ''));
        this.toolbar.code.addEventListener('click', () => this.insertText('`', '`'));
        this.toolbar.link.addEventListener('click', () => this.insertLink());
        this.toolbar.image.addEventListener('click', () => this.insertImage());
        this.toolbar.listUl.addEventListener('click', () => this.insertText('- ', ''));
        this.toolbar.listOl.addEventListener('click', () => this.insertText('1. ', ''));
        this.toolbar.table.addEventListener('click', () => this.insertTable());

        // 保存和发布事件
        this.saveDraft.addEventListener('click', () => this.saveDraft());
        this.publish.addEventListener('click', () => this.publishPost());

        // 添加清除按钮事件
        this.clearButton.addEventListener('click', () => this.clearContent());
        
        // 添加加载草稿按钮事件
        this.loadButton.addEventListener('click', () => this.loadFromLocalStorage());
    }

    insertText(before, after) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        const selection = text.substring(start, end);
        
        this.editor.value = text.substring(0, start) + 
                           before + selection + after + 
                           text.substring(end);
        
        this.editor.focus();
        this.updatePreview();
    }

    insertLink() {
        const url = prompt('请输入链接地址:', 'https://');
        if (url) {
            this.insertText('[链接文字](', url + ')');
        }
    }

    insertImage() {
        const url = prompt('请输入图片地址:', 'https://');
        if (url) {
            this.insertText('![图片描述](', url + ')');
        }
    }

    insertTable() {
        const table = `
|  表头   | 表头  |
|  ----  | ----  |
| 单元格  | 单元格 |
| 单元格  | 单元格 |
`;
        this.insertText(table, '');
    }

    updatePreview() {
        // 这里可以集成 marked 或其他 Markdown 解析库
        let html = this.editor.value
            .replace(/#{6} (.+)/g, '<h6>$1</h6>')
            .replace(/#{5} (.+)/g, '<h5>$1</h5>')
            .replace(/#{4} (.+)/g, '<h4>$1</h4>')
            .replace(/#{3} (.+)/g, '<h3>$1</h3>')
            .replace(/#{2} (.+)/g, '<h2>$1</h2>')
            .replace(/#{1} (.+)/g, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/~~(.+?)~~/g, '<del>$1</del>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
            .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            .split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
        
        this.preview.innerHTML = html;
    }

    autoSave() {
        const content = {
            title: this.title.value,
            categories: this.categories.value,
            tags: this.tags.value,
            content: this.editor.value
        };
        localStorage.setItem('draft-content', JSON.stringify(content));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('draft-content');
        if (saved) {
            const content = JSON.parse(saved);
            this.title.value = content.title || '';
            this.categories.value = content.categories || '';
            this.tags.value = content.tags || '';
            this.editor.value = content.content || '';
            this.updatePreview();
        }
    }

    async saveDraft() {
        // 实现保存草稿逻辑
        this.autoSave();
        alert('草稿已保存！');
    }

    async publishPost() {
        if (!this.title.value.trim()) {
            alert('请输入文章标题！');
            return;
        }
        if (!this.editor.value.trim()) {
            alert('请输入文章内容！');
            return;
        }

        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const fileName = this.generateFileName(this.title.value);
                const content = this.generateFrontMatter();
                
                console.log(`尝试发送请求 (${retryCount + 1}/${maxRetries}):`, { fileName, content });

                const response = await fetch('/api/posts/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName,
                        content
                    })
                });

                console.log('响应状态:', response.status);
                const text = await response.text();
                console.log('响应内容:', text);

                if (!text.trim()) {
                    throw new Error('空响应');
                }

                const result = JSON.parse(text);

                if (response.ok && result.success) {
                    alert('文章发布成功！');
                    localStorage.removeItem('draft-content');
                    
                    // 使用 setTimeout 延迟跳转，避免消息通道关闭错误
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 100);
                    
                    return;
                } else {
                    throw new Error(result.error || '发布失败');
                }
            } catch (error) {
                console.error(`发布尝试 ${retryCount + 1} 失败:`, error);
                retryCount++;
                
                if (retryCount === maxRetries) {
                    // 使用 setTimeout 延迟显示错误消息
                    setTimeout(() => {
                        alert('发布失败: ' + (error.message || '未知错误'));
                    }, 100);
                    break;
                }
                
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
    }

    generateFileName(title) {
        const date = new Date().toISOString().split('T')[0];
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // 支持中文
            .replace(/(^-|-$)/g, '');
        return `${date}-${slug}.md`;
    }

    generateFrontMatter() {
        // 从 HTML 的 meta 标签或配置中获取作者信息
        const author = document.querySelector('meta[name="author"]')?.content || '瀛同学';
        const siteUrl = document.querySelector('meta[name="site-url"]')?.content || 'https://speedking7.github.io';
        const currentDate = new Date();
        
        // 格式化日期，确保月份是两位数
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const date = `${currentDate.getFullYear()}-${month}-${currentDate.getDate()}`;
        
        // 处理标签和分类，同时支持中文逗号和英文逗号
        const splitByComma = str => str.split(/[,，]/).map(t => t.trim()).filter(Boolean);
        const tags = splitByComma(this.tags.value);
        const categories = splitByComma(this.categories.value);
        
        const frontMatter = {
            title: this.title.value,
            date,
            updated: '',
            // 如果有多个标签或分类，使用数组格式
            tags: tags.length > 0 ? tags : '',
            categories: categories.length > 0 ? categories : '',
            keywords: '',
            description: '',
            top_img: '/img/default_cover.jpg',
            comments: '',
            cover: '/img/comment_bg.png',
            toc: '',
            toc_number: '',
            toc_style_simple: '',
            copyright: true,
            copyright_author: author,
            copyright_author_href: `${siteUrl}/`,
            copyright_url: `${siteUrl}/`,
            copyright_info: `此文章版权归${author}所有，如有转载，请注明来自原作者`,
            mathjax: '',
            katex: '',
            aplayer: '',
            highlight_shrink: '',
            aside: '',
            swiper_index: 1,
            top_group_index: 1,
            background: '#fff'
        };

        // 生成 YAML 格式的 front-matter
        const yaml = Object.entries(frontMatter)
            .map(([key, value]) => {
                // 如果值为空字符串，只输出键名
                if (value === '') {
                    return `${key}:`;
                }
                // 如果是数组，使用 YAML 数组格式
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        return `${key}:`;
                    }
                    return `${key}:\n${value.map(item => `  - ${item}`).join('\n')}`;
                }
                // 其他情况正常输出键值对
                return `${key}: ${value}`;
            })
            .join('\n');

        return `---\n${yaml}\n---\n\n${this.editor.value}`;
    }

    // 添加清除内容方法
    clearContent() {
        if (confirm('确定要清除所有内容吗？')) {
            this.title.value = '';
            this.categories.value = '';
            this.tags.value = '';
            this.editor.value = '';
            this.updatePreview();
            localStorage.removeItem('draft-content');
        }
    }
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownEditor();
}); 