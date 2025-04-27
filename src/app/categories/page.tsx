'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { createCategory, deleteCategory, getCategories, updateCategory, updateCategoryOrder } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiX, FiCheck, FiArrowUp, FiArrowDown, FiMove, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import useConfirmDialog from '@/components/useConfirmDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();
  const [isSortMode, setIsSortMode] = useState(false);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  useEffect(() => {
    checkUser();
  }, [router]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      router.push('/login');
      return;
    }
    
    setUser(data.session.user);
    fetchCategories();
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setSortedCategories([...data]);
    } catch (error) {
      console.error('获取分类失败', error);
      setError('获取分类失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('分类名称不能为空');
      return;
    }

    setIsLoading(true);
    try {
      const newCategory = await createCategory({ name: newCategoryName.trim() });
      // 直接更新本地分类列表，避免重新获取
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setError(null);
    } catch (error) {
      console.error('添加分类失败', error);
      setError('添加分类失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) {
      setError('分类名称不能为空');
      return;
    }

    setIsLoading(true);
    try {
      // 1. 更新分类表中的分类名称
      await updateCategory(editingCategory.id, { name: editName.trim() });
      
      // 2. 同步更新所有使用该分类的书签中的分类名称
      const { error: updateBookmarksError } = await supabase
        .from('bookmarks')
        .update({ category: editName.trim() })
        .eq('category_id', editingCategory.id);
      
      if (updateBookmarksError) {
        console.error('更新书签分类名称失败:', updateBookmarksError);
        setError('更新书签分类名称失败，请重试');
        setIsLoading(false);
        return;
      }
      
      // 3. 同步更新公共书签表中的分类名称
      const { error: updatePublicBookmarksError } = await supabase
        .from('public_bookmarks')
        .update({ category: editName.trim() })
        .eq('category_id', editingCategory.id);
      
      if (updatePublicBookmarksError) {
        console.error('更新公共书签分类名称失败:', updatePublicBookmarksError);
        // 这里只记录错误但不中断流程，因为公共书签是次要功能
      }
      
      // 4. 本地更新分类列表，避免重新获取导致页面刷新
      const updatedCategories = categories.map(category => 
        category.id === editingCategory.id 
          ? { ...category, name: editName.trim() } 
          : category
      );
      setCategories(updatedCategories);
      
      // 如果在排序模式，同时更新排序列表
      if (isSortMode) {
        const updatedSortedCategories = sortedCategories.map(category => 
          category.id === editingCategory.id 
            ? { ...category, name: editName.trim() } 
            : category
        );
        setSortedCategories(updatedSortedCategories);
      }
      
      setEditingCategory(null);
      setError(null);
    } catch (error) {
      console.error('更新分类失败', error);
      setError('更新分类失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      // 简化确认对话框，只询问是否删除分类及其相关书签
      const confirmed = await confirm({
        title: '删除分类',
        message: `您确定要删除"${name}"分类吗？该操作将同时删除该分类下的所有书签。`,
        type: 'danger',
        confirmText: '确认删除',
        cancelText: '取消'
      });
      
      if (!confirmed) return;
      
      // 开始执行删除操作
      setIsLoading(true);
      setError(null);
      
      try {
        // 先获取分类下的所有书签
        const { data: bookmarks, error: fetchError } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('category_id', id);
          
        if (fetchError) {
          console.error('获取书签失败:', fetchError);
          throw new Error(`获取书签失败: ${fetchError.message}`);
        }
        
        if (bookmarks && bookmarks.length > 0) {
          // 删除分类下的所有书签
          const { error: deleteError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('category_id', id);
            
          if (deleteError) {
            console.error('删除书签失败:', deleteError);
            throw new Error(`删除书签失败: ${deleteError.message}`);
          }
        }
        
        // 最后删除分类
        await deleteCategory(id);
        
        // 本地更新分类列表，避免重新获取
        setCategories(categories.filter(category => category.id !== id));
        
      } catch (error: any) {
        console.error('删除分类或操作书签失败:', error);
        setError(`操作失败: ${error?.message || '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('删除分类流程错误:', error);
      setError(`删除分类失败: ${error?.message || '未知错误'}`);
      setIsLoading(false);
    }
  };

  // 切换排序模式
  const toggleSortMode = () => {
    if (isSortMode) {
      // 退出排序模式时保存顺序
      saveCategoryOrder();
    } else {
      // 进入排序模式
      setSortedCategories([...categories]);
      setIsSortMode(true);
    }
  };

  // 上移分类
  const moveUp = (index: number) => {
    if (index === 0) return; // 已经是第一个
    const newSortedCategories = [...sortedCategories];
    const temp = newSortedCategories[index];
    newSortedCategories[index] = newSortedCategories[index - 1];
    newSortedCategories[index - 1] = temp;
    setSortedCategories(newSortedCategories);
  };

  // 下移分类
  const moveDown = (index: number) => {
    if (index === sortedCategories.length - 1) return; // 已经是最后一个
    const newSortedCategories = [...sortedCategories];
    const temp = newSortedCategories[index];
    newSortedCategories[index] = newSortedCategories[index + 1];
    newSortedCategories[index + 1] = temp;
    setSortedCategories(newSortedCategories);
  };

  // 保存排序顺序
  const saveCategoryOrder = async () => {
    setIsLoading(true);
    try {
      // 为每个分类分配一个顺序号
      const orderedCategories = sortedCategories.map((category, index) => ({
        id: category.id,
        sort_order: index
      }));
      
      // 调用API批量更新分类顺序
      await updateCategoryOrder(orderedCategories);
      
      // 直接将排序后的分类设置为当前分类列表，避免重新获取导致页面刷新
      setCategories([...sortedCategories]);
      
      // 退出排序模式
      setIsSortMode(false);
      
    } catch (error) {
      console.error('保存分类顺序失败:', error);
      setError('保存分类顺序失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 拖拽开始
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (draggedItem !== null && dragOverItem !== null) {
      // 创建新的排序数组
      const newSortedCategories = [...sortedCategories];
      const itemToMove = newSortedCategories[draggedItem];
      
      // 从原位置删除
      newSortedCategories.splice(draggedItem, 1);
      // 插入到新位置
      newSortedCategories.splice(dragOverItem, 0, itemToMove);
      
      // 更新状态
      setSortedCategories(newSortedCategories);
    }
    
    // 重置拖拽状态
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // 允许放置
    setDragOverItem(index);
  };

  // CSS类名生成函数，根据拖拽状态返回不同的类名
  const getDragItemClasses = (index: number) => {
    let baseClasses = `p-3 rounded-lg transition-all duration-200 ${
      isSortMode ? 'bg-primary/5 cursor-move flex items-center' : 'hover:bg-primary/5'
    }`;
    
    if (isSortMode) {
      if (draggedItem === index) {
        // 正在拖拽的元素
        baseClasses += ' opacity-50 scale-105 shadow-lg border-2 border-primary';
      } else if (dragOverItem === index) {
        // 拖拽目标
        baseClasses += ' border-2 border-primary border-dashed bg-primary/10 transform scale-102 drag-pulse';
      } else {
        // 其他元素
        baseClasses += ' border-2 border-transparent';
      }
    }
    
    return baseClasses;
  };

  // 处理元素进入拖拽区域
  const handleDragEnter = (index: number) => {
    setDragOverItem(index);
  };
  
  // 处理元素离开拖拽区域
  const handleDragLeave = () => {
    // 可以选择保留当前的dragOverItem，或设为null
    // setDragOverItem(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {dialog}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-textPrimary">分类管理</h1>
        <div className="flex space-x-3">
          {!isSortMode && (
            <button
              onClick={() => fetchCategories()}
              className="cartoon-btn-secondary flex items-center"
              disabled={isLoading}
            >
              <FiRefreshCw className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} /> 刷新
            </button>
          )}
          <button
            onClick={toggleSortMode}
            className={`cartoon-btn-secondary flex items-center ${isSortMode ? 'bg-primary text-white' : ''}`}
          >
            <FiMove className="mr-1" /> {isSortMode ? '保存排序' : '排序分类'}
          </button>
          <Link href="/bookmarks" className="cartoon-btn-secondary flex items-center">
            <FiArrowLeft className="mr-1" /> 返回书签
          </Link>
        </div>
      </div>

      {/* 添加新分类 */}
      {!isSortMode && (
        <div className="cartoon-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">添加新分类</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="flex">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入分类名称"
                className="cartoon-input w-full"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="cartoon-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '添加中...' : '添加分类'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 分类列表 */}
      <div className="cartoon-card p-6">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">
          {isSortMode ? '拖动分类调整顺序' : '我的分类'}
        </h2>
        
        {categories.length === 0 ? (
          <p className="text-textSecondary py-4">您还没有添加任何分类</p>
        ) : (
          <ul className="space-y-3 mt-2">
            {(isSortMode ? sortedCategories : categories).map((category, index) => (
              <li 
                key={category.id} 
                className={getDragItemClasses(index)}
                draggable={isSortMode}
                onDragStart={isSortMode ? () => handleDragStart(index) : undefined}
                onDragEnd={isSortMode ? handleDragEnd : undefined}
                onDragOver={isSortMode ? (e) => handleDragOver(e, index) : undefined}
                onDragEnter={isSortMode ? () => handleDragEnter(index) : undefined}
                onDragLeave={isSortMode ? handleDragLeave : undefined}
              >
                {isSortMode ? (
                  <>
                    <div className="flex items-center space-x-2 text-textSecondary">
                      <FiMove size={18} className="text-primary" />
                    </div>
                    <span className="text-lg font-medium text-textPrimary flex-1 ml-2">
                      {category.name}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded-full ${
                          index === 0 ? 'text-gray-400' : 'text-primary hover:bg-primary/10'
                        }`}
                        title="上移"
                      >
                        <FiArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === sortedCategories.length - 1}
                        className={`p-2 rounded-full ${
                          index === sortedCategories.length - 1 
                            ? 'text-gray-400' 
                            : 'text-primary hover:bg-primary/10'
                        }`}
                        title="下移"
                      >
                        <FiArrowDown size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  editingCategory && editingCategory.id === category.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="cartoon-input flex-1"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateCategory}
                        className="cartoon-btn-primary p-3"
                        title="保存"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="cartoon-btn-secondary p-3"
                        title="取消"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between w-full items-center">
                      <span className="text-lg font-medium text-textPrimary">{category.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-secondary hover:bg-secondary/10 p-2 rounded-full inline-flex transition-colors"
                          aria-label="编辑"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-accent hover:bg-accent/10 p-2 rounded-full inline-flex transition-colors"
                          aria-label="删除"
                          disabled={isLoading}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 