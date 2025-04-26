import { NextResponse } from 'next/server';

// 设置超时时间为5秒
const FETCH_TIMEOUT = 5000;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: '缺少URL参数' }, { status: 400 });
    }
    
    // 确保URL格式正确
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // 验证URL
    try {
      new URL(formattedUrl);
    } catch (err) {
      return NextResponse.json({ error: '无效的URL格式' }, { status: 400 });
    }
    
    // 创建一个可以超时的fetch请求
    const fetchWithTimeout = async (url: string, options = {}) => {
      const controller = new AbortController();
      const { signal } = controller;
      
      const timeout = setTimeout(() => {
        controller.abort();
      }, FETCH_TIMEOUT);
      
      try {
        const response = await fetch(url, { ...options, signal });
        clearTimeout(timeout);
        return response;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    };
    
    // 获取网页内容
    const response = await fetchWithTimeout(formattedUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `无法获取网页内容，状态码: ${response.status}` },
        { status: 500 }
      );
    }
    
    const html = await response.text();
    
    // 提取标题
    const titleMatch = html.match(/<title.*?>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // 提取描述 (meta description)
    const descriptionMatch = html.match(/<meta.*?name=["']description["'].*?content=["'](.*?)["'].*?>/i) || 
                            html.match(/<meta.*?content=["'](.*?)["'].*?name=["']description["'].*?>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // 尝试查找图标
    const faviconMatch = html.match(/<link.*?rel=["'](?:shortcut )?icon["'].*?href=["'](.*?)["'].*?>/i) ||
                         html.match(/<link.*?href=["'](.*?)["'].*?rel=["'](?:shortcut )?icon["'].*?>/i);
    
    let icon = '';
    if (faviconMatch && faviconMatch[1]) {
      // 处理相对URL
      const iconUrl = faviconMatch[1];
      if (iconUrl.startsWith('http')) {
        icon = iconUrl;
      } else if (iconUrl.startsWith('//')) {
        icon = `https:${iconUrl}`;
      } else {
        const baseUrl = new URL(formattedUrl);
        icon = new URL(iconUrl.startsWith('/') ? iconUrl : `/${iconUrl}`, baseUrl.origin).toString();
      }
    } else {
      // 使用默认favicon路径
      const baseUrl = new URL(formattedUrl);
      icon = `${baseUrl.origin}/favicon.ico`;
    }
    
    return NextResponse.json({
      title,
      description,
      icon,
      url: formattedUrl
    });
    
  } catch (error) {
    console.error('获取网站信息失败:', error);
    return NextResponse.json(
      { error: '获取网站信息失败，请检查URL或稍后重试' },
      { status: 500 }
    );
  }
} 