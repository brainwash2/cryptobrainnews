'use client';
import { useArticleView } from '@/hooks/useArticleView';
 
interface Props { articleId: string; title: string; category: string; }
 
export default function ViewTracker({ articleId, title, category }: Props) {
  useArticleView(articleId, title, category);
  return null; // renders nothing
}
