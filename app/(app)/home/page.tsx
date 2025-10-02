"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Image as ImageIcon, ChevronDown, ChevronUp, Send } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const loadPosts = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await api.getPosts(pageNum, 10);
      console.log("Posts data:", data, "Page:", pageNum, "Count:", data.length);

      if (pageNum === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }

      const hasMorePosts = data.length === 10;
      console.log("Setting hasMore to:", hasMorePosts);
      setHasMore(hasMorePosts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts(1);
    }
  }, [user, loadPosts]);

  useEffect(() => {
    let isLoading = false;

    const handleScroll = () => {
      if (isLoading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Check if user has scrolled near the bottom (within 200px)
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        console.log("Near bottom - scrollTop:", scrollTop, "clientHeight:", clientHeight, "scrollHeight:", scrollHeight);
        console.log("hasMore:", hasMore, "loadingMore:", loadingMore, "page:", page);

        if (hasMore && !loadingMore && !isLoading) {
          console.log("Loading more posts, page:", page + 1);
          isLoading = true;
          const nextPage = page + 1;
          setPage(nextPage);
          loadPosts(nextPage).finally(() => {
            isLoading = false;
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    console.log("Scroll listener attached");

    return () => {
      window.removeEventListener('scroll', handleScroll);
      isLoading = false;
    };
  }, [hasMore, loadingMore, loadPosts, page]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !postTitle.trim()) return;

    setSubmitting(true);
    try {
      await api.createPost(postTitle, postContent, selectedImage || undefined);
      setPostContent("");
      setPostTitle("");
      setSelectedImage(null);
      setImagePreview(null);
      setPage(1);
      await loadPosts(1);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.toggleReaction(postId);
      setPage(1);
      await loadPosts(1);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleComment = async (postId: number) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await api.createComment(postId, content);
      setCommentInputs({ ...commentInputs, [postId]: "" });
      setPage(1);
      await loadPosts(1);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Create Post */}
        <Card className="shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-900 text-white">{user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">Create a post</h2>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <Input
                placeholder="Post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="border-gray-300 focus:border-gray-400"
                maxLength={100}
              />
              <Textarea
                placeholder="What's happening in your world?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[80px] resize-none border-gray-300 focus:border-gray-400"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-400">
                {postContent.length}/500
              </div>

              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 object-cover w-full" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <label htmlFor="image-upload">
                    <Button type="button" variant="ghost" size="sm" asChild>
                      <span className="cursor-pointer">
                        <ImageIcon className="w-5 h-5 sm:mr-1" />
                        <span className="hidden sm:inline">Photo</span>
                      </span>
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !postContent.trim() || !postTitle.trim()}
                  className="bg-gray-600 hover:bg-gray-700 px-4 sm:px-6 w-full sm:w-auto"
                >
                  {submitting ? "Posting..." : "Share Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-5">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-md border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {post.author?.name?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{post.author?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  {post.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  )}
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="rounded-xl w-full mb-3 object-cover max-h-96"
                  />
                )}

                <div className="flex items-center gap-6 py-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.reaction_count || post._count?.reactions || 0}</span>
                  </button>
                  <button
                    onClick={async () => {
                      const commentCount = post.comment_count || post._count?.comments || 0;
                      const currentPostId = post.id;
                      console.log("Clicked Post ID:", currentPostId, "Comment count:", commentCount, "Has comments:", post.comments, "Current expanded state:", expandedComments[currentPostId]);

                      if (commentCount > 0) {
                        const isCurrentlyExpanded = expandedComments[currentPostId];

                        // If collapsing, just toggle state
                        if (isCurrentlyExpanded) {
                          setExpandedComments(prev => {
                            const newState = { ...prev, [currentPostId]: false };
                            console.log("Collapsing - New expanded state:", newState);
                            return newState;
                          });
                          return;
                        }
                        // Expand only this post
                        setExpandedComments(prev => {
                          const newState = { ...prev, [currentPostId]: true };
                          console.log("Expanding - New expanded state:", newState);
                          return newState;
                        });
                      }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comment_count || post._count?.comments || 0}</span>
                    {(post.comment_count || post._count?.comments || 0) > 0 && (
                      expandedComments[post.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Comment Input - Always visible */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {/* Existing Comments - Show/Hide on click (between divider and text field) */}
                  {(() => {
                    const isExpanded = expandedComments[post.id];
                    const hasComments = post.comments && post.comments.length > 0;
                    console.log(`Post ${post.id} - Expanded: ${isExpanded}, Has comments: ${hasComments}, Comments:`, post.comments);
                    return isExpanded && hasComments && (
                      <div className="space-y-3 mb-3">
                        {post.comments!.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-300 text-gray-700">
                                {comment.author?.name?.[0].toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                              <p className="font-semibold text-sm text-gray-900">{comment.author?.name || "Unknown"}</p>
                              <p className="text-sm text-gray-800">{comment.content}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-200">{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleComment(post.id);
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      className="rounded-lg bg-gray-600 hover:bg-gray-700"
                    >
                      <Send />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Infinite scroll observer target */}
          {hasMore && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {loadingMore ? (
                <p className="text-gray-500">Loading more posts...</p>
              ) : (
                <p className="text-gray-400 text-sm">Scroll for more</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
